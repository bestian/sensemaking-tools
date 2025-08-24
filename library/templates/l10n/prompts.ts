// Copyright 2024 Google LLC
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

// Multi-language prompts for different summarization tasks

import { SupportedLanguage } from "./languages";

/**
 * Multi-language prompt for generating prominent themes
 */
export const THEMES_PROMPT: Record<SupportedLanguage, string> = {
  "en": `Please write a concise bulleted list identifying up to 5 prominent themes across all statements. These statements are all about {topicName}. For each theme, begin with a short theme description written in bold text, followed by a colon, then followed by a SINGLE sentence explaining the theme. Your list should meet the below Criteria and STRICTLY follow the Output Format. Do not preface the bulleted list with any text.

<criteria format="markdown">
* Impartiality: Do not express your own opinion or pass normative judgments on the statements, like agreement, disagreement, or alarm.
* Faithfulness: Your list should accurately reflect the statements without hallucinations or mischaracterizations.
  * Similarly, your list should not assume or misstate the amount of agreement across statements. For example, do not present a theme as unanimous if it is only mentioned in some statements.
  * This criterion also applies to the name of the theme itself: do not assume overwhelming agreement when you name themes if it does not exist. For example, do not name a theme "Support for _______" unless there is overwhelming evidence beyond a reasonable doubt in the statements.
  * Be **specific**. Avoid overgeneralizations or fuzzy nouns like "things" or "aspects".
* Comprehensiveness: Your list should reflect ALL opinions proportional to their representation in the statements. However, **absolutely do not exclude minority opinions**, especially if there are strong objections or mixed stances. Please be **specific** in including these objections or stances.
* Consistent terminology: You should always use "statements" and NOT "comments".
</criteria>

<output_format format="markdown">
* **Title Case Theme**: Sentence
</output_format>`,

  "zh-TW": `請撰寫一個簡潔的項目符號清單，識別所有陳述中最多5個突出主題。這些陳述都是關於{topicName}的。對於每個主題，請以粗體文字開始簡短的主題描述，後接冒號，然後是解釋該主題的單一句子。您的清單應符合以下標準並嚴格遵循輸出格式。請勿在項目符號清單前添加任何文字。

<criteria format="markdown">
* 公正性：請勿表達您自己的意見或對陳述做出規範性判斷，如同意、不同意或警報。
* 忠實性：您的清單應準確反映陳述，不得有幻覺或錯誤描述。
  * 同樣地，您的清單不應假設或錯誤陳述陳述間的一致程度。例如，如果某個主題僅在某些陳述中被提及，請勿將其呈現為一致同意。
  * 此標準也適用於主題本身的命名：如果您沒有壓倒性證據，請勿假設壓倒性同意來命名主題。例如，除非陳述中有壓倒性證據，否則請勿將主題命名為「支持_______」。
  * 要具體。避免過度概括或模糊名詞如「事物」或「方面」。
* 全面性：您的清單應按比例反映陳述中所有意見的代表性。但是，絕對不要排除少數意見，特別是有強烈反對或混合立場的情況。請具體包含這些反對或立場。
* 一致術語：您應始終使用「陳述」而非「評論」。
</criteria>

<output_format format="markdown">
* **標題格式主題**：句子
</output_format>`,

  "zh-CN": `请撰写一个简洁的项目符号清单，识别所有陈述中最多5个突出主题。这些陈述都是关于{topicName}的。对于每个主题，请以粗体文字开始简短的主题描述，后接冒号，然后是解释该主题的单个句子。您的清单应符合以下标准并严格遵循输出格式。请勿在项目符号清单前添加任何文字。

<criteria format="markdown">
* 公正性：请勿表达您自己的意见或对陈述做出规范性判断，如同意、不同意或警报。
* 忠实性：您的清单应准确反映陈述，不得有幻觉或错误描述。
  * 同样地，您的清单不应假设或错误陈述陈述间的一致程度。例如，如果某个主题仅在某些陈述中被提及，请勿将其呈现为一致同意。
  * 此标准也适用于主题本身的命名：如果您没有压倒性证据，请勿假设压倒性同意来命名主题。例如，除非陈述中有压倒性证据，否则请勿将主题命名为「支持_______」。
  * 要具体。避免过度概括或模糊名词如「事物」或「方面」。
* 全面性：您的清单应按比例反映陈述中所有意见的代表性。但是，绝对不要排除少数意见，特别是有强烈反对或混合立场的情况。请具体包含这些反对或立场。
* 一致术语：您应始终使用「陈述」而非「评论」。
</criteria>

<output_format format="markdown">
* **标题格式主题**：句子
</output_format>`,

  "fr": `Veuillez rédiger une liste concise à puces identifiant jusqu'à 5 thèmes prédominants à travers toutes les déclarations. Ces déclarations concernent toutes {topicName}. Pour chaque thème, commencez par une brève description du thème écrite en texte gras, suivie de deux points, puis d'une SEULE phrase expliquant le thème. Votre liste doit respecter les critères ci-dessous et suivre STRICTEMENT le format de sortie. N'introduisez pas la liste à puces par aucun texte.

<criteria format="markdown">
* Impartialité : N'exprimez pas votre propre opinion ou ne portez pas de jugements normatifs sur les déclarations, comme l'accord, le désaccord ou l'alarme.
* Fidélité : Votre liste doit refléter fidèlement les déclarations sans hallucinations ou caractérisations erronées.
  * De même, votre liste ne doit pas supposer ou mal déclarer le degré d'accord entre les déclarations. Par exemple, ne présentez pas un thème comme unanime s'il n'est mentionné que dans certaines déclarations.
  * Ce critère s'applique également au nom du thème lui-même : ne supposez pas un accord écrasant lorsque vous nommez des thèmes s'il n'existe pas. Par exemple, ne nommez pas un thème "Soutien pour _______" sauf s'il y a des preuves écrasantes au-delà de tout doute raisonnable dans les déclarations.
  * Soyez **spécifique**. Évitez les généralisations excessives ou les noms vagues comme "choses" ou "aspects".
* Exhaustivité : Votre liste doit refléter TOUTES les opinions proportionnellement à leur représentation dans les déclarations. Cependant, **n'excluez absolument pas les opinions minoritaires**, surtout s'il y a de fortes objections ou des positions mixtes. Veuillez être **spécifique** en incluant ces objections ou positions.
* Terminologie cohérente : Vous devez toujours utiliser "déclarations" et NON "commentaires".
</criteria>

<output_format format="markdown">
* **Thème en Titre de Cas** : Phrase
</output_format>`,

  "es": `Por favor, escriba una lista concisa con viñetas que identifique hasta 5 temas prominentes en todas las declaraciones. Estas declaraciones son todas sobre {topicName}. Para cada tema, comience con una breve descripción del tema escrita en texto en negrita, seguida de dos puntos, luego de una SOLA oración explicando el tema. Su lista debe cumplir con los criterios a continuación y seguir ESTRICTAMENTE el formato de salida. No introduzca la lista con viñetas con ningún texto.

<criteria format="markdown">
* Imparcialidad: No exprese su propia opinión o pase juicios normativos sobre las declaraciones, como acuerdo, desacuerdo o alarma.
* Fidelidad: Su lista debe reflejar con precisión las declaraciones sin alucinaciones o caracterizaciones erróneas.
  * Del mismo modo, su lista no debe asumir o declarar incorrectamente la cantidad de acuerdo entre las declaraciones. Por ejemplo, no presente un tema como unánime si solo se menciona en algunas declaraciones.
  * Este criterio también se aplica al nombre del tema en sí: no asuma un acuerdo abrumador cuando nombre temas si no existe. Por ejemplo, no nombre un tema "Apoyo para _______" a menos que haya evidencia abrumadora más allá de toda duda razonable en las declaraciones.
  * Sea **específico**. Evite generalizaciones excesivas o sustantivos vagos como "cosas" o "aspectos".
* Exhaustividad: Su lista debe reflejar TODAS las opiniones proporcionalmente a su representación en las declaraciones. Sin embargo, **absolutamente no excluya las opiniones minoritarias**, especialmente si hay fuertes objeciones o posturas mixtas. Por favor, sea **específico** al incluir estas objeciones o posturas.
* Terminología consistente: Siempre debe usar "declaraciones" y NO "comentarios".
</criteria>

<output_format format="markdown">
* **Tema en Título de Caso**: Oración
</output_format>`,

  "ja": `すべての声明文から最大5つの顕著なテーマを特定する簡潔な箇条書きリストを作成してください。これらの声明文はすべて{topicName}に関するものです。各テーマについて、太字で書かれた短いテーマ説明で始め、コロンに続き、テーマを説明する単一の文で終わってください。あなたのリストは以下の基準を満たし、出力形式を厳密に従う必要があります。箇条書きリストの前にテキストを付けないでください。

<criteria format="markdown">
* 公平性：あなた自身の意見を表現したり、同意、不同意、警報などの声明文について規範的判断を下したりしないでください。
* 忠実性：あなたのリストは、幻覚や誤った特徴付けなしに声明文を正確に反映する必要があります。
  * 同様に、あなたのリストは声明文間の同意の程度を仮定したり誤って述べたりすべきではありません。例えば、テーマが一部の声明文でのみ言及されている場合、それを全会一致として提示しないでください。
  * この基準はテーマ自体の名前にも適用されます：存在しない場合、テーマに名前を付ける際に圧倒的な同意を仮定しないでください。例えば、声明文に合理的な疑いを超える圧倒的な証拠がない限り、テーマを「_______への支持」と名付けないでください。
  * 具体的にしてください。「もの」や「側面」などの過度な一般化や曖昧な名詞を避けてください。
* 包括性：あなたのリストは、声明文での表現に比例してすべての意見を反映する必要があります。しかし、少数意見を絶対に除外しないでください。特に強い反対や混合した立場がある場合はそうです。これらの反対や立場を含める際は具体的にしてください。
* 一貫した用語：常に「声明文」を使用し、「コメント」は使用しないでください。
</criteria>

<output_format format="markdown">
* **タイトルケーステーマ**：文
</output_format>`
};

/**
 * Get the localized prompt for themes generation
 * @param language The target language
 * @param topicName The name of the topic to replace in the prompt
 * @returns The localized prompt with topic name replaced
 */
export function getThemesPrompt(language: SupportedLanguage, topicName: string): string {
  console.log(`[DEBUG] getThemesPrompt() language: ${language}`);
  const prompt = THEMES_PROMPT[language] || THEMES_PROMPT["en"];
  return prompt.replace("{topicName}", topicName);
}
