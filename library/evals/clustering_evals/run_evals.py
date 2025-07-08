# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http:#www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""This script runs evals on Topic Identification and Categorization.

Be sure to set the following environment variables before running for access to
Gemini embeddings:
export GOOGLE_CLOUD_PROJECT=<your project name>
export GOOGLE_CLOUD_LOCATION=us-central1
export GOOGLE_GENAI_USE_VERTEXAI=True
"""
import argparse
import evals_lib
import pandas as pd


def parse_arguments() -> argparse.Namespace:
  """Parses command-line arguments."""
  parser = argparse.ArgumentParser(
      description=(
          "Process evaluation data and calculate categorization differences."
      )
  )
  parser.add_argument(
      "--input-data",
      type=str,
      required=True,
      nargs="+",
      help="Path to the input data CSV files.",
  )
  parser.add_argument(
      "--output-csv-path",
      type=str,
      required=True,
      help="Path where the output CSV results file will be saved.",
  )
  return parser.parse_args()


def main(args: argparse.Namespace) -> None:
  input_files = args.input_data
  output_path = args.output_csv_path

  data = []
  for filepath in input_files:
    new_df = pd.read_csv(filepath)
    new_df = evals_lib.convert_topics_col_to_list(new_df)
    data.append(new_df)

  categorization_diff_results = evals_lib.analyze_categorization_diffs(data)
  topic_set_similarity_results = evals_lib.analyze_topic_set_similarity(data)
  topic_centered_silhouette_results = (
      evals_lib.analyze_topic_centered_silhouette_scores(data)
  )
  centroid_silhouette_results = evals_lib.analyze_centroid_silhouette_scores(
      data
  )

  results = [
      categorization_diff_results,
      topic_set_similarity_results,
      topic_centered_silhouette_results,
      centroid_silhouette_results,
  ]

  # Create a dictionary to store the results
  results_data = {
      "Evaluation Name": [
          "Topic Categorization Diff Rate",
          "Topic Set Similarity",
          "Topic Centered Silhouette",
          "Centroid Silhouette",
      ],
      "Mean": [result.mean for result in results],
      "Stdev": [result.stdev for result in results],
      "Min": [result.min for result in results],
      "Max": [result.max for result in results],
  }
  with open(output_path, "w") as f:
    pd.DataFrame(data=results_data).to_csv(f, index=False)


if __name__ == "__main__":
  args = parse_arguments()
  main(args)
