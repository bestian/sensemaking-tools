const OpenAI = require('openai');

async function simpleTest() {
  console.log('🚀 開始簡化測試...\n');
  
  const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/sensemaking-tools',
      'X-Title': 'Sensemaker Tools',
    },
  });

  try {
    // 測試 1：主題識別
    console.log('📋 測試 1：主題識別');
    const topicResponse = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: `請分析以下評論，並提供 3-5 個主題分類。請直接回傳 JSON 格式，不要包含任何解釋文字：

評論內容：
1. 我們需要更好的教育政策來支持學生的學習需求
2. 學校應該提供更多實用的技能訓練課程
3. 老師的工作負擔太重，需要更多支援
4. 學生應該有更多選擇課程的自由
5. 家長參與學校事務的程度應該提高

請回傳格式：
[
  {"name": "主題名稱1"},
  {"name": "主題名稱2"},
  {"name": "主題名稱3"}
]`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    console.log('✅ 主題識別回應：');
    console.log(topicResponse.choices[0].message.content);
    console.log();

    // 測試 2：評論分類
    console.log('🏷️ 測試 2：評論分類');
    const categoryResponse = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: `請將以下評論分類到指定的主題中。請直接回傳 JSON 格式，不要包含任何解釋文字：

主題：
- 教育政策與制度改革
- 教學資源與設施優化
- 學生身心發展支持

評論：
1. 我們需要更好的教育政策來支持學生的學習需求
2. 學校應該提供更多實用的技能訓練課程

請回傳格式：
[
  {"id": "1", "topics": [{"name": "主題名稱"}]},
  {"id": "2", "topics": [{"name": "主題名稱"}]}
]`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    console.log('✅ 評論分類回應：');
    console.log(categoryResponse.choices[0].message.content);
    console.log();

    console.log('🎉 簡化測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗：', error.message);
  }
}

simpleTest();
