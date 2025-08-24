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

  "zh-CN": `您的工作是根据已编写的摘要来撰写公开讨论关键发现的摘要，这些摘要对应于讨论中识别的主题和子主题。这些主题和子主题摘要是基于参与者作为讨论一部分提交的评论和投票模式。您应该将结果格式化为 markdown 列表，包含在最终报告的顶部附近，该报告将包含完整的主题和子主题摘要。请勿假装您持有这些意见中的任何一个。您不是此讨论的参与者。请勿包含关于每个主题或子主题包含多少评论的具体数字，因为这些将在最终报告输出中稍后包含。您也不需要重述对话的上下文，因为这将在报告的早期已经说明。在可能的情况下，请优先描述提交的「陈述」或整体「对话」的结果，而不是参与者的观点（注意：「评论」和「陈述」是同一件事，但为了这部分摘要，只使用「陈述」一词）。记住：这只是更大报告的一个组成部分，您应该撰写它，使其在报告其余部分的上下文中自然流動。在写作中要清晰简洁，不要使用被动语态或模糊的代词。

您输出的列表结构应该按照主题名称，按照以下顺序。每个列表项目应该以粗体开始，包含主题名称（包括百分比，完全按照下面列出的），然后是冒号，然后是对应主题的简短一两句话摘要。完整回应应该只是 markdown 列表，没有其他文字。例如，列表项目可能看起来像这样：
<output_format format="markdown">* **主题名称 (45%):** 主题摘要。</output_format>
以下是主题：
{topicNames}`,

  "fr": `Votre travail consiste à composer un résumé des principales découvertes d'une discussion publique, basé sur des résumés déjà composés correspondant aux sujets et sous-sujets identifiés dans ladite discussion. Ces résumés de sujets et sous-sujets sont basés sur les commentaires et les modèles de vote que les participants ont soumis dans le cadre de la discussion. Vous devez formater les résultats sous forme de liste markdown, à inclure près du haut du rapport final, qui inclura les résumés complets des sujets et sous-sujets. Ne prétendez pas que vous détenez l'une de ces opinions. Vous n'êtes pas un participant à cette discussion. N'incluez pas de chiffres spécifiques sur le nombre de commentaires inclus dans chaque sujet ou sous-sujet, car ceux-ci seront inclus plus tard dans la sortie du rapport final. Vous n'avez pas non plus besoin de récapituler le contexte de la conversation, car cela aura déjà été énoncé plus tôt dans le rapport. Dans la mesure du possible, préférez décrire les résultats en termes de "déclarations" soumises ou de "conversation" globale, plutôt qu'en termes de perspectives des participants (Note : "commentaires" et "déclarations" sont la même chose, mais pour cette partie du résumé, utilisez uniquement le terme "déclarations"). Rappelez-vous : ce n'est qu'un composant d'un rapport plus large, et vous devez le composer pour qu'il s'intègre naturellement dans le contexte du reste du rapport. Soyez clair et concis dans votre écriture, et n'utilisez pas la voix passive ou des pronoms ambigus.

La structure de la liste que vous produisez doit être en termes de noms de sujets, dans l'ordre qui suit. Chaque élément de liste doit commencer en gras avec le nom du sujet (y compris le pourcentage, exactement comme listé ci-dessous), puis deux points, puis un résumé court d'une ou deux phrases pour le sujet correspondant. La réponse complète doit être uniquement la liste markdown, sans autre texte. Par exemple, un élément de liste pourrait ressembler à ceci :
<output_format format="markdown">* **Nom du sujet (45%) :** Résumé du sujet.</output_format>
Voici les sujets :
{topicNames}`,

  "es": `Su trabajo es componer un resumen de los hallazgos clave de una discusión pública, basado en resúmenes ya compuestos que corresponden a temas y subtemas identificados en dicha discusión. Estos resúmenes de temas y subtemas se basan en comentarios y patrones de votación que los participantes enviaron como parte de la discusión. Debe formatear los resultados como una lista markdown, para ser incluida cerca de la parte superior del informe final, que incluirá los resúmenes completos de temas y subtemas. No pretenda que sostiene alguna de estas opiniones. Usted no es un participante en esta discusión. No incluya números específicos sobre cuántos comentarios se incluyeron en cada tema o subtema, ya que estos se incluirán más tarde en la salida del informe final. Tampoco necesita recapitular el contexto de la conversación, ya que esto se habrá establecido anteriormente en el informe. Cuando sea posible, prefiera describir los resultados en términos de las "declaraciones" enviadas o la "conversación" general, en lugar de en términos de las perspectivas de los participantes (Nota: "comentarios" y "declaraciones" son lo mismo, pero por el bien de esta parte del resumen, solo use el término "declaraciones"). Recuerde: esto es solo un componente de un informe más grande, y debe componerlo para que fluya naturalmente en el contexto del resto del informe. Sea claro y conciso en su escritura, y no use la voz pasiva o pronombres ambiguos.

La estructura de la lista que produce debe ser en términos de los nombres de los temas, en el orden que sigue. Cada elemento de la lista debe comenzar en negrita con el nombre del tema (incluyendo el porcentaje, exactamente como se enumera a continuación), luego dos puntos, y luego un resumen corto de una o dos oraciones para el tema correspondiente. La respuesta completa debe ser solo la lista markdown, sin otro texto. Por ejemplo, un elemento de la lista podría verse así:
<output_format format="markdown">* **Nombre del Tema (45%):** Resumen del tema.</output_format>
Aquí están los temas:
{topicNames}`,

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
