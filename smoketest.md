# 0) 先設定 API key
export OPENROUTER_API_KEY="your_openrouter_api_key_here"

# 1) GPT-OSS-120b
npx ts-node ./library/runner-cli/runner_openrouter.ts \
  --outputBasename out-gptoss \
  --inputFile "./files/comments.csv" \
  --additionalContext "Smoke test for model compatibility" \
  --model openai/gpt-oss-120b \
  --output_lang en

# 2) Anthropic
npx ts-node ./library/runner-cli/runner_openrouter.ts \
  --outputBasename out-anthropic \
  --inputFile "./files/comments.csv" \
  --additionalContext "Smoke test for model compatibility" \
  --model anthropic/claude-opus-4.6 \
  --output_lang en

# 3) MiniMax M2.5
npx ts-node ./library/runner-cli/runner_openrouter.ts \
  --outputBasename out-minimax \
  --inputFile "./files/comments.csv" \
  --additionalContext "Smoke test for model compatibility" \
  --model minimax/minimax-m2.5 \
  --output_lang en