export type Language = 'pt-BR' | 'en-US' | 'es';
export type RegionId = 'br' | 'us' | 'es';
export type Theme = 'light' | 'dark';
export type MessageKey =
  | 'customReferenceChanged'
  | 'missingFields'
  | 'noCombination'
  | 'invalidStrategy'
  | 'restoreError'
  | 'importSuccess'
  | 'saved'
  | 'saveError';

export interface Region {
  id: RegionId;
  name: string;
  currency: 'BRL' | 'USD' | 'EUR';
  numberLocale: string;
  fixedAmounts: number[];
  customMin: number;
  customMax: number;
  fixedRewardSkus: Record<string, string>;
  customRewardSku: string;
}

export interface CalculatorValues {
  gamePrice: number | null;
  balancePoints: number | null;
  rates: Record<string, number | null>;
  customAmount: number;
  customPoints: number | null;
}

export interface StoredState {
  version: 4;
  language: Language;
  region: RegionId;
  theme: Theme;
  valuesByRegion: Record<RegionId, CalculatorValues>;
}

export interface PreviousStoredState {
  version: 3;
  language: Language;
  region: 'br' | 'us' | 'pt';
  theme: Theme;
  valuesByRegion: Record<string, CalculatorValues>;
}

export interface CardOption {
  amount: number;
  points: number;
}

export interface PlannedCard extends CardOption {
  count: number;
}

export interface PurchasePlan {
  totalAmount: number;
  totalPoints: number;
  customReferenceAmount: number;
  cards: PlannedCard[];
}

export interface Copy {
  home: string;
  language: string;
  region: string;
  theme: string;
  light: string;
  dark: string;
  switchToLight: string;
  switchToDark: string;
  eyebrow: string;
  titleFirst: string;
  titleSecond: string;
  description: string;
  calculatorLabel: string;
  cardEyebrow: string;
  question: string;
  gamePrice: string;
  balance: string;
  cardFor: (amount: string) => string;
  pricePlaceholder: string;
  balancePlaceholder: string;
  ratesTitle: string;
  ratesDescription: string;
  customCard: string;
  customDescription: (min: string, max: string) => string;
  customAmount: string;
  shownPoints: string;
  pointsPlaceholder: string;
  openReward: string;
  calculate: string;
  resultsLabel: string;
  estimateFor: string;
  points: string;
  cardsTotal: string;
  abovePrice: string;
  combination: string;
  balanceSufficient: (balance: string, remaining: string) => string;
  balanceInsufficient: (missing: string) => string;
  customEstimate: (amount: string) => string;
  savedFallback: string;
  clear: string;
  notice: string;
  extensionTitle: string;
  extensionDescription: string;
  previewWindow: string;
  previewCalculation: string;
  previewGame: string;
  previewBalance: string;
  previewEstimate: string;
  previewTotal: string;
  previewCombination: string;
  previewCard: (amount: string) => string;
  previewRead: string;
  previewDisclaimer: string;
  featureReadTitle: string;
  featureRead: string;
  featureEstimateTitle: string;
  featureEstimate: string;
  featurePrivacyTitle: string;
  featurePrivacy: string;
  installLink: string;
  chromeManualLink: string;
  installNote: string;
  footerEstimate: string;
  checkRewards: string;
  pointsUnit: string;
  regionName: (region: Region) => string;
  calculationMessage: (key: MessageKey) => string;
}
