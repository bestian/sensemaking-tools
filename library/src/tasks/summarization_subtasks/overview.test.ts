// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { formatOverviewItemsAsMarkdown, isOverviewItemsValid } from "../../sensemaker_utils";

describe("Overview JSON pipeline", () => {
  const topicNames = ["Topic 1 (20%)", "Topic 2 (80%)"];

  it("should validate items with exact topic ordering", () => {
    expect(
      isOverviewItemsValid(
        [
          { topicName: "Topic 1 (20%)", summary: "Summary one." },
          { topicName: "Topic 2 (80%)", summary: "Summary two." },
        ],
        topicNames
      )
    ).toEqual(true);
  });

  it("should reject items when order is different", () => {
    expect(
      isOverviewItemsValid(
        [
          { topicName: "Topic 2 (80%)", summary: "Summary two." },
          { topicName: "Topic 1 (20%)", summary: "Summary one." },
        ],
        topicNames
      )
    ).toEqual(false);
  });

  it("should format JSON items back to markdown list", () => {
    expect(
      formatOverviewItemsAsMarkdown(
        [
          { topicName: "Topic 2 (80%)", summary: "Summary two." },
          { topicName: "Topic 1 (20%)", summary: "Summary one." },
        ],
        topicNames
      )
    ).toEqual("* **Topic 1 (20%)**: Summary one.\n* **Topic 2 (80%)**: Summary two.");
  });
});
