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

import os
import unittest

from autorating_utils import EvalResults, format_comments, format_summary, generate_evaluation_report, read_csv


class TestAutoratingUtils(unittest.TestCase):

  def test_read_csv(self):
    csv_file_path = "test_autorating.csv"
    csv_content = (
        '"summary","source"\n"statement 1","source 1"\n"statement 2","source 2"'
    )
    with open(csv_file_path, "w", encoding="utf-8") as csvfile:
      csvfile.write(csv_content)

    result = read_csv(csv_file_path)

    os.unlink(csv_file_path)

    self.assertEqual(
        result,
        [
            {"summary": "statement 1", "source": "source 1"},
            {"summary": "statement 2", "source": "source 2"},
        ],
    )

  def test_generate_evaluation_report(self):
    results: EvalResults = {
        "totalSummaries": 10,
        "metrics": {
            "Metric 1": {"no": 7, "yes": 2, "maybe": 1},
            "Metric 2": {"no": 5, "yes": 5, "maybe": 0},
        },
    }
    total_runtime_min = 5.25

    report = generate_evaluation_report(results, total_runtime_min)

    self.assertIn("Summary Evaluation Report", report)
    self.assertIn("Total summary claims: 10", report)

    self.assertIn("Metric 1", report)
    self.assertIn("No: 70% (7/10)", report)
    self.assertIn("Yes: 20% (2/10)", report)
    self.assertIn("Maybe: 10% (1/10)", report)

    self.assertIn("Metric 2", report)
    self.assertIn("No: 50% (5/10)", report)
    self.assertIn("Yes: 50% (5/10)", report)
    self.assertIn("Maybe: 0% (0/10)", report)

    self.assertIn("Total autorating runtime: 5.25 minutes", report)

  def test_format_comments_mixed_input(self):
    input_comments = """
        *        [1] This is the first comment.
        *        [23] Comment two.
        *        [456] Third comment
        """
    expected_output = (
        "<comment>This is the first comment.</comment>\n"
        "<comment>Comment two.</comment>\n"
        "<comment>Third comment</comment>"
    )
    self.assertEqual(format_comments(input_comments), expected_output)

  def test_format_summary(self):
    test_cases = [
        (
            "Common ground:  We all want a better future.",
            "We all want a better future.",
        ),
        (
            "Differences of opinion:  Some want more taxes.",
            "Some want more taxes.",
        ),
        ("Just a regular statement.", "Just a regular statement."),
    ]

    for input_summary, expected_output in test_cases:
      with self.subTest(input=input_summary):
        self.assertEqual(format_summary(input_summary), expected_output)


if __name__ == "__main__":
  unittest.main()
