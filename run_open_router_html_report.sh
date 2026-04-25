#!/usr/bin/env bash

# Run an HTML report for a given Polis export, using an OpenRouter model.
#
# Usage:
#   run_open_router_html_report.sh [options]
#
# Options:
#   --export-base-url <url>      The base URL of the Polis export (default: https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx)
#   --work-dir <dir>             The directory to store the report (default: ./tmp/open-router-report under this script's directory)
#   --report-title <title>       The title of the report (default: Sensemaker Report)
#   --report-subtitle <subtitle> The subtitle of the report (default: Structured public-input analysis generated with OpenRouter.)
#   --report-question <question> The question of the report (default: How should AI care for our communities, and who gets to decide?)
#   --additional-context <ctx>   Additional context describing the conversation
#   --model <model>              OpenRouter model identifier (default: openai/gpt-oss-120b, or $OPENROUTER_MODEL)
#   --open-router-api-key <key>  OpenRouter API key (required, or set OPENROUTER_API_KEY in env / library/.env)
#   --outputLang <language>      Output language (default: en).
#                                Supported: en, zh-TW, zh-CN, fr, es, ja, de
#   --skip-LLM                   Skip data generation and use existing JSON files to build HTML only.
#   --python-bin <path>          Python interpreter path (default: ${ROOT_DIR}/.venv/bin/python if present, otherwise python3)
#
# Example usage (all options):
#   bash ./run_open_router_html_report.sh \
#     --export-base-url "https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx" \
#     --work-dir "./tmp/open-router-report" \
#     --report-title "Bloom Civic AI Report" \
#     --report-subtitle "Structured public-input analysis generated with OpenRouter." \
#     --report-question "How should AI care for our communities, and who gets to decide?" \
#     --additional-context "This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience." \
#     --model "openai/gpt-oss-120b" \
#     --open-router-api-key "sk-or-..." \
#     --outputLang "zh-TW" \
#     --skip-LLM \
#     --python-bin "${ROOT_DIR}/.venv/bin/python"

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORT_BASE_URL="${EXPORT_BASE_URL:-https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx}"
WORK_DIR="${WORK_DIR:-${ROOT_DIR}/tmp/open-router-report}"
REPORT_TITLE="${REPORT_TITLE:-Sensemaker Report}"
REPORT_SUBTITLE="${REPORT_SUBTITLE:-Structured public-input analysis generated with OpenRouter.}"
REPORT_QUESTION="${REPORT_QUESTION:-How should AI care for our communities, and who gets to decide?}"
ADDITIONAL_CONTEXT="${ADDITIONAL_CONTEXT:-This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience.}"
MODEL_NAME="${MODEL_NAME:-${OPENROUTER_MODEL:-openai/gpt-oss-120b}}"
OPEN_ROUTER_API_KEY="${OPEN_ROUTER_API_KEY:-${OPENROUTER_API_KEY:-}}"
OUTPUT_LANG="${OUTPUT_LANG:-en}"
SKIP_LLM="${SKIP_LLM:-false}"
PYTHON_BIN="${PYTHON_BIN:-}"

if [[ -z "${PYTHON_BIN}" ]]; then
  if [[ -x "${ROOT_DIR}/.venv/bin/python" ]]; then
    PYTHON_BIN="${ROOT_DIR}/.venv/bin/python"
  else
    PYTHON_BIN="python3"
  fi
fi

echo "Using Python interpreter: ${PYTHON_BIN}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --export-base-url)
      EXPORT_BASE_URL="$2"
      shift 2
      ;;
    --work-dir)
      WORK_DIR="$2"
      shift 2
      ;;
    --report-title)
      REPORT_TITLE="$2"
      shift 2
      ;;
    --report-subtitle)
      REPORT_SUBTITLE="$2"
      shift 2
      ;;
    --report-question)
      REPORT_QUESTION="$2"
      shift 2
      ;;
    --additional-context)
      ADDITIONAL_CONTEXT="$2"
      shift 2
      ;;
    --model)
      MODEL_NAME="$2"
      shift 2
      ;;
    --open-router-api-key)
      OPEN_ROUTER_API_KEY="$2"
      shift 2
      ;;
    --outputLang)
      OUTPUT_LANG="$2"
      shift 2
      ;;
    --skip-LLM)
      SKIP_LLM="true"
      shift
      ;;
    --python-bin)
      PYTHON_BIN="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

resolve_work_dir() {
  local value="$1"

  if [[ "${value}" == '${ROOT_DIR}'* ]]; then
    value="${ROOT_DIR}${value#\$\{ROOT_DIR\}}"
  elif [[ "${value}" == '$ROOT_DIR'* ]]; then
    value="${ROOT_DIR}${value#\$ROOT_DIR}"
  elif [[ "${value}" != /* ]]; then
    value="${ROOT_DIR}/${value#./}"
  fi

  printf '%s' "${value}"
}

WORK_DIR="$(resolve_work_dir "${WORK_DIR}")"

if [[ "${WORK_DIR}" == "/tmp/open-router-report" ]]; then
  echo "Detected /tmp/open-router-report (likely from an empty ROOT_DIR in your shell); using project-local tmp instead."
  WORK_DIR="${ROOT_DIR}/tmp/open-router-report"
fi

echo "Using work directory: ${WORK_DIR}"

RAW_DIR="${WORK_DIR}/raw"
GENERATED_BASENAME="${WORK_DIR}/generated/open-router-report"
FINAL_HTML="${WORK_DIR}/report.html"
TOPICS_JSON="${GENERATED_BASENAME}-topic-stats.json"
SUMMARY_JSON="${GENERATED_BASENAME}-summary.json"
COMMENTS_JSON="${GENERATED_BASENAME}-comments-with-scores.json"

TOPICS_JSON="$(resolve_work_dir "${TOPICS_JSON}")"
SUMMARY_JSON="$(resolve_work_dir "${SUMMARY_JSON}")"
COMMENTS_JSON="$(resolve_work_dir "${COMMENTS_JSON}")"

mkdir -p "${RAW_DIR}" "${WORK_DIR}/generated"

download_export() {
  local name="$1"
  echo "Downloading ${name}.csv"
  curl -L -sS -o "${RAW_DIR}/${name}.csv" "${EXPORT_BASE_URL}/${name}.csv"
}

extract_source_url() {
  local summary_csv="$1"
  "${PYTHON_BIN}" - <<'PY' "${summary_csv}"
import csv
import sys

with open(sys.argv[1], newline="", encoding="utf-8") as fh:
    reader = csv.reader(fh)
    for row in reader:
        if len(row) >= 2 and row[0] == "url":
            print(row[1])
            break
PY
}

SOURCE_URL=""
if [[ "${SKIP_LLM}" == "true" ]]; then
  echo "Skipping LLM pipeline and reusing generated data files."

  for required_file in "${TOPICS_JSON}" "${SUMMARY_JSON}" "${COMMENTS_JSON}"; do
    if [[ ! -f "${required_file}" ]]; then
      echo "Missing required generated file: ${required_file}" >&2
      echo "Run without --skip-LLM first to generate report data." >&2
      exit 1
    fi
  done

  if [[ -f "${RAW_DIR}/summary.csv" ]]; then
    SOURCE_URL="$(extract_source_url "${RAW_DIR}/summary.csv")"
  else
    echo "No existing ${RAW_DIR}/summary.csv found; source URL metadata will be empty."
  fi
else
  if [[ -z "${OPEN_ROUTER_API_KEY}" ]]; then
    echo "Missing OpenRouter API key." >&2
    echo "Pass --open-router-api-key or set OPENROUTER_API_KEY in your environment / library/.env." >&2
    exit 1
  fi

  download_export "summary"
  download_export "comments"
  download_export "votes"
  download_export "participant-votes"
  download_export "comment-groups"

  SOURCE_URL="$(extract_source_url "${RAW_DIR}/summary.csv")"

  echo "Converting Polis export to sensemaking input"
  "${PYTHON_BIN}" - <<'PY'
import importlib.util
import sys

if importlib.util.find_spec("pandas") is None:
    sys.stderr.write(
        "Missing Python dependency: pandas\n"
        "Please install dependencies in your venv, e.g.:\n"
        "  python -m venv .venv\n"
        "  . .venv/bin/activate\n"
        "  pip install -r requirements.txt\n"
    )
    sys.exit(1)
PY

  "${PYTHON_BIN}" "${ROOT_DIR}/library/bin/process_polis_data.py" \
    "${RAW_DIR}" \
    --participants-votes "${RAW_DIR}/participant-votes.csv" \
    -o "${WORK_DIR}/processed-comments.csv"

  echo "Generating structured report data with OpenRouter model ${MODEL_NAME}"
  OPENROUTER_API_KEY="${OPEN_ROUTER_API_KEY}" \
  npx ts-node "${ROOT_DIR}/library/runner-cli/advanced_runner_open_router.ts" \
    --inputFile "${WORK_DIR}/processed-comments.csv" \
    --outputBasename "${GENERATED_BASENAME}" \
    --additionalContext "${ADDITIONAL_CONTEXT}" \
    --model "${MODEL_NAME}" \
    --apiKey "${OPEN_ROUTER_API_KEY}" \
    --outputLang "${OUTPUT_LANG}" \
    --topicDepth 2
fi

if [[ "${SKIP_LLM}" == "false" ]]; then
  for required_file in "${TOPICS_JSON}" "${SUMMARY_JSON}" "${COMMENTS_JSON}"; do
    if [[ ! -f "${required_file}" ]]; then
      echo "Expected generated file is missing: ${required_file}" >&2
      exit 1
    fi
  done
fi

ensure_node_dependencies() {
  # Workspace install at repo root (covers library/, web-ui/, visualization-library/)
  if [[ ! -d "${ROOT_DIR}/node_modules" ]] \
     || [[ ! -d "${ROOT_DIR}/web-ui/node_modules" ]] \
     || [[ ! -d "${ROOT_DIR}/node_modules/@conversationai/sensemaker-visualizations" ]]; then
    echo "Node dependencies missing; running 'npm install' at repo root..."
    (cd "${ROOT_DIR}" && npm install)
  fi

  # The visualization-library is a workspace package consumed by web-ui via its
  # built dist/ output. Without it, web-ui's bundle step fails to resolve
  # '@conversationai/sensemaker-visualizations'. Build it on demand.
  local viz_dir="${ROOT_DIR}/visualization-library"
  local viz_dist="${viz_dir}/dist/sensemaker-chart.es.js"
  if [[ ! -f "${viz_dist}" ]]; then
    if [[ ! -d "${viz_dir}/node_modules" ]]; then
      echo "Installing visualization-library dependencies..."
      (cd "${viz_dir}" && npm install)
    fi
    echo "Building visualization-library (vite build)..."
    (cd "${viz_dir}" && npm run build)
  fi
}

ensure_node_dependencies

GENERATED_AT="$(date -u +"%Y-%m-%d %H:%M UTC")"

echo "Building HTML report"
(
  cd "${ROOT_DIR}/web-ui"
  npx ts-node site-build.ts \
    --topics "${TOPICS_JSON}" \
    --summary "${SUMMARY_JSON}" \
    --comments "${COMMENTS_JSON}" \
    --reportTitle "${REPORT_TITLE}" \
    --reportSubtitle "${REPORT_SUBTITLE}" \
    --reportQuestion "${REPORT_QUESTION}" \
    --sourceUrl "${SOURCE_URL}" \
    --modelName "${MODEL_NAME}" \
    --generatedAt "${GENERATED_AT}" \
    --outputLang "${OUTPUT_LANG}"
  node single-html-build.js
)

cp "${ROOT_DIR}/web-ui/dist/bundled/report.html" "${FINAL_HTML}"
echo
echo "Report ready:"
echo "${FINAL_HTML}"
