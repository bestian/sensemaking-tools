#!/usr/bin/env bash

# Run a local HTML report for a given Polis export.
#
# Usage:
#   run_local_html_report.sh [options]
#
# Options:
#   --export-base-url <url>  The base URL of the Polis export (default: https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx)
#   --work-dir <dir>         The directory to store the report (default: ./tmp/local-report under this script's directory)
#   --report-title <title>   The title of the report (default: Bloom Civic AI Report)
#   --report-subtitle <subtitle> The subtitle of the report (default: Structured public-input analysis generated locally with LM Studio.)
#   --report-question <question> The question of the report (default: How should AI care for our communities, and who gets to decide?)
#   --additional-context <context> The additional context of the report (default: This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience.)
#   --model <model>         The model to use for the report (default: nvidia/nemotron-3-nano-4b)
#   --lmstudio-base-url <url> The base URL of the LM Studio instance (default: http://127.0.0.1:1234/v1)
#   --batch-size <count>    Categorization batch size for local model calls (default: 20)
#   --outputLang <language> Output language for generated report data and UI labels (default: en).
#                           Supported: en (English), zh-TW (繁體中文), zh-CN (简体中文), fr (Français), es (Español), ja (日本語), de (Deutsch)
#   --skip-LLM              Skip data generation and use existing JSON files to build HTML only.
#   --python-bin <path>     Python interpreter path (default: ${ROOT_DIR}/.venv/bin/python if present, otherwise python3)

# Exit on error, unset variables, and pipefail.

# Example usage (all options):
#   bash ./run_local_html_report.sh \
#     --export-base-url "https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx" \
#     --work-dir "./tmp/local-report" \
#     --report-title "Bloom Civic AI Report" \
#     --report-subtitle "Structured public-input analysis generated locally with LM Studio." \
#     --report-question "How should AI care for our communities, and who gets to decide?" \
#     --additional-context "This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience." \
#     --model "nvidia/nemotron-3-nano-4b" \
#     --lmstudio-base-url "http://127.0.0.1:1234/v1" \
#     --batch-size "20" \
#     --outputLang "zh-TW" \
#     --skip-LLM \
#     --python-bin "${ROOT_DIR}/.venv/bin/python"


set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORT_BASE_URL="${EXPORT_BASE_URL:-https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx}"
WORK_DIR="${WORK_DIR:-${ROOT_DIR}/tmp/local-report}"
REPORT_TITLE="${REPORT_TITLE:-Bloom Civic AI Report}"
REPORT_SUBTITLE="${REPORT_SUBTITLE:-Structured public-input analysis generated locally with LM Studio.}"
REPORT_QUESTION="${REPORT_QUESTION:-How should AI care for our communities, and who gets to decide?}"
ADDITIONAL_CONTEXT="${ADDITIONAL_CONTEXT:-This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience.}"
MODEL_NAME="${MODEL_NAME:-nvidia/nemotron-3-nano-4b}"
LM_STUDIO_BASE_URL="${LM_STUDIO_BASE_URL:-http://127.0.0.1:1234/v1}"
LM_STUDIO_BATCH_SIZE="${LM_STUDIO_BATCH_SIZE:-20}"
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
    --lmstudio-base-url)
      LM_STUDIO_BASE_URL="$2"
      shift 2
      ;;
    --batch-size)
      LM_STUDIO_BATCH_SIZE="$2"
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

if [[ "${WORK_DIR}" == "/tmp/local-report" ]]; then
  echo "Detected /tmp/local-report (likely from an empty ROOT_DIR in your shell); using project-local tmp instead."
  WORK_DIR="${ROOT_DIR}/tmp/local-report"
fi

echo "Using work directory: ${WORK_DIR}"

RAW_DIR="${WORK_DIR}/raw"
GENERATED_BASENAME="${WORK_DIR}/generated/local-report"
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
  download_export "summary"
  download_export "comments"
  download_export "votes"
  download_export "participant-votes"
  download_export "comment-groups"

  SOURCE_URL="$(extract_source_url "${RAW_DIR}/summary.csv")"

  if command -v lms >/dev/null 2>&1; then
    echo "Reloading ${MODEL_NAME} in LM Studio with safe local settings"
    lms unload "${MODEL_NAME}" >/dev/null 2>&1 || true

    set +e
    LMS_LOAD_OUTPUT="$(
      lms load "${MODEL_NAME}" \
        --context-length 16384 \
        --parallel 1 \
        --gpu max \
        --identifier "${MODEL_NAME}" \
        -y 2>&1
    )"
    LMS_LOAD_EXIT_CODE=$?
    set -e

    if [[ ${LMS_LOAD_EXIT_CODE} -ne 0 ]]; then
      if [[ "${LMS_LOAD_OUTPUT}" == *"already exists"* ]]; then
        echo "LM Studio model identifier already exists; reusing loaded model ${MODEL_NAME}."
      else
        echo "${LMS_LOAD_OUTPUT}" >&2
        exit ${LMS_LOAD_EXIT_CODE}
      fi
    else
      echo "${LMS_LOAD_OUTPUT}"
    fi
  fi

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

  echo "Generating structured report data with local model ${MODEL_NAME}"
  npx ts-node "${ROOT_DIR}/library/runner-cli/advanced_runner_lmstudio.ts" \
    --inputFile "${WORK_DIR}/processed-comments.csv" \
    --outputBasename "${GENERATED_BASENAME}" \
    --additionalContext "${ADDITIONAL_CONTEXT}" \
    --model "${MODEL_NAME}" \
    --baseUrl "${LM_STUDIO_BASE_URL}" \
    --batchSize "${LM_STUDIO_BATCH_SIZE}" \
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
