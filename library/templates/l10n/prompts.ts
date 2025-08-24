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
* 一致術語：您應始終使用「陳述」和NOT「評論」。
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

  "fr": `Analysez les commentaires suivants et identifiez les sujets communs.
Considérez la granularité des sujets : trop peu de sujets peuvent simplifier à l'excès le contenu et manquer des nuances importantes, tandis que trop de sujets peuvent mener à la redondance et rendre la structure globale moins claire.
Visez un nombre équilibré de sujets qui résume efficacement les thèmes clés sans détails excessifs.
Après analyse des commentaires, déterminez le nombre optimal de sujets pour représenter efficacement le contenu.
Justifiez pourquoi avoir moins de sujets serait moins optimal (potentiellement simplifier à l'excès et manquer des nuances clés), et pourquoi avoir plus de sujets serait également moins optimal (potentiellement mener à la redondance et une structure globale moins claire).
Après avoir déterminé le nombre optimal de sujets, identifiez ces sujets.

EXIGENCES CRITIQUES :
- NE créez JAMAIS de sujets avec des noms génériques comme "Autre".
- Chaque sujet DOIT avoir un nom spécifique et descriptif qui représente clairement le contenu réel trouvé dans les commentaires.
- Si vous ne pouvez pas identifier des sujets significatifs, créez moins de sujets avec des noms plus spécifiques plutôt que d'utiliser des termes génériques fourre-tout.
- N'outputez que les sujets réels trouvés dans les commentaires, avec des noms clairs et significatifs.
- Utilisez le format de schéma JSON exact spécifié : [{"name": "Nom du Sujet"}]

Exemples de BONS noms de sujets :
- "Sécurité de l'IA et Risque Existentiel"
- "Impact Économique et Marché du Travail"
- "Vie Privée et Gouvernance des Données"
- "Éducation et Pensée Critique"

Exemples de MAUVAIS noms de sujets (NE PAS UTILISER) :
- "Autre"
- "Divers"
- "Général"
- "Misc"`,

  "es": `Analiza los siguientes comentarios e identifica temas comunes.
Considera la granularidad de los temas: muy pocos temas pueden simplificar en exceso el contenido y perder matices importantes, mientras que demasiados temas pueden llevar a la redundancia y hacer la estructura general menos clara.
Apunta a un número equilibrado de temas que resuma efectivamente los temas clave sin detalles excesivos.
Después de analizar los comentarios, determina el número óptimo de temas para representar efectivamente el contenido.
Justifica por qué tener menos temas sería menos óptimo (potencialmente simplificar en exceso y perder matices clave), y por qué tener más temas también sería menos óptimo (potencialmente llevar a la redundancia y una estructura general menos clara).
Después de determinar el número óptimo de temas, identifica esos temas.

REQUISITOS CRÍTICOS:
- NUNCA crees temas con nombres genéricos como "Otro".
- Cada tema DEBE tener un nombre específico y descriptivo que represente claramente el contenido real encontrado en los comentarios.
- Si no puedes identificar temas significativos, crea menos temas con nombres más específicos en lugar de usar términos genéricos de cajón de sastre.
- Solo outputa los temas reales encontrados en los comentarios, con nombres claros y significativos.
- Usa el formato de esquema JSON exacto especificado: [{"name": "Nombre del Tema"}]

Ejemplos de BUENOS nombres de temas:
- "Seguridad de IA y Riesgo Existencial"
- "Impacto Económico y Mercado Laboral"
- "Privacidad y Gobernanza de Datos"
- "Educación y Pensamiento Crítico"

Ejemplos de MALOS nombres de temas (NO USAR):
- "Otro"
- "Misceláneo"
- "General"
- "Misc"`,

  "ja": `すべての声明文から最大5つの顕著なテーマを特定する簡潔な箇条書きリストを作成してください。これらの声明文はすべて{topicName}に関するものです。各テーマについて、太字で書かれた短いテーマ説明で始め、コロンに続き、テーマを説明する単一の文で終わってください。あなたのリストは以下の基準を満たし、出力形式を厳密に従う必要があります。箇条書きリストの前にテキストを付けないでください。

<criteria format="markdown">
* 公平性：あなた自身の意見を表現したり、同意、不同意、警報などの声明文について規範的判断を下したりしないでください。
* 忠実性：あなたのリストは、幻覚や誤った特徴付けなしに声明文を正確に反映する必要があります。
  * 同様に、あなたのリストは声明文間の同意の程度を仮定したり誤って述べたりすべきではありません。例えば、テーマが一部の声明文でのみ言及されている場合、それを全会一致として提示しないでください。
  * この基準はテーマ自体の名前にも適用されます：存在しない場合、テーマに名前を付ける際に圧倒性の同意を仮定しないでください。例えば、声明文に合理的な疑いを超える圧倒性の証拠がない限り、テーマを「_______への支持」と名付けないでください。
  * 具体的にしてください。「もの」や「側面」などの過度な一般化や曖昧な名詞を避けてください。
* 包括性：あなたのリストは、声明文での表現に比例してすべての意見を反映する必要があります。しかし、少数意見を絶対に除外しないでください。特別に強い反対や混合した立場がある場合はそうです。これらの反対や立場を含める際は具体的にしてください。
* 一貫した用語：常に「声明文」を使用し、「コメント」は使用しないでください。
</criteria>

<output_format format="markdown">
* **タイトルケーステーマ**：文
</output_format>`
};

/**
 * Multi-language prompt for generating overview summary (one-shot method)
 */
export const OVERVIEW_ONE_SHOT_PROMPT: Record<SupportedLanguage, string> = {
  "en": `Your job is to compose a summary of the key findings from a public discussion, based on already composed summaries corresponding to topics and subtopics identified in said discussion. These topic and subtopic summaries are based on comments and voting patterns that participants submitted as part of the discussion. You should format the results as a markdown list, to be included near the top of the final report, which shall include the complete topic and subtopic summaries. Do not pretend that you hold any of these opinions. You are not a participant in this discussion. Do not include specific numbers about how many comments were included in each topic or subtopic, as these will be included later in the final report output. You also do not need to recap the context of the conversation, as this will have already been stated earlier in the report. Where possible, prefer describing the results in terms of the "statements" submitted or the overall "conversation", rather than in terms of the participants' perspectives (Note: "comments" and "statements" are the same thing, but for the sake of this portion of the summary, only use the term "statements"). Remember: this is just one component of a larger report, and you should compose this so that it will flow naturally in the context of the rest of the report. Be clear and concise in your writing, and do not use the passive voice, or ambiguous pronouns.

The structure of the list you output should be in terms of the topic names, in the order that follows. Each list item should start in bold with topic name name (including percentage, exactly as listed below), then a colon, and then a short one or two sentence summary for the corresponding topic. The complete response should be only the markdown list, and no other text. For example, a list item might look like this:
<output_format format="markdown">* **Topic Name (45%):**  Topic summary.</output_format>
Here are the topics:
{topicNames}`,

  "zh-TW": `您的工作是根據已編寫的摘要來撰寫公開討論關鍵發現的摘要，這些摘要對應於討論中識別的主題和子主題。這些主題和子主題摘要是基於參與者作為討論一部分提交的評論和投票模式。您應該將結果格式化為 markdown 列表，包含在最終報告的頂部附近，該報告將包含完整的主題和子主題摘要。請勿假裝您持有這些意見中的任何一個。您不是此討論的參與者。請勿包含關於每個主題或子主題包含多少評論的具體數字，因為這些將在最終報告輸出中稍後包含。您也不需要重述對話的上下文，因為這將在報告的早期已經說明。在可能的情況下，請優先描述提交的「陳述」或整體「對話」的結果，而不是參與者的觀點（注意：「評論」和「陳述」是同一件事，但為了這部分摘要，只使用「陳述」一詞）。記住：這只是更大報告的一個組成部分，您應該撰寫它，使其在報告其餘部分的上下文中自然流動。在寫作中要清晰簡潔，不要使用被動語態或模糊的代詞。

您輸出的列表結構應該按照主題名稱，按照以下順序。每個列表項目應該以粗體開始，包含主題名稱（包括百分比，完全按照下面列出的），然後是冒號，然後是對應主題的簡短一兩句話摘要。完整回應應該只是 markdown 列表，沒有其他文字。例如，列表項目可能看起來像這樣：
<output_format format="markdown">* **主題名稱 (45%):** 主題摘要。</output_format>
以下是主題：
{topicNames}`,

  "zh-CN": `您的工作是根据已编写的摘要来撰写公开讨论关键发现的摘要，这些摘要对应于讨论中识别的主题和子主题。这些主题和子主题摘要是基于参与者作为讨论一部分提交的评论和投票模式。您应该将结果格式化为 markdown 列表，包含在最终报告的顶部附近，该报告将包含完整的主题和子主题摘要。请勿假装您持有这些意见中的任何一个。您不是此讨论的参与者。请勿包含关于每个主题或子主题包含多少评论的具体数字，因为这些将在最终报告输出中稍后包含。您也不需要重述对话的上下文，因为这将在报告的早期已经说明。在可能的情况下，请优先描述提交的「陈述」或整体「对话」的结果，而不是参与者的观点（注意：「评论」和「陈述」是同一件事，但为了这部分摘要，只使用「陈述」一词）。记住：这只是更大报告的一个组成部分，您应该撰写它，使其在报告其余部分的上下文中自然流動。在寫作中要清晰簡潔，不要使用被動語態或模糊的代詞。

您输出的列表结构应该按照主题名称，按照以下顺序。每个列表项目应该以粗体开始，包含主题名称（包括百分比，完全按照下面列出的），然后是冒号，然后是对应主题的简短一两句话摘要。完整回应应该只是 markdown 列表，没有其他文字。例如，列表项目可能看起来像这样：
<output_format format="markdown">* **主题名称 (45%):** 主题摘要。</output_format>
以下是主题：
{topicNames}`,

  "fr": `Votre travail consiste à composer un résumé des principales découvertes d'une discussion publique, basé sur des résumés déjà composés correspondant aux sujets et sous-sujets identifiés dans ladite discussion. Ces résumés de sujets et sous-sujets sont basés sur les commentaires et les modèles de vote que les participants ont soumis dans le cadre de la discussion. Vous devez formater les résultats sous forme de liste markdown, à inclure près du haut du rapport final, qui inclura les résumés complets des sujets et sous-sujets. Ne prétendez pas que vous détenez l'une de ces opinions. Vous n'êtes pas un participant à cette discussion. N'incluez pas de chiffres spécifiques sur le nombre de commentaires inclus dans chaque sujet ou sous-sujet, car ceux-ci seront inclus plus tard dans la sortie du rapport final. Vous n'avez pas non plus besoin de récapituler le contexte de la conversation, car cela aura déjà été énoncé plus tôt dans le rapport. Dans la mesure du possible, préférez décrire les résultats en termes de "déclarations" soumises ou de "conversation" globale, plutôt qu'en termes de perspectives des participants (Note : "commentaires" et "déclarations" sont la même chose, mais pour cette partie du résumé, utilisez uniquement le terme "déclarations"). Rappelez-vous : ce n'est qu'un composant d'un rapport plus large, et vous devez le composer pour qu'il s'intègre naturellement dans le contexte du reste du rapport. Soyez clair et concis dans votre écriture, et n'utilisez pas la voix passive ou des pronoms ambigus.

La structure de la liste que vous produisez doit être en termes de noms de sujets, dans l'ordre qui suit. Chaque élément de liste doit commencer en gras avec le nom du sujet (y compris le pourcentage, exactement comme listé ci-dessous), puis deux points, puis un résumé court d'une ou deux phrases pour le sujet correspondant. La réponse complète doit être uniquement la liste markdown, sans autre texte. Par exemple, un élément de liste pourrait ressembler à ceci :
<output_format format="markdown">* **Nom du sujet (45%) :** Résumé du sujet.</output_format>
Voici les sujets :
{topicNames}`,

  "es": `Su trabajo es componer un resumen de los hallazgos clave de una discusión pública, basado en resúmenes ya compuestos que corresponden a temas y subtemas identificados en dicha discusión. Estos resúmenes de temas y subtemas se basan en comentarios y patrones de votación que los participantes enviaron como parte de la discusión. Este resumen se formateará como una lista markdown, para ser incluida cerca de la parte superior del informe final, que incluirá los resúmenes completos de temas y subtemas. No pretenda que sostiene alguna de estas opiniones. Usted no es un participante en esta discusión. Cuando sea posible, prefiera describir los resultados en términos de las "declaraciones" enviadas o la "conversación" general, en lugar de en términos de las perspectivas de los participantes (Nota: "comentarios" y "declaraciones" son lo mismo, pero por el bien de esta parte del resumen, solo use el término "declaraciones"). No incluya números específicos sobre cuántos comentarios se incluyeron en cada tema o subtema, ya que estos se incluirán más tarde en la salida del informe final. Tampoco necesita recapitular el contexto de la conversación, ya que esto se habrá establecido anteriormente en el informe. Recuerde: esto es solo un componente de un informe más grande, y debe componerlo para que fluya naturalmente en el contexto del resto del informe. Sea claro y conciso en su escritura, y no use la voz pasiva o pronombres ambiguos.

Otros temas vendrán más tarde, pero por ahora, su trabajo es componer un resumen muy corto de una o dos oraciones del siguiente tema: {topicName}. Este resumen se pondrá más tarde en una lista con otros resúmenes de este tipo.`,

  "ja": `あなたの仕事は、既に作成された要約に基づいて公開討論の主要な発見の要約を作成することです。これらの要約は、討論で特定されたトピックとサブトピックに対応しています。これらのトピックとサブトピックの要約は、参加者が討論の一部として提出したコメントと投票パターンに基づいています。結果をmarkdownリストとしてフォーマットし、最終レポートの上部近くに含める必要があります。最終レポートには、完全なトピックとサブトピックの要約が含まれます。これらの意見のいずれかを保持しているふりをしないでください。あなたはこの討論の参加者ではありません。各トピックまたはサブトピックに含まれるコメントの数について具体的な数字を含めないでください。これらは最終レポートの出力で後ほど含まれるからです。また、会話の文脈を再説明する必要もありません。これはレポートの早い段階で既に述べられているからです。可能な限り、参加者の視点ではなく、提出された「声明」または全体的な「会話」の観点から結果を説明することを好んでください（注：「コメント」と「声明」は同じものですが、この要約の部分では、「声明」という用語のみを使用してください）。覚えておいてください：これはより大きなレポートの1つのコンポーネントにすぎず、レポートの残りの部分の文脈で自然に流れるようにこれを構成する必要があります。文章を明確で簡潔にし、受動態や曖昧な代名詞を使用しないでください。

出力するリストの構造は、トピック名の観点から、以下の順序で行う必要があります。各リスト項目は、トピック名（以下に正確にリストされているパーセンテージを含む）を太字で開始し、次にコロン、次に対応するトピックの短い1つまたは2つの文の要約で開始する必要があります。完全な応答はmarkdownリストのみで、他のテキストは含まれません。例えば、リスト項目は次のようになります：
<output_format format="markdown">* **トピック名 (45%):** トピックの要約。</output_format>
以下がトピックです：
{topicNames}`
};

/**
 * Multi-language prompt for generating overview summary (per-topic method)
 */
export const OVERVIEW_PER_TOPIC_PROMPT: Record<SupportedLanguage, string> = {
  "en": `Your job is to compose a summary of the key findings from a public discussion, based on already composed summaries corresponding to topics and subtopics identified in said discussion. These topic and subtopic summaries are based on comments and voting patterns that participants submitted as part of the discussion. This summary will be formatted as a markdown list, to be included near the top of the final report, which shall include the complete topic and subtopic summaries. Do not pretend that you hold any of these opinions. You are not a participant in this discussion. Where possible, prefer describing the results in terms of the "statements" submitted or the overall "conversation", rather than in terms of the participants' perspectives (Note: "comments" and "statements" are the same thing, but for the sake of this portion of the summary, only use the term "statements"). Do not include specific numbers about how many comments were included in each topic or subtopic, as these will be included later in the final report output. You also do not need to recap the context of the conversation, as this will have already been stated earlier in the report. Remember: this is just one component of a larger report, and you should compose this so that it will flow naturally in the context of the rest of the report. Be clear and concise in your writing, and do not use the passive voice, or ambiguous pronouns.

Other topics will come later, but for now, your job is to compose a very short one or two sentence summary of the following topic: {topicName}. This summary will be put together into a list with other such summaries later.`,

  "zh-TW": `您的工作是根據已編寫的摘要來撰寫公開討論關鍵發現的摘要，這些摘要對應於討論中識別的主題和子主題。這些主題和子主題摘要是基於參與者作為討論一部分提交的評論和投票模式。此摘要將格式化為 markdown 列表，包含在最終報告的頂部附近，該報告將包含完整的主題和子主題摘要。請勿假裝您持有這些意見中的任何一個。您不是此討論的參與者。在可能的情況下，請優先描述提交的「陳述」或整體「對話」的結果，而不是參與者的觀點（注意：「評論」和「陳述」是同一件事，但為了這部分摘要，只使用「陳述」一詞）。請勿包含關於每個主題或子主題包含多少評論的具體數字，因為這些將在最終報告輸出中稍後包含。您也不需要重述對話的上下文，因為這將在報告的早期已經說明。記住：這只是更大報告的一個組成部分，您應該撰寫它，使其在報告其餘部分的上下文中自然流動。在寫作中要清晰簡潔，不要使用被動語態或模糊的代詞。

其他主題將稍後出現，但現在，您的工作是為以下主題撰寫一個非常簡短的一兩句話摘要：{topicName}。此摘要稍後將與其他此類摘要一起放入列表中。`,

  "zh-CN": `您的工作是根据已编写的摘要来撰写公开讨论关键发现的摘要，这些摘要对应于讨论中识别的主题和子主题。这些主题和子主题摘要是基于参与者作为讨论一部分提交的评论和投票模式。此摘要将格式化为 markdown 列表，包含在最终报告的顶部附近，该报告将包含完整的主题和子主题摘要。请勿假装您持有这些意见中的任何一个。您不是此讨论的参与者。在可能的情况下，请优先描述提交的「陈述」或整体「对话」的结果，而不是参与者的观点（注意：「评论」和「陈述」是同一件事，但为了这部分摘要，只使用「陈述」一词）。请勿包含关于每个主题或子主题包含多少评论的具体数字，因为这些将在最终报告输出中稍后包含。您也不需要重述对话的上下文，因为这将在报告的早期已经说明。记住：这只是更大报告的一个组成部分，您应该撰写它，使其在报告其余部分的上下文中自然流動。在寫作中要清晰簡潔，不要使用被動語態或模糊的代詞。

其他主题将稍后出现，但现在，您的工作是为以下主题撰写一个非常简短的一两句话摘要：{topicName}。此摘要稍后将与其他此类摘要一起放入列表中。`,

  "fr": `Votre travail consiste à composer un résumé des principales découvertes d'une discussion publique, basé sur des résumés déjà composés correspondant aux sujets et sous-sujets identifiés dans ladite discussion. Ces résumés de sujets et sous-sujets sont basés sur les commentaires et les modèles de vote que les participants ont soumis dans le cadre de la discussion. Ce résumé sera formaté sous forme de liste markdown, à inclure près du haut du rapport final, qui inclura les résumés complets des sujets et sous-sujets. Ne prétendez pas que vous détenez l'une de ces opinions. Vous n'êtes pas un participant à cette discussion. Dans la mesure du possible, préférez décrire les résultats en termes de "déclarations" soumises ou de "conversation" globale, plutôt qu'en termes de perspectives des participants (Note : "commentaires" et "déclarations" sont la même chose, mais pour cette partie du résumé, utilisez uniquement le terme "déclarations"). N'incluez pas de chiffres spécifiques sur le nombre de commentaires inclus dans chaque sujet ou sous-sujet, car ceux-ci seront inclus plus tard dans la sortie du rapport final. Vous n'avez pas non plus besoin de récapituler le contexte de la conversation, car cela aura déjà été énoncé plus tôt dans le rapport. Rappelez-vous : ce n'est qu'un composant d'un rapport plus large, et vous devez le composer pour qu'il s'intègre naturellement dans le contexte du reste du rapport. Soyez clair et concis dans votre écriture, et n'utilisez pas la voix passive ou des pronoms ambigus.

D'autres sujets viendront plus tard, mais pour l'instant, votre travail consiste à composer un résumé très court d'une ou deux phrases du sujet suivant : {topicName}. Ce résumé sera plus tard assemblé dans une liste avec d'autres résumés de ce type.`,

  "es": `Su trabajo es componer un resumen de los hallazgos clave de una discusión pública, basado en resúmenes ya compuestos que corresponden a temas y subtemas identificados en dicha discusión. Estos resúmenes de temas y subtemas se basan en comentarios y patrones de votación que los participantes enviaron como parte de la discusión. Este resumen se formateará como una lista markdown, para ser incluida cerca de la parte superior del informe final, que incluirá los resúmenes completos de temas y subtemas. No pretenda que sostiene alguna de estas opiniones. Usted no es un participante en esta discusión. Cuando sea posible, prefiera describir los resultados en términos de las "declaraciones" enviadas o la "conversación" general, en lugar de en términos de las perspectivas de los participantes (Nota: "comentarios" y "declaraciones" son lo mismo, pero por el bien de esta parte del resumen, solo use el término "declaraciones"). No incluya números específicos sobre cuántos comentarios se incluyeron en cada tema o subtema, ya que estos se incluirán más tarde en la salida del informe final. Tampoco necesita recapitular el contexto de la conversación, ya que esto se habrá establecido anteriormente en el informe. Recuerde: esto es solo un componente de un informe más grande, y debe componerlo para que fluya naturalmente en el contexto del resto del informe. Sea claro y conciso en su escritura, y no use la voz pasiva o pronombres ambiguos.

Otros temas vendrán más tarde, pero por ahora, su trabajo es componer un resumen muy corto de una o dos oraciones del siguiente tema: {topicName}. Este resumen se pondrá más tarde en una lista con otros resúmenes de este tipo.`,

  "ja": `あなたの仕事は、既に作成された要約に基づいて公開討論の主要な発見の要約を作成することです。これらの要約は、討論で特定されたトピックとサブトピックに対応しています。これらのトピックとサブトピックの要約は、参加者が討論の一部として提出したコメントと投票パターンに基づいています。この要約はmarkdownリストとしてフォーマットされ、最終レポートの上部近くに含まれます。最終レポートには、完全なトピックとサブトピックの要約が含まれます。これらの意見のいずれかを保持しているふりをしないでください。あなたはこの討論の参加者ではありません。可能な限り、参加者の視点ではなく、提出された「声明」または全体的な「会話」の観点から結果を説明することを好んでください（注：「コメント」と「声明」は同じものですが、この要約の部分では、「声明」という用語のみを使用してください）。各トピックまたはサブトピックに含まれるコメントの数について具体的な数字を含めないでください。これらは最終レポートの出力で後ほど含まれるからです。また、会話の文脈を再説明する必要もありません。これはレポートの早い段階で既に述べられているからです。覚えておいてください：これはより大きなレポートの1つのコンポーネントにすぎず、レポートの残りの部分の文脈で自然に流れるようにこれを構成する必要があります。文章を明確で簡潔にし、受動態や曖昧な代名詞を使用しないでください。

他のトピックは後で来ますが、今のところ、あなたの仕事は以下のトピックの非常に短い1つまたは2つの文の要約を作成することです：{topicName}。この要約は後で他のそのような要約と一緒にリストにまとめられます。`
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

/**
 * Get the localized prompt for overview summary (one-shot method)
 * @param language The target language
 * @param topicNames The list of topic names to replace in the prompt
 * @returns The localized prompt with topic names replaced
 */
export function getOverviewOneShotPrompt(language: SupportedLanguage, topicNames: string[]): string {
  console.log(`[DEBUG] getOverviewOneShotPrompt() language: ${language}`);
  const prompt = OVERVIEW_ONE_SHOT_PROMPT[language] || OVERVIEW_ONE_SHOT_PROMPT["en"];
  return prompt.replace("{topicNames}", topicNames.map((s) => "* " + s).join("\n"));
}

/**
 * Get the localized prompt for overview summary (per-topic method)
 * @param language The target language
 * @param topicName The name of the topic to replace in the prompt
 * @returns The localized prompt with topic name replaced
 */
export function getOverviewPerTopicPrompt(language: SupportedLanguage, topicName: string): string {
  console.log(`[DEBUG] getOverviewPerTopicPrompt() language: ${language}`);
  const prompt = OVERVIEW_PER_TOPIC_PROMPT[language] || OVERVIEW_PER_TOPIC_PROMPT["en"];
  return prompt.replace("{topicName}", topicName);
}

// 主題建模相關的 prompt
export const TOPIC_MODELING_PROMPT: Record<SupportedLanguage, string> = {
  "en": `Analyze the following comments and identify common topics.
Consider the granularity of topics: too few topics may oversimplify the content and miss important nuances, while too many topics may lead to redundancy and make the overall structure less clear.
Aim for a balanced number of topics that effectively summarizes the key themes without excessive detail.
After analysis of the comments, determine the optimal number of topics to represent the content effectively.
Justify why having fewer topics would be less optimal (potentially oversimplifying and missing key nuances), and why having more topics would also be less optimal (potentially leading to redundancy and a less clear overall structure).
After determining the optimal number of topics, identify those topics.

CRITICAL REQUIREMENTS: 
- NEVER create topics with generic names like "Other".
- Each topic MUST have a specific, descriptive name that clearly represents the actual content found in the comments.
- If you cannot identify meaningful topics, create fewer topics with more specific names rather than using generic catch-all terms.
- Output only the actual topics found in the comments, with clear, meaningful names.
- Use the exact JSON schema format specified: [{"name": "Topic Name"}]

Examples of GOOD topic names:
- "AI Safety and Existential Risk"
- "Economic Impact and Labor Market"
- "Privacy and Data Governance"
- "Education and Critical Thinking"

Examples of BAD topic names (DO NOT USE):
- "Other"
- "Miscellaneous" 
- "General"
- "Misc"`,

  "zh-TW": `分析以下評論並識別共同主題。
考慮主題的細粒度：主題太少可能會過度簡化內容並遺漏重要細節，而主題太多可能會導致冗餘並使整體結構不夠清晰。
目標是達到平衡的主題數量，有效總結關鍵主題而不過度詳細。
分析評論後，確定最佳的主題數量以有效代表內容。
說明為什麼主題太少會不理想（可能過度簡化並遺漏關鍵細節），以及為什麼主題太多也會不理想（可能導致冗餘和整體結構不夠清晰）。
確定最佳主題數量後，識別這些主題。

關鍵要求：
- 絕對不要創建名為「其他」或類似籠統名稱的主題。
- 每個主題都必須有具體、描述性的名稱，清楚代表評論中發現的實際內容。
- 如果無法識別有意義的主題，創建較少的主題但使用更具體的名稱，而不是使用籠統的包羅萬象術語。
- 只輸出在評論中發現的實際主題，使用清晰、有意義的名稱。
- 使用指定的確切 JSON 架構格式：[{"name": "主題名稱"}]

好的主題名稱範例：
- 「AI 安全與存在風險」
- 「經濟的影響與勞動市場」
- 「隱私與數據治理」
- 「教育與批判性思考」

不好的主題名稱範例（請勿使用）：
- 「其他」
- 「雜項」
- 「一般」
- 「其他」`,

  "zh-CN": `分析以下评论并识别共同主题。
考虑主题的细粒度：主题太少可能会过度简化内容并遗漏重要细节，而主题太多可能会导致冗余并使整体结构不够清晰。
目标是达到平衡的主题数量，有效总结关键主题而不过度详细。
分析评论后，确定最佳的主题数量以有效代表内容。
说明为什么主题太少会不理想（可能过度简化并遗漏关键细节），以及为什么主题太多也会不理想（可能导致冗余和整体结构不够清晰）。
确定最佳主题数量后，识别这些主题。

关键要求：
- 绝对不要创建名为「其他」或类似笼统名称的主题。
- 每个主题都必须有具体、描述性的名称，清楚代表评论中发现的实际内容。
- 如果无法识别有意义的主题，创建较少的主题但使用更具体的名称，而不是使用笼统的包罗万象术语。
- 只输出在评论中发现的实际主题，使用清晰、有意义的名称。
- 使用指定的确切 JSON 架构格式：[{"name": "主题名称"}]

好的主题名称范例：
- 「AI 安全与存在风险」
- 「经济影响与劳动市场」
- 「隐私与数据治理」
- 「教育与批判性思考」

不好的主题名称范例（请勿使用）：
- 「其他」
- 「杂项」
- 「一般」
- 「其他」`,

  "fr": `Analysez les commentaires suivants et identifiez les sujets communs.
Considérez la granularité des sujets : trop peu de sujets peuvent simplifier à l'excès le contenu et manquer des nuances importantes, tandis que trop de sujets peuvent mener à la redondance et rendre la structure globale moins claire.
Visez un nombre équilibré de sujets qui résume efficacement les thèmes clés sans détails excessifs.
Après analyse des commentaires, déterminez le nombre optimal de sujets pour représenter efficacement le contenu.
Justifiez pourquoi avoir moins de sujets serait moins optimal (potentiellement simplifier à l'excès et manquer des nuances clés), et pourquoi avoir plus de sujets serait également moins optimal (potentiellement mener à la redondance et une structure globale moins claire).
Après avoir déterminé le nombre optimal de sujets, identifiez ces sujets.

EXIGENCES CRITIQUES :
- NE créez JAMAIS de sujets avec des noms génériques comme "Autre".
- Chaque sujet DOIT avoir un nom spécifique et descriptif qui représente clairement le contenu réel trouvé dans les commentaires.
- Si vous ne pouvez pas identifier des sujets significatifs, créez moins de sujets avec des noms plus spécifiques plutôt que d'utiliser des termes génériques fourre-tout.
- N'outputez que les sujets réels trouvés dans les commentaires, avec des noms clairs et significatifs.
- Utilisez le format de schéma JSON exact spécifié : [{"name": "Nom du Sujet"}]

Exemples de BONS noms de sujets :
- "Sécurité de l'IA et Risque Existentiel"
- "Impact Économique et Marché du Travail"
- "Vie Privée et Gouvernance des Données"
- "Éducation et Pensée Critique"

Exemples de MAUVAIS noms de sujets (NE PAS UTILISER) :
- "Autre"
- "Divers"
- "Général"
- "Misc"`,

  "es": `Analiza los siguientes comentarios e identifica temas comunes.
Considera la granularidad de los temas: muy pocos temas pueden simplificar en exceso el contenido y perder matices importantes, mientras que demasiados temas pueden llevar a la redundancia y hacer la estructura general menos clara.
Apunta a un número equilibrado de temas que resuma efectivamente los temas clave sin detalles excesivos.
Después de analizar los comentarios, determina el número óptimo de temas para representar efectivamente el contenido.
Justifica por qué tener menos temas sería menos óptimo (potencialmente simplificar en exceso y perder matices clave), y por qué tener más temas también sería menos óptimo (potencialmente llevar a la redundancia y una estructura general menos clara).
Después de determinar el número óptimo de temas, identifica esos temas.

REQUISITOS CRÍTICOS:
- NUNCA crees temas con nombres genéricos como "Otro".
- Cada tema DEBE tener un nombre específico y descriptivo que represente claramente el contenido real encontrado en los comentarios.
- Si no puedes identificar temas significativos, crea menos temas con nombres más específicos en lugar de usar términos genéricos de cajón de sastre.
- Solo outputa los temas reales encontrados en los comentarios, con nombres claros y significativos.
- Usa el formato de esquema JSON exacto especificado: [{"name": "Nombre del Tema"}]

Ejemplos de BUENOS nombres de temas:
- "Seguridad de IA y Riesgo Existencial"
- "Impacto Económico y Mercado Laboral"
- "Privacidad y Gobernanza de Datos"
- "Educación y Pensamiento Crítico"

Ejemplos de MALOS nombres de temas (NO USAR):
- "Otro"
- "Misceláneo"
- "General"
- "Misc"`,

  "ja": `以下のコメントを分析し、共通のトピックを特定してください。
トピックの細かさを考慮してください：トピックが少なすぎると内容を過度に簡素化し、重要なニュアンスを見落とす可能性があります。一方、トピックが多すぎると冗長性を招き、全体的な構造が不明確になる可能性があります。
重要なテーマを効果的に要約し、過度な詳細を避けるバランスの取れた数のトピックを目指してください。
コメントを分析した後、内容を効果的に表現する最適なトピック数を決定してください。
トピックが少なすぎることがなぜ最適でないか（過度に簡素化し、重要なニュアンスを見落とす可能性）、そしてトピックが多すぎることがなぜ最適でないか（冗長性を招き、全体的な構造が不明確になる可能性）を説明してください。
最適なトピック数を決定した後、それらのトピックを特定してください。

重要な要件：
- 「その他」などの汎用的な名前のトピックを絶対に作成しないでください。
- 各トピックは、コメントで見つかった実際の内容を明確に表現する具体的で説明的な名前を持つ必要があります。
- 意味のあるトピックを特定できない場合は、汎用的な包括用語を使用するのではなく、より具体的な名前でより少ないトピックを作成してください。
- コメントで見つかった実際のトピックのみを出力し、明確で意味のある名前を使用してください。
- 指定された正確なJSONスキーマ形式を使用してください：[{"name": "トピック名"}]

良いトピック名の例：
- 「AI安全性と存在リスク」
- 「経済的影響と労働市場」
- 「プライバシーの懸念とデータ保護」
- 「教育への影響と学習方法」

悪いトピック名の例（使用しないでください）：
- 「その他」
- 「雑多」
- 「一般」
- 「その他」`
};

// 子主題建模相關的 prompt
export const SUBTOPIC_MODELING_PROMPT: Record<SupportedLanguage, string> = {
  "en": `Analyze the following comments and identify common subtopics within the following overarching topic: "{parentTopic}".
Consider the granularity of subtopics: too few subtopics may oversimplify the content and miss important nuances, while too many subtopics may lead to redundancy and make the overall structure less clear.
Aim for a balanced number of subtopics that effectively summarizes the key themes without excessive detail.
After analysis of the comments, determine the optimal number of subtopics to represent the content effectively.
Justify why having fewer subtopics would be less optimal (potentially oversimplifying and missing key nuances), and why having more subtopics would also be less optimal (potentially leading to redundancy and a less clear overall structure).
After determining the optimal number of subtopics, identify those subtopics.

CRITICAL REQUIREMENTS:
- NEVER create subtopics with generic names like "Other".
- Each subtopic MUST have a specific, descriptive name that clearly represents the actual content found in the comments.
- If you cannot identify meaningful subtopics, create fewer subtopics with more specific names rather than using generic catch-all terms.
- No subtopics should have the same name as the overarching topic.
- There are other overarching topics that are being used on different sets of comments, do not use these overarching topic names as identified subtopics names: {otherTopics}

Examples of GOOD subtopic names:
- "Safety Protocols and Risk Assessment"
- "Economic Disruption and Job Market Changes"
- "Privacy Concerns and Data Protection"
- "Educational Impact and Learning Methods"

Examples of BAD subtopic names (DO NOT USE):
- "Other"
- "Miscellaneous"
- "General"
- "Misc"`,

  "zh-TW": `分析以下評論並識別以下總體主題內的共同子主題：「{parentTopic}」。
考慮子主題的細粒度：子主題太少可能會過度簡化內容並遺漏重要細節，而子主題太多可能會導致冗餘並使整體結構不夠清晰。
目標是達到平衡的子主題數量，有效總結關鍵主題而不過度詳細。
分析評論後，確定最佳的子主題數量以有效代表內容。
說明為什麼子主題太少會不理想（可能過度簡化並遺漏關鍵細節），以及為什麼子主題太多也會不理想（可能導致冗餘和整體結構不夠清晰）。
確定最佳子主題數量後，識別這些子主題。

關鍵要求：
- 絕對不要創建名為「其他」或類似籠統名稱的子主題。
- 每個子主題都必須有具體、描述性的名稱，清楚代表評論中發現的實際內容。
- 如果無法識別有意義的子主題，創建較少的子主題但使用更具體的名稱，而不是使用籠統的包羅萬象術語。
- 任何子主題都不應該與總體主題同名。
- 有其他總體主題正在不同的評論集合中使用，不要將這些總體主題名稱用作識別的子主題名稱：{otherTopics}

好的子主題名稱範例：
- 「安全協議與風險評估」
- 「經濟破壞與勞動市場變化」
- 「隱私關注與數據保護」
- 「教育影響與學習方法」

不好的子主題名稱範例（請勿使用）：
- 「其他」
- 「雜項」
- 「一般」
- 「其他」`,

  "zh-CN": `分析以下评论并识别以下总体主题内的共同子主题：「{parentTopic}」。
考虑子主题的细粒度：子主题太少可能会过度简化内容并遗漏重要细节，而子主题太多可能会导致冗余并使整体结构不够清晰。
目标是达到平衡的子主题数量，有效总结关键主题而不过度详细。
分析评论后，确定最佳的子主题数量以有效代表内容。
说明为什么子主题太少会不理想（可能过度简化并遗漏关键细节），以及为什么子主题太多也会不理想（可能导致冗余和整体结构不够清晰）。
确定最佳子主题数量后，识别这些子主题。

关键要求：
- 绝对不要创建名为「其他」或类似笼统名称的子主题。
- 每个子主题都必须有具体、描述性的名称，清楚代表评论中发现的实际内容。
- 如果无法识别有意义的子主题，创建较少的子主题但使用更具体的名称，而不是使用笼统的包罗万象术语。
- 任何子主题都不应该与总体主题同名。
- 有其他总体主题正在不同的评论集合中使用，不要将这些总体主题名称用作识别的子主题名称：{otherTopics}

好的子主题名称范例：
- 「安全协议与风险评估」
- 「经济破坏与劳动市场变化」
- 「隐私关注与数据保护」
- 「教育影响与学习方法」

不好的子主题名称范例（请勿使用）：
- 「其他」
- 「杂项」
- 「一般」
- 「其他」`,

  "fr": `Analysez les commentaires suivants et identifiez les sous-sujets communs dans le sujet général suivant : "{parentTopic}".
Considérez la granularité des sous-sujets : trop peu de sous-sujets peuvent simplifier à l'excès le contenu et manquer des nuances importantes, tandis que trop de sous-sujets peuvent mener à la redondance et rendre la structure globale moins claire.
Visez un nombre équilibré de sous-sujets qui résume efficacement les thèmes clés sans détails excessifs.
Après analyse des commentaires, déterminez le nombre optimal de sous-sujets pour représenter efficacement le contenu.
Justifiez pourquoi avoir moins de sous-sujets serait moins optimal (potentiellement simplifier à l'excès et manquer des nuances clés), et pourquoi avoir plus de sous-sujets serait également moins optimal (potentiellement mener à la redondance et une structure globale moins claire).
Après avoir déterminé le nombre optimal de sous-sujets, identifiez ces sous-sujets.

EXIGENCES CRITIQUES :
- NE créez JAMAIS de sous-sujets avec des noms génériques comme "Autre".
- Chaque sous-sujet DOIT avoir un nom spécifique et descriptif qui représente clairement le contenu réel trouvé dans les commentaires.
- Si vous ne pouvez pas identifier des sous-sujets significatifs, créez moins de sous-sujets avec des noms plus spécifiques plutôt que d'utiliser des termes génériques fourre-tout.
- Aucun sous-sujet ne devrait avoir le même nom que le sujet général.
- Il y a d'autres sujets généraux qui sont utilisés sur différents ensembles de commentaires, n'utilisez pas ces noms de sujets généraux comme noms de sous-sujets identifiés : {otherTopics}

Exemples de BONS noms de sous-sujets :
- "Protocoles de Sécurité et Évaluation des Risques"
- "Perturbation Économique et Changements du Marché du Travail"
- "Préoccupations de Vie Privée et Protection des Données"
- "Impact Éducatif et Méthodes d'Apprentissage"

Exemples de MAUVAIS noms de sous-sujets (NE PAS UTILISER) :
- "Autre"
- "Divers"
- "Général"
- "Misc"`,

  "es": `Analiza los siguientes comentarios e identifica subtemas comunes dentro del tema general siguiente: "{parentTopic}".
Considera la granularidad de los subtemas: muy pocos subtemas pueden simplificar en exceso el contenido y perder matices importantes, mientras que demasiados subtemas pueden llevar a la redundancia y hacer la estructura general menos clara.
Apunta a un número equilibrado de subtemas que resuma efectivamente los temas clave sin detalles excesivos.
Después de analizar los comentarios, determina el número óptimo de subtemas para representar efectivamente el contenido.
Justifica por qué tener menos subtemas sería menos óptimo (potencialmente simplificar en exceso y perder matices clave), y por qué tener más subtemas también sería menos óptimo (potencialmente llevar a la redundancia y una estructura general menos clara).
Después de determinar el número óptimo de subtemas, identifica esos subtemas.

REQUISITOS CRÍTICOS:
- NUNCA crees subtemas con nombres genéricos como "Otro".
- Cada subtema DEBE tener un nombre específico y descriptivo que represente claramente el contenido real encontrado en los comentarios.
- Si no puedes identificar subtemas significativos, crea menos subtemas con nombres más específicos en lugar de usar términos genéricos de cajón de sastre.
- Ningún subtema debe tener el mismo nombre que el tema general.
- Hay otros temas generales que se están usando en diferentes conjuntos de comentarios, no uses estos nombres de temas generales como nombres de subtemas identificados: {otherTopics}

Ejemplos de BUENOS nombres de subtemas:
- "Protocolos de Seguridad y Evaluación de Riesgos"
- "Disrupción Económica y Cambios en el Mercado Laboral"
- "Preocupaciones de Privacidad y Protección de Datos"
- "Impacto Educativo y Métodos de Aprendizaje"

Ejemplos de MALOS nombres de subtemas (NO USAR):
- "Otro"
- "Misceláneo"
- "General"
- "Misc"`,

  "ja": `以下のコメントを分析し、以下の包括的なトピック内の共通のサブトピックを特定してください：「{parentTopic}」。
サブトピックの細かさを考慮してください：サブトピックが少なすぎると内容を過度に簡素化し、重要なニュアンスを見落とす可能性があります。一方、サブトピックが多すぎると冗長性を招き、全体的な構造が不明確になる可能性があります。
重要なテーマを効果的に要約し、過度な詳細を避けるバランスの取れた数のサブトピックを目指してください。
コメントを分析した後、内容を効果的に表現する最適なサブトピック数を決定してください。
サブトピックが少なすぎることがなぜ最適でないか（過度に簡素化し、重要なニュアンスを見落とす可能性）、そしてサブトピックが多すぎることがなぜ最適でないか（冗長性を招き、全体的な構造が不明確になる可能性）を説明してください。
最適なサブトピック数を決定した後、それらのサブトピックを特定してください。

重要な要件：
- 「その他」などの汎用的な名前のサブトピックを絶対に作成しないでください。
- 各サブトピックは、コメントで見つかった実際の内容を明確に表現する具体的で説明的な名前を持つ必要があります。
- 意味のあるサブトピックを特定できない場合は、汎用的な包括用語を使用するのではなく、より具体的な名前でより少ないサブトピックを作成してください。
- いかなるサブトピックも包括的なトピックと同じ名前を持つべきではありません。
- 他の包括的なトピックが異なるコメントセットで使用されています。これらの包括的なトピック名を識別されたサブトピック名として使用しないでください：{otherTopics}

良いサブトピック名の例：
- 「安全プロトコルとリスク評価」
- 「経済的混乱と労働市場の変化」
- 「プライバシーの懸念とデータ保護」
- 「教育への影響と学習方法」

悪いサブトピック名の例（使用しないでください）：
- 「その他」
- 「雑多」
- 「一般」
- 「その他」`
};

// 獲取主題建模 prompt 的函數
export function getTopicModelingPrompt(language: SupportedLanguage): string {
  return TOPIC_MODELING_PROMPT[language] || TOPIC_MODELING_PROMPT["en"];
}

// 獲取子主題建模 prompt 的函數
export function getSubtopicModelingPrompt(
  language: SupportedLanguage, 
  parentTopic: string, 
  otherTopics?: string
): string {
  const prompt = SUBTOPIC_MODELING_PROMPT[language] || SUBTOPIC_MODELING_PROMPT["en"];
  return prompt
    .replace("{parentTopic}", parentTopic)
    .replace("{otherTopics}", otherTopics || "");
}
