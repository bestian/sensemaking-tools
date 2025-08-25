// Test script to verify the new JSON repair logic
// This simulates the streaming response scenarios

console.log("🧪 Testing new JSON repair logic...\n");

// Test case 1: Incomplete array of objects
const testCase1 = `[{"id":"26","topics":[{"name":"個人沉浸與成癮機制"}]},{"id":"39","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"44","topics":[{"name":"心理健康與情緒波動"}]},{"id":"49","topics":[{"name":"心理健康與情緒波動"}]},{"id":"57","topics":[{"name":"創造力的助長與抑制"}]},{"id":"80","topics":[{"name":"人際互動與社會連結的變化"}]},{"id":"94","topics":[{"name":"個人沉浸與成癮機制"}]},{"id":"107","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"113","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"114","topics":[{"name":"創造力的助長與抑制"}]},{"id":"131","topics":[{"name":"創造力的助長與抑制"}]},{"id":"140","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"178","topics":[{"name":"個人沉浸與成癮機制"}]},{"id":"191","topics":[{"name":"創造力的助長與抑制"}]},{"id":"185","topics":[{"name":"心理健康與情緒波動"}]},{"id":"183","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"184","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"206","topics":[{"name":"創造力的助長與抑制"}]},{"id":"215","topics":[{"name":"人際互動與社會連結的變化"}]},{"id":"216","topics":[{"name":"心理健康與情緒波動"}]},{"id":"209","topics":[{"name":"人際互動與社會連結的變化"}]},{"id":"247","topics":[{"name":"創造力的助長與抑制"}]},{"id":"269","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"268","topics":[{"name":"創造力的助長與抑制"}]},{"id":"285","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"289","topics":[{"name":"自我認同與自我價值感的調適"}]},{"id":"281","topics":[{"name":"創造力的助長與抑制"}]},{"id":"313","topics":[{"name":"文化敘事與價值觀的重塑"}},{"id":"319","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"323","topics":[{"name":"人際互動與社會連結的變化"}]},{"id":"328","topics":[{"name":"人際互動與社會連結的變化"}]},{"id":"334","topics":[{"name":"自我認同與自我價值感的調適"}]},{"id":"338","topics":[{"name":"心理健康與情緒波動"}]},{"id":"339","topics":[{"name":"文化敘事與價值觀的重塑"}]},{"id":"340","topics":[{"name":"自我認同與自我價值感的調適"}]},{"id":"341","topics":[{"name":"創造力的助長與抑制"}]},{"id":"343","topics":[{"name":"心理健康與情緒波動"}]},{"id":"332","topics":[{"name":"文化敘事與價值觀的重塑"}`;

console.log("Test Case 1: Incomplete array of objects");
console.log("Original length:", testCase1.length);
console.log("Starts with '[':", testCase1.trim().startsWith('['));
console.log("Ends with ']':", testCase1.trim().endsWith(']'));
console.log("Bracket analysis:");
console.log("  Open brackets:", (testCase1.match(/\[/g) || []).length);
console.log("  Close brackets:", (testCase1.match(/\]/g) || []).length);
console.log("  Open braces:", (testCase1.match(/\{/g) || []).length);
console.log("  Close braces:", (testCase1.match(/\}/g) || []).length);
console.log("");

// Test case 2: Incomplete object
const testCase2 = `{"id":"26","topics":[{"name":"個人沉浸與成癮機制"}],"comment":"This is a test comment","status":"active"`;

console.log("Test Case 2: Incomplete object");
console.log("Original length:", testCase2.length);
console.log("Starts with '{':", testCase2.trim().startsWith('{'));
console.log("Ends with '}':", testCase2.trim().endsWith('}'));
console.log("Bracket analysis:");
console.log("  Open brackets:", (testCase2.match(/\[/g) || []).length);
console.log("  Close brackets:", (testCase2.match(/\]/g) || []).length);
console.log("  Open braces:", (testCase2.match(/\{/g) || []).length);
console.log("  Close braces:", (testCase2.match(/\}/g) || []).length);
console.log("");

// Test case 3: Mixed format with code blocks
const testCase3 = `Here is the JSON data:

\`\`\`json
[{"id":"26","topics":[{"name":"個人沉浸與成癮機制"}]},{"id":"39","topics":[{"name":"文化敘事與價值觀的重塑"}]}]
\`\`\`

This is the end of the response.`;

console.log("Test Case 3: Mixed format with code blocks");
console.log("Original length:", testCase3.length);
console.log("Contains code blocks:", testCase3.includes('```'));
console.log("Contains JSON structure:", /\[.*\]/.test(testCase3));
console.log("");

console.log("✅ Test cases prepared!");
console.log("Note: These test cases simulate the streaming response scenarios");
console.log("that the new repair logic is designed to handle.");
