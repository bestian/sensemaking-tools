import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import '@conversationai/sensemaker-visualizations';
import { UiLanguage, normalizeLang, translate } from '../../i18n/i18n';

type ChartWordKey =
  | 'downloadData'
  | 'downloadDataAria'
  | 'groupAlignment'
  | 'groupUncertainty'
  | 'groupUncategorized'
  | 'sectionHigh'
  | 'sectionLow'
  | 'ofStatements'
  | 'legendFewerShort'
  | 'legendMoreShort';

@Component({
  selector: 'app-sensemaking-chart-wrapper',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="chart-container">
      <sensemaker-chart
        #sensemakingChartEl
        [attr.id]="chartId"
        [attr.chart-type]="chartType"
        [attr.view]="view"
        [attr.topic-filter]="topicFilter"
        [attr.lang]="outputLang"
        [attr.colors]="colors.length ? (colors | json) : null"
      ></sensemaker-chart>
    </div>
  `,
  styles: [
    `
      .chart-container {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class SensemakingChartWrapperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('sensemakingChartEl') chartElementRef!: ElementRef<
    HTMLElement & {
      data?: any;
      summaryData?: any;
    }
  >;

  @Input() chartId: string = '';
  @Input() chartType: string = 'topics-distribution';
  @Input() view: string = 'cluster';
  @Input() topicFilter: string = '';
  @Input() colors: string[] = [];
  @Input() data: any;
  @Input() summaryData: any;
  @Input() outputLang: UiLanguage = 'en';

  private mutationObserver?: MutationObserver;
  private isApplyingPatch = false;
  private patchTimer?: number;

  ngAfterViewInit() {
    this.applyChartInputs();
    this.startChartI18nPatch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartElementRef?.nativeElement) {
      return;
    }
    if (changes['data'] || changes['summaryData']) {
      this.applyChartInputs();
    }
    if (changes['outputLang']) {
      this.scheduleChartI18nPatch();
    }
  }

  ngOnDestroy(): void {
    this.mutationObserver?.disconnect();
    if (this.patchTimer !== undefined) {
      window.clearTimeout(this.patchTimer);
      this.patchTimer = undefined;
    }
  }

  private applyChartInputs(): void {
    if (!this.chartElementRef?.nativeElement) return;
    const chartElement = this.chartElementRef.nativeElement;
    chartElement.data = this.data;
    chartElement.summaryData = this.summaryData;
  }

  private startChartI18nPatch(): void {
    const chartElement = this.chartElementRef?.nativeElement;
    const shadowRoot = chartElement?.shadowRoot;
    if (!shadowRoot) {
      return;
    }

    this.scheduleChartI18nPatch();

    this.mutationObserver?.disconnect();
    this.mutationObserver = new MutationObserver(() => {
      this.scheduleChartI18nPatch();
    });
    this.mutationObserver.observe(shadowRoot, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label'],
    });
  }

  private scheduleChartI18nPatch(): void {
    if (this.patchTimer !== undefined) {
      window.clearTimeout(this.patchTimer);
    }
    this.patchTimer = window.setTimeout(() => {
      this.patchTimer = undefined;
      this.applyChartI18nPatch();
    }, 0);
  }

  private applyChartI18nPatch(): void {
    const chartElement = this.chartElementRef?.nativeElement;
    const shadowRoot = chartElement?.shadowRoot;
    if (!shadowRoot || this.isApplyingPatch) {
      return;
    }

    const lang = normalizeLang(this.outputLang);
    const fullPhraseMap = this.getFullPhraseReplacementMap(lang);
    const replacementMap = this.getReplacementMap(lang);
    const replaceRegex = (value: string): string => {
      let next = value;
      next = next.replace(/\((\d+)\s+statements\)/g, (_m, count) => this.tSubtopicStatementCount(lang, Number(count)));
      next = next.replace(/\b(\d+)\s+subtopics\b/g, (_m, count) => this.tSubtopics(lang, Number(count)));
      next = next.replace(/\b(\d+)\s+statements\b/g, (_m, count) => this.tStatements(lang, Number(count)));
      return next;
    };

    this.isApplyingPatch = true;
    try {
      const treeWalker = document.createTreeWalker(shadowRoot, NodeFilter.SHOW_TEXT);
      let node = treeWalker.nextNode();
      while (node) {
        const textNode = node as Text;
        const original = textNode.nodeValue ?? '';
        let next = this.applyExactReplacements(original, fullPhraseMap);
        next = this.applyExactReplacements(next, replacementMap);
        next = replaceRegex(next);
        if (next !== original) {
          textNode.nodeValue = next;
        }
        node = treeWalker.nextNode();
      }

      shadowRoot.querySelectorAll<HTMLElement>('[aria-label]').forEach((el) => {
        const aria = el.getAttribute('aria-label');
        if (!aria) return;
        let next = this.applyExactReplacements(aria, fullPhraseMap);
        next = this.applyExactReplacements(next, replacementMap);
        next = replaceRegex(next);
        if (next !== aria) {
          el.setAttribute('aria-label', next);
        }
      });
    } finally {
      this.isApplyingPatch = false;
    }
  }

  private getReplacementMap(lang: UiLanguage): Map<string, string> {
    const unsurePass = this.t(lang, 'unsurePass').replace(/^["']|["']$/g, '').replace(/[“”]/g, '"');
    return new Map<string, string>([
      ['Download Data', this.chartWord(lang, 'downloadData')],
      ['Download data for this chart', this.chartWord(lang, 'downloadDataAria')],
      ['voted agree', this.t(lang, 'votedAgree')],
      ['voted disagree', this.t(lang, 'votedDisagree')],
      ['voted "unsure/pass"', this.t(lang, 'votedUnsurePass').replace(/[“”]/g, '"')],
      ['total votes', this.t(lang, 'totalVotesLabel')],
      ['Agree', this.t(lang, 'agree')],
      ['Disagree', this.t(lang, 'disagree')],
      ['Unsure/Passed', unsurePass],
      ['Alignment', this.chartWord(lang, 'groupAlignment')],
      ['Uncertainty', this.chartWord(lang, 'groupUncertainty')],
      ['Uncategorized', this.chartWord(lang, 'groupUncategorized')],
      ['High', this.chartWord(lang, 'sectionHigh')],
      ['Low', this.chartWord(lang, 'sectionLow')],
      ['Fewer', this.chartWord(lang, 'legendFewerShort')],
      ['More', this.chartWord(lang, 'legendMoreShort')],
      ['1 subtopic', this.tSubtopicSingular(lang)],
      ['Of statements', this.chartWord(lang, 'ofStatements')],
    ]);
  }

  private applyExactReplacements(value: string, replacements: Map<string, string>): string {
    let next = value;
    for (const [from, to] of replacements.entries()) {
      if (next.includes(from)) {
        next = next.split(from).join(to);
      }
    }
    return next;
  }

  private getFullPhraseReplacementMap(lang: UiLanguage): Map<string, string> {
    if (lang === 'en') {
      return new Map<string, string>();
    }

    const en = {
      tipAlignmentBody:
        'These statements showed an especially high or especially low level of alignment amongst participants',
      tipHighBody: '70% or more of participants agreed or disagreed with these statements.',
      tipLowBody:
        'Opinions were split. 40–60% of voters either agreed or disagreed with these statements.',
      tipUncategorizedBody:
        'These statements do not meet criteria for high alignment, low alignment, or high uncertainty.',
      tipUncertaintyBody:
        'Statements in this category were among the 25% most passed on in the conversation as a whole or were passed on by at least 20% of participants.',
      scatterTipHighAgreeBody:
        'On average, 70% or more of participants agreed with statements in this subtopic.',
      scatterTipLowBody:
        'Opinions were split. On average, 40–60% of voters either agreed or disagreed with statements in this subtopic.',
      scatterTipHighDisagreeBody:
        'On average, 70% or more of participants disagreed with statements in this subtopic on average.',
      altDefault: 'A data visualization showing data generated from the Sensemaker tools',
    };

    const zhTW = {
      tipAlignmentBody: '這些留言在參與者之間呈現特別高或特別低的一致性',
      tipHighBody: '70% 以上參與者對這些留言投下相同方向（同意或不同意）。',
      tipLowBody: '意見分歧。這些留言中，約 40–60% 投票者分別選擇同意或不同意。',
      tipUncategorizedBody: '這些留言不符合高一致性、低一致性或高不確定性的條件。',
      tipUncertaintyBody:
        '此類留言為整體對話中被略過比例前 25%，或至少有 20% 參與者選擇略過。',
      scatterTipHighAgreeBody: '此子主題的留言平均有 70% 以上參與者投下同意。',
      scatterTipLowBody:
        '意見分歧。此子主題的留言平均有約 40–60% 投票者選擇同意或不同意。',
      scatterTipHighDisagreeBody: '此子主題的留言平均有 70% 以上參與者投下不同意。',
      altDefault: '以 Sensemaker 工具產生的資料視覺化圖表',
    };

    const zhCN = {
      tipAlignmentBody: '这些留言在参与者之间呈现特别高或特别低的一致性',
      tipHighBody: '70% 以上参与者对这些留言投下相同方向（同意或不同意）。',
      tipLowBody: '意见分歧。这些留言中，约 40–60% 的投票者分别选择同意或不同意。',
      tipUncategorizedBody: '这些留言不符合高一致性、低一致性或高不确定性的条件。',
      tipUncertaintyBody:
        '此类留言为整体对话中被略过比例前 25%，或至少有 20% 的参与者选择略过。',
      scatterTipHighAgreeBody: '此子主题的留言平均有 70% 以上参与者投下同意。',
      scatterTipLowBody:
        '意见分歧。此子主题的留言平均约有 40–60% 的投票者选择同意或不同意。',
      scatterTipHighDisagreeBody: '此子主题的留言平均有 70% 以上参与者投下不同意。',
      altDefault: '以 Sensemaker 工具生成的数据可视化图表',
    };

    const fr = {
      tipAlignmentBody:
        'Ces déclarations présentaient un niveau d’alignement particulièrement élevé ou particulièrement faible parmi les participants',
      tipHighBody:
        '70 % ou plus des participants étaient d’accord ou en désaccord avec ces déclarations.',
      tipLowBody:
        'Les opinions étaient partagées. 40–60 % des votants étaient d’accord ou en désaccord avec ces déclarations.',
      tipUncategorizedBody:
        'Ces déclarations ne répondent pas aux critères d’alignement élevé, de faible alignement ou de forte incertitude.',
      tipUncertaintyBody:
        'Les déclarations de cette catégorie figurent parmi les 25 % les plus passées de la conversation, ou ont été passées par au moins 20 % des participants.',
      scatterTipHighAgreeBody:
        'En moyenne, 70 % ou plus des participants étaient d’accord avec les déclarations de ce sous-sujet.',
      scatterTipLowBody:
        'Les opinions étaient partagées. En moyenne, 40–60 % des votants étaient d’accord ou en désaccord avec les déclarations de ce sous-sujet.',
      scatterTipHighDisagreeBody:
        'En moyenne, 70 % ou plus des participants étaient en désaccord avec les déclarations de ce sous-sujet.',
      altDefault: 'Une visualisation de données générée à partir des outils Sensemaker',
    };

    const es = {
      tipAlignmentBody:
        'Estas declaraciones mostraron un nivel de alineación especialmente alto o especialmente bajo entre los participantes',
      tipHighBody:
        'El 70 % o más de los participantes estuvo de acuerdo o en desacuerdo con estas declaraciones.',
      tipLowBody:
        'Las opiniones estuvieron divididas. Entre el 40 % y el 60 % de los votantes estuvo de acuerdo o en desacuerdo con estas declaraciones.',
      tipUncategorizedBody:
        'Estas declaraciones no cumplen los criterios de alta alineación, baja alineación o alta incertidumbre.',
      tipUncertaintyBody:
        'Las declaraciones de esta categoría se encontraban entre el 25 % más pasadas en la conversación o fueron pasadas por al menos el 20 % de los participantes.',
      scatterTipHighAgreeBody:
        'En promedio, el 70 % o más de los participantes estuvo de acuerdo con las declaraciones de este subtema.',
      scatterTipLowBody:
        'Las opiniones estuvieron divididas. En promedio, entre el 40 % y el 60 % de los votantes estuvo de acuerdo o en desacuerdo con las declaraciones de este subtema.',
      scatterTipHighDisagreeBody:
        'En promedio, el 70 % o más de los participantes estuvo en desacuerdo con las declaraciones de este subtema.',
      altDefault: 'Una visualización de datos generada con las herramientas Sensemaker',
    };

    const ja = {
      tipAlignmentBody:
        'これらのステートメントは、参加者の間で特に高いまたは特に低い合意度を示しました',
      tipHighBody:
        '70% 以上の参加者がこれらのステートメントに対して同じ方向（賛成または反対）に投票しました。',
      tipLowBody:
        '意見は分かれました。投票者の 40〜60% がそれぞれ賛成または反対しました。',
      tipUncategorizedBody:
        'これらのステートメントは、高い合意度・低い合意度・高い不確実性のいずれの基準も満たしていません。',
      tipUncertaintyBody:
        'このカテゴリのステートメントは、対話全体でパスされた割合の上位 25% に入るか、20% 以上の参加者にパスされたものです。',
      scatterTipHighAgreeBody:
        'このサブトピックのステートメントでは、平均して 70% 以上の参加者が賛成しました。',
      scatterTipLowBody:
        '意見は分かれました。このサブトピックのステートメントでは、平均して 40〜60% の投票者が賛成または反対しました。',
      scatterTipHighDisagreeBody:
        'このサブトピックのステートメントでは、平均して 70% 以上の参加者が反対しました。',
      altDefault: 'Sensemaker ツールで生成されたデータの可視化',
    };

    const de = {
      tipAlignmentBody:
        'Diese Aussagen zeigten ein besonders hohes oder besonders niedriges Maß an Übereinstimmung unter den Teilnehmenden',
      tipHighBody:
        '70 % oder mehr der Teilnehmenden stimmten diesen Aussagen zu oder lehnten sie ab.',
      tipLowBody:
        'Die Meinungen waren geteilt. 40–60 % der Abstimmenden stimmten diesen Aussagen zu oder lehnten sie ab.',
      tipUncategorizedBody:
        'Diese Aussagen erfüllen weder die Kriterien für hohe Übereinstimmung, geringe Übereinstimmung noch für hohe Unsicherheit.',
      tipUncertaintyBody:
        'Aussagen in dieser Kategorie gehörten zu den 25 % am häufigsten übersprungenen Aussagen der gesamten Konversation oder wurden von mindestens 20 % der Teilnehmenden übersprungen.',
      scatterTipHighAgreeBody:
        'Im Durchschnitt stimmten 70 % oder mehr der Teilnehmenden den Aussagen dieses Unterthemas zu.',
      scatterTipLowBody:
        'Die Meinungen waren geteilt. Im Durchschnitt stimmten 40–60 % der Abstimmenden den Aussagen dieses Unterthemas zu oder lehnten sie ab.',
      scatterTipHighDisagreeBody:
        'Im Durchschnitt lehnten 70 % oder mehr der Teilnehmenden die Aussagen dieses Unterthemas ab.',
      altDefault: 'Eine Datenvisualisierung, die aus den Sensemaker-Tools generiert wurde',
    };

    const byLang: Record<
      UiLanguage,
      {
        tipAlignmentBody: string;
        tipHighBody: string;
        tipLowBody: string;
        tipUncategorizedBody: string;
        tipUncertaintyBody: string;
        scatterTipHighAgreeBody: string;
        scatterTipLowBody: string;
        scatterTipHighDisagreeBody: string;
        altDefault: string;
      }
    > = {
      en,
      'zh-TW': zhTW,
      'zh-CN': zhCN,
      fr,
      es,
      ja,
      de,
    };

    const target = byLang[lang];
    return new Map<string, string>([
      [en.tipAlignmentBody, target.tipAlignmentBody],
      [en.tipHighBody, target.tipHighBody],
      [en.tipLowBody, target.tipLowBody],
      [en.tipUncategorizedBody, target.tipUncategorizedBody],
      [en.tipUncertaintyBody, target.tipUncertaintyBody],
      [en.scatterTipHighAgreeBody, target.scatterTipHighAgreeBody],
      [en.scatterTipLowBody, target.scatterTipLowBody],
      [en.scatterTipHighDisagreeBody, target.scatterTipHighDisagreeBody],
      [en.altDefault, target.altDefault],
    ]);
  }

  private t(lang: UiLanguage, key: string, params?: Record<string, string | number>): string {
    return translate(lang, key, params);
  }

  private chartWord(lang: UiLanguage, key: ChartWordKey): string {
    const zhTW = {
      downloadData: '下載資料',
      downloadDataAria: '下載此圖表的資料',
      groupAlignment: '一致性',
      groupUncertainty: '不確定性',
      groupUncategorized: '未分類',
      sectionHigh: '高',
      sectionLow: '低',
      ofStatements: '的留言',
      legendFewerShort: '較少',
      legendMoreShort: '較多',
    };
    const zhCN = {
      downloadData: '下载数据',
      downloadDataAria: '下载此图表的数据',
      groupAlignment: '一致性',
      groupUncertainty: '不确定性',
      groupUncategorized: '未分类',
      sectionHigh: '高',
      sectionLow: '低',
      ofStatements: '的留言',
      legendFewerShort: '较少',
      legendMoreShort: '较多',
    };
    const en = {
      downloadData: 'Download Data',
      downloadDataAria: 'Download data for this chart',
      groupAlignment: 'Alignment',
      groupUncertainty: 'Uncertainty',
      groupUncategorized: 'Uncategorized',
      sectionHigh: 'High',
      sectionLow: 'Low',
      ofStatements: 'Of statements',
      legendFewerShort: 'Fewer',
      legendMoreShort: 'More',
    };
    const fr = {
      downloadData: 'Télécharger les données',
      downloadDataAria: 'Télécharger les données de ce graphique',
      groupAlignment: 'Alignement',
      groupUncertainty: 'Incertitude',
      groupUncategorized: 'Non catégorisé',
      sectionHigh: 'Élevé',
      sectionLow: 'Faible',
      ofStatements: 'des déclarations',
      legendFewerShort: 'Moins de',
      legendMoreShort: 'Plus de',
    };
    const es = {
      downloadData: 'Descargar datos',
      downloadDataAria: 'Descargar los datos de este gráfico',
      groupAlignment: 'Alineación',
      groupUncertainty: 'Incertidumbre',
      groupUncategorized: 'Sin categorizar',
      sectionHigh: 'Alto',
      sectionLow: 'Bajo',
      ofStatements: 'de las declaraciones',
      legendFewerShort: 'Menos',
      legendMoreShort: 'Más',
    };
    const ja = {
      downloadData: 'データをダウンロード',
      downloadDataAria: 'このグラフのデータをダウンロード',
      groupAlignment: '合意度',
      groupUncertainty: '不確実性',
      groupUncategorized: '未分類',
      sectionHigh: '高',
      sectionLow: '低',
      ofStatements: 'のステートメント',
      legendFewerShort: '少ない',
      legendMoreShort: '多い',
    };
    const de = {
      downloadData: 'Daten herunterladen',
      downloadDataAria: 'Daten für dieses Diagramm herunterladen',
      groupAlignment: 'Übereinstimmung',
      groupUncertainty: 'Unsicherheit',
      groupUncategorized: 'Nicht kategorisiert',
      sectionHigh: 'Hoch',
      sectionLow: 'Gering',
      ofStatements: 'der Aussagen',
      legendFewerShort: 'Weniger',
      legendMoreShort: 'Mehr',
    };
    const dictByLang: Record<UiLanguage, Record<ChartWordKey, string>> = {
      en,
      'zh-TW': zhTW,
      'zh-CN': zhCN,
      fr,
      es,
      ja,
      de,
    };
    return dictByLang[lang][key] ?? en[key] ?? key;
  }

  private tSubtopicSingular(lang: UiLanguage): string {
    if (lang === 'zh-TW') return '1 個子主題';
    if (lang === 'zh-CN') return '1 个子主题';
    if (lang === 'fr') return '1 sous-sujet';
    if (lang === 'es') return '1 subtema';
    if (lang === 'ja') return '1 件のサブトピック';
    if (lang === 'de') return '1 Unterthema';
    return '1 subtopic';
  }

  private tSubtopics(lang: UiLanguage, count: number): string {
    if (lang === 'zh-TW') return `${count} 個子主題`;
    if (lang === 'zh-CN') return `${count} 个子主题`;
    if (lang === 'fr') return `${count} sous-sujets`;
    if (lang === 'es') return `${count} subtemas`;
    if (lang === 'ja') return `${count} 件のサブトピック`;
    if (lang === 'de') return `${count} Unterthemen`;
    return `${count} subtopics`;
  }

  private tStatements(lang: UiLanguage, count: number): string {
    if (lang === 'zh-TW') return `${count} 則留言`;
    if (lang === 'zh-CN') return `${count} 条留言`;
    if (lang === 'fr') return `${count} déclarations`;
    if (lang === 'es') return `${count} declaraciones`;
    if (lang === 'ja') return `${count} 件のステートメント`;
    if (lang === 'de') return `${count} Aussagen`;
    return `${count} statements`;
  }

  private tSubtopicStatementCount(lang: UiLanguage, count: number): string {
    if (lang === 'zh-TW') return `（${count} 則留言）`;
    if (lang === 'zh-CN') return `（${count} 条留言）`;
    if (lang === 'fr') return `(${count} déclarations)`;
    if (lang === 'es') return `(${count} declaraciones)`;
    if (lang === 'ja') return `（${count} 件のステートメント）`;
    if (lang === 'de') return `(${count} Aussagen)`;
    return `(${count} statements)`;
  }
}
