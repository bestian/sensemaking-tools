const OpenAI = require('openai');

async function testOpenRouter() {
  console.log('🧪 測試 OpenRouter API 連接...\n');
  
  const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/sensemaking-tools',
      'X-Title': 'Sensemaker Tools Test',
    },
  });

  try {
    console.log('📡 發送測試請求...');
    
    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: '請用繁體中文回答：你好！請簡單介紹一下你自己。'
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('✅ API 連接成功！');
    console.log('🤖 模型回應：');
    console.log(response.choices[0].message.content);
    console.log('\n🎉 OpenRouter API 測試完成！');
    
  } catch (error) {
    console.error('❌ API 測試失敗：', error.message);
    if (error.response) {
      console.error('📋 錯誤詳情：', error.response.data);
    }
  }
}

testOpenRouter();
