#!/usr/bin/env bash

# Run a local HTML report for a given Polis export.
#
# Usage:
#   run_local_html_report.sh [options]
#
# Options:
#   --export-base-url <url>  The base URL of the Polis export (default: https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx)
#   --work-dir <dir>         The directory to store the report (default: ${ROOT_DIR}/tmp/local-report)
#   --report-title <title>   The title of the report (default: Bloom Civic AI Report)
#   --report-subtitle <subtitle> The subtitle of the report (default: Structured public-input analysis generated locally with LM Studio.)
#   --report-question <question> The question of the report (default: How should AI care for our communities, and who gets to decide?)
#   --additional-context <context> The additional context of the report (default: This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience.)
#   --model <model>         The model to use for the report (default: nvidia/nemotron-3-nano-4b)
#   --lmstudio-base-url <url> The base URL of the LM Studio instance (default: http://127.0.0.1:1234/v1)
#   --python-bin <path>     Python interpreter path (default: ${ROOT_DIR}/.venv/bin/python if present, otherwise python3)

# Exit on error, unset variables, and pipefail.

# Example usage (all options):
#   bash ./run_local_html_report.sh \
#     --export-base-url "https://bloom.civic.ai/api/v3/reportExport/r2jstrdchy3udbrf8arjx" \
#     --work-dir "${ROOT_DIR}/tmp/local-report" \
#     --report-title "Bloom Civic AI Report" \
#     --report-subtitle "Structured public-input analysis generated locally with LM Studio." \
#     --report-question "How should AI care for our communities, and who gets to decide?" \
#     --additional-context "This is a public-input conversation about how AI should care for communities and who should decide how these systems are used. Summarize it clearly for a civic audience." \
#     --model "nvidia/nemotron-3-nano-4b" \
#     --lmstudio-base-url "http://127.0.0.1:1234/v1" \
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

RAW_DIR="${WORK_DIR}/raw"
GENERATED_BASENAME="${WORK_DIR}/generated/local-report"
FINAL_HTML="${WORK_DIR}/report.html"

mkdir -p "${RAW_DIR}" "${WORK_DIR}/generated"

download_export() {
  local name="$1"
  echo "Downloading ${name}.csv"
  curl -L -sS -o "${RAW_DIR}/${name}.csv" "${EXPORT_BASE_URL}/${name}.csv"
}

download_export "summary"
download_export "comments"
download_export "votes"
download_export "participant-votes"
download_export "comment-groups"

SOURCE_URL="$("${PYTHON_BIN}" - <<'PY' "${RAW_DIR}/summary.csv"
import csv
import sys

with open(sys.argv[1], newline="", encoding="utf-8") as fh:
    reader = csv.reader(fh)
    for row in reader:
        if len(row) >= 2 and row[0] == "url":
            print(row[1])
            break
PY
)"

if command -v lms >/dev/null 2>&1; then
  echo "Reloading ${MODEL_NAME} in LM Studio with safe local settings"
  lms unload "${MODEL_NAME}" >/dev/null 2>&1 || true

  set +e
  LMS_LOAD_OUTPUT="$(
    lms load "${MODEL_NAME}" \
      --context-length 8192 \
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
  --outputLang en \
  --topicDepth 2

GENERATED_AT="$(date -u +"%Y-%m-%d %H:%M UTC")"

echo "Building HTML report"
(
  cd "${ROOT_DIR}/web-ui"
  npx ts-node site-build.ts \
    --topics "${GENERATED_BASENAME}-topic-stats.json" \
    --summary "${GENERATED_BASENAME}-summary.json" \
    --comments "${GENERATED_BASENAME}-comments-with-scores.json" \
    --reportTitle "${REPORT_TITLE}" \
    --reportSubtitle "${REPORT_SUBTITLE}" \
    --reportQuestion "${REPORT_QUESTION}" \
    --sourceUrl "${SOURCE_URL}" \
    --modelName "${MODEL_NAME}" \
    --generatedAt "${GENERATED_AT}"
  node single-html-build.js
)

cp "${ROOT_DIR}/web-ui/dist/bundled/report.html" "${FINAL_HTML}"
echo
echo "Report ready:"
echo "${FINAL_HTML}"
