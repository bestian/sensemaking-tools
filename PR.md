# [Experimental / Work in Progress] Local LM Studio runner, one‑shot script, and multi‑language report output

Hi Jigsaw team! First of all, thank you for open‑sourcing Sensemaker — it has been an excellent foundation to build on.

This PR shares the **current state of an experimental fork** that is still actively evolving on the [`new-feature-open-router-ggml`](https://github.com/bestian/sensemaking-tools/tree/new-feature-open-router-ggml) branch. We are opening it now as a **work‑in‑progress PR** so that the design direction is visible upstream early, and so that interested maintainers and community members can review, comment, or cherry‑pick ideas while we continue iterating. We are **not** expecting this to be merged as‑is; the goal is to start a conversation and gather feedback.

The fork extends Sensemaker so that users can run the full pipeline against a **local LM Studio** instance (in addition to the default VertexAI / Gemini setup and our existing OpenRouter runners), and produce a complete interactive HTML report from a Polis export with a single command, in the language of their choice.

## Merge status — not mergeable as‑is

To set expectations up front: **this branch currently conflicts with upstream `main` in dozens of files** and therefore **cannot be merged directly**. Many of the changes here have co‑evolved over several iterations (local LM Studio runner, OpenRouter runners, multi‑language web UI, the Overview JSON refactor, etc.), and they overlap with files that upstream has also updated.

Resolving these conflicts cleanly will require careful, file‑by‑file review and integration. We are **not asking upstream to merge this PR as a single unit**, and we do not expect an immediate merge. The primary purpose is to make the direction visible and to gather feedback.

## Scope of this PR

This PR intentionally keeps changes additive:

- New CLI entry points and a shell orchestrator for the local LM Studio workflow.
- Multi‑language support across the pipeline and the web UI templates.
- An internal change to how the *Overview* section is generated (Markdown → JSON) to improve multilingual stability.

The existing VertexAI / Gemini CLI runners and public APIs are left untouched. The one exception is the internal *Overview* summarization step, whose prompt/parsing has been reworked (Markdown → JSON then rendered on our side); its visible output stays equivalent to the previous Markdown pipeline.

## What is included (current progress)

### 1. Local LM Studio model support
A new advanced runner, `library/runner-cli/advanced_runner_lmstudio.ts`, drives the full Sensemaker pipeline (topic identification, categorization, summarization, report data) against an OpenAI‑compatible LM Studio server. This enables fully local, cost‑free runs with user‑selectable open‑weight models (e.g. `nvidia/nemotron-3-nano-4b` and similar GGUF models hosted by LM Studio).

### 2. Single end‑to‑end script
`run_local_html_report.sh` at the repo root turns a Polis export URL into a finished, self‑contained HTML report in one command. It handles:

- Downloading the Polis export CSVs.
- Converting them to Sensemaker’s input format.
- (Optionally) reloading the local LM Studio model with safe context/parallel settings via the `lms` CLI.
- Running the advanced LM Studio runner to produce the three JSON artifacts (topics, summary, comments with scores).
- Building the web UI and bundling a single shareable HTML file.

It also supports a `--skip-LLM` flag to rebuild the HTML from previously generated JSON without re‑invoking the model — useful for iterating on the report template.

See the header of [`run_local_html_report.sh`](https://github.com/bestian/sensemaking-tools/blob/new-feature-open-router-ggml/run_local_html_report.sh) for the full list of options and a worked example.

### 3. Multi‑language report generation
The pipeline exposes an `--outputLang` option (propagated down to the LLM prompts) so reports can be generated directly in the target language instead of relying on post‑hoc translation. Currently supported:

- `en` (English)
- `zh-TW` (繁體中文)
- `zh-CN` (简体中文)
- `fr` (Français)
- `es` (Español)
- `ja` (日本語)
- `de` (Deutsch)

### 4. Multi‑language web UI templates
The report web UI (under `web-ui/`) has been updated so that hard‑coded English UI labels are replaced with a localization layer keyed off the same `--outputLang` value used by the runner. This keeps the generated data and the surrounding UI chrome consistent in one language.

### 5. More stable Overview Summary via JSON‑only LLM responses
In multilingual runs we observed that asking the model to emit Markdown for the Overview section was a frequent source of parsing/formatting regressions — especially for CJK languages and for smaller local models. This PR refactors the Overview generation so that:

- The LLM is instructed (including at the system‑prompt level) to return **structured JSON only**, not Markdown and not chain‑of‑thought.
- The runner parses and normalizes that JSON, then renders the final Markdown / HTML deterministically on our side.
- Retry count for the Overview step was increased (3 → 6) to further improve multilingual success rates.

This has noticeably reduced malformed‑output failures across the supported languages while keeping the visible output equivalent to the previous Markdown pipeline.

## Roadmap / next steps (not in this PR)

We plan to continue iterating on the branch. The next items we intend to work on:

1. **`library/runner-cli/advanced_runner_openrouter.ts`** — an advanced runner analogous to the LM Studio one, targeting OpenRouter so users can pick any hosted model with a unified CLI.
2. **Unified one‑shot script for OpenRouter** — either a sibling `run_openrouter_html_report.sh` or, preferably, extending `run_local_html_report.sh` with a `--provider {lmstudio,openrouter}` (or similar) switch so both backends share the same orchestration.

Additional follow‑ups we are considering: consolidating the existing OpenRouter runners under the same configuration surface, and expanding evaluations for non‑English outputs.

## Status and how to try it

- Branch: [`new-feature-open-router-ggml`](https://github.com/bestian/sensemaking-tools/tree/new-feature-open-router-ggml) on [`bestian/sensemaking-tools`](https://github.com/bestian/sensemaking-tools/).
- Upstream reference for the report webpage feature this builds on: [README § Generating a Report](https://github.com/Jigsaw-Code/sensemaking-tools/?tab=readme-ov-file#generating-a-report---get-a-webpage-presentation-of-the-report).
- Quick start (with LM Studio running locally):

```bash
bash ./run_local_html_report.sh \
  --export-base-url "https://<your-polis-export-base-url>" \
  --report-title "Sensemaker Report" \
  --model "nvidia/nemotron-3-nano-4b" \
  --lmstudio-base-url "http://127.0.0.1:1234/v1" \
  --outputLang "zh-TW"
```

## What we are looking for

Because this is still experimental and the branch is moving, we are **not asking for a merge right now**. Instead, we would greatly appreciate:

- High‑level feedback on whether the LM Studio / OpenRouter direction is something upstream would like to eventually host (vs. living in a fork).
- Input on the preferred integration shape — e.g. separate runners vs. a pluggable `Model`‑level backend, and one script vs. per‑provider scripts.
- Thoughts on the Overview‑as‑JSON change, and whether a similar approach would be welcome for other summarization steps to improve multilingual robustness.

Thanks again for the project and for considering this contribution!
