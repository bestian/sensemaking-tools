# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Utility functions and types for automated evaluation of summarization results using LLMs.

import csv
import logging
import re
from typing import Dict, List, TypedDict


class EvalInput(TypedDict):
  """Represents a summary claim and corresponding source statements for evaluation."""

  summary: str
  source: str


class EvalResults(TypedDict):
  """Represents aggregated results for autorating evaluations."""

  # Total number of summary claims evaluated
  totalSummaries: int
  # Evaluation results broken down by metric. Each metric maps to yes/no/maybe counts.
  metrics: Dict[str, Dict[str, int]]


def read_csv(csv_file_path: str) -> List[EvalInput]:
  """Reads summary claims and source statements from a CSV file and returns them as a list of EvalInput objects.

  The CSV file is expected to have columns for 'summary' and 'source'.

  Args:
      csv_file_path: The path to the CSV file.

  Returns:
      A list of EvalInput objects.
  """
  eval_input: List[EvalInput] = []
  try:
    with open(csv_file_path, mode="r", encoding="utf-8") as file:
      reader = csv.DictReader(file)
      if (
          "summary" not in reader.fieldnames
          or "source" not in reader.fieldnames
      ):
        logging.error("CSV file must contain 'summary' and 'source' columns.")
        return []

      for record in reader:
        summary = record["summary"].strip()
        source = record["source"].strip()
        if not summary or not source:
          # Skip rows with empty summary or source
          continue
        eval_input.append({"summary": summary, "source": source})
  except FileNotFoundError:
    logging.error(f"Input file not found: {csv_file_path}")
  except Exception as e:
    logging.error(f"Failed to read the input file: {e}")

  return eval_input


def generate_evaluation_report(
    results: EvalResults, total_runtime_min: float
) -> str:
  """Generates a summary evaluation report based on aggregated autorating results.

  Args:
      results: Aggregated results from the autorating process.
      total_runtime_min: Total runtime of the evaluation in minutes.

  Returns:
      A formatted report string.
  """
  report = "Summary Evaluation Report\n\n"
  report += f"Total summary claims: {results['totalSummaries']}\n\n"
  for metric, counts in results["metrics"].items():
    total_results = counts["no"] + counts["yes"] + counts["maybe"]
    report += f"{metric}\n"
    if total_results > 0:
      report += (
          f"No: {((counts['no'] / total_results) * 100):.0f}%"
          f" ({counts['no']}/{total_results})\n"
      )
      report += (
          f"Yes: {((counts['yes'] / total_results) * 100):.0f}%"
          f" ({counts['yes']}/{total_results})\n"
      )
      report += (
          f"Maybe: {((counts['maybe'] / total_results) * 100):.0f}%"
          f" ({counts['maybe']}/{total_results})\n"
      )
    else:
      report += "No results available for this metric.\n"
    report += "\n"
  report += f"Total autorating runtime: {total_runtime_min:.2f} minutes\n"
  return report


def format_comments(comments_string: str) -> str:
  """Splits a string of comments into individual comments, trims extra characters,

  and wraps each comment with XML <comment> tags.

  Args:
      comments_string: A string containing multiple comments separated by
        newlines.

  Returns:
      A string containing the formatted comments, each wrapped in <comment>
      tags, or an empty string if there are no comments.
  """
  if not comments_string:
    return ""

  lines = comments_string.split("\n")
  formatted_comments = ""

  for line in lines:
    cleaned_line = line.strip().lstrip("*").strip()  # remove *, and whitespaces
    cleaned_line = re.sub(
        r"^\[\d+]\s*", "", cleaned_line
    )  # remove [numbers] at the beginning
    if cleaned_line:  # only add if there is a value
      formatted_comments += f"<comment>{cleaned_line}</comment>\n"

  return formatted_comments.strip()


def format_summary(summary_claim: str) -> str:
  """Removes text unrelated to evaluation from a summary claim."""
  summary_claim = summary_claim.strip()
  # Remove "Common ground: " or "Differences of opinion: " from the beginning
  summary_claim = re.sub(
      r"^(Common ground:|Differences of opinion:)\s*", "", summary_claim
  )
  return summary_claim.strip()
