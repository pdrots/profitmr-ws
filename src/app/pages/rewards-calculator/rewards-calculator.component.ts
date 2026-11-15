import { isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, Inject, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CalculatorHeaderComponent } from './components/calculator-header/calculator-header.component';
import { ExtensionShowcaseComponent } from './components/extension-showcase/extension-showcase.component';
import { COPY, LEGACY_STORAGE_KEY, MAX_GAME_PRICE, PREVIOUS_STORAGE_KEY, REGIONS, STORAGE_KEY, UNITS_PER_CURRENCY } from './utils/rewards-calculator.data';
import { calculatePurchasePlan } from './utils/rewards-calculator.calculation';
import type { CalculatorValues, Copy, Language, MessageKey, PurchasePlan, Region, RegionId, StoredState, Theme } from './utils/rewards-calculator.models';
import { createEmptyValues, isLanguage, isLegacyCalculatorValues, isPositiveInteger, isPreviousStoredState, isRegionId, isStoredState, parseNonNegativeNumber, parsePoints } from './utils/rewards-calculator.validation';

@Component({
  selector: 'app-rewards-calculator',
  standalone: true,
  imports: [CalculatorHeaderComponent, ExtensionShowcaseComponent],
  templateUrl: './rewards-calculator.component.html',
  styleUrl: './rewards-calculator.component.css',
})
export class RewardsCalculatorComponent {
  @HostBinding('attr.data-theme')
  get hostTheme(): Theme {
    return this.theme;
  }

  language: Language = 'pt-BR';
  regionId: RegionId = 'br';
  theme: Theme = 'light';
  gamePrice: number | null = null;
  balancePoints: number | null = null;
  rates: Record<string, number | null> = {};
  customAmount = REGIONS.br.customMin;
  customPoints: number | null = null;
  plan: PurchasePlan | null = null;
  calculationMessageKey: MessageKey | null = null;
  storageMessageKey: MessageKey | null = null;
  valuesByRegion: Record<RegionId, CalculatorValues> = {
    br: createEmptyValues(REGIONS.br),
    us: createEmptyValues(REGIONS.us),
    es: createEmptyValues(REGIONS.es),
  };

  constructor(@Inject(PLATFORM_ID) platformId: object, private readonly title: Title) {
    this.updateTitle();
    if (isPlatformBrowser(platformId)) {
      this.restoreValues();
      this.importValuesFromExtension();
      if (this.canCalculate) {
        this.calculateStrategy();
      }
    }
  }

  get copy(): Copy {
    return COPY[this.language];
  }

  get region(): Region {
    return REGIONS[this.regionId];
  }

  get fixedAmounts(): number[] {
    return this.region.fixedAmounts;
  }

  get regionOptions(): Region[] {
    return Object.values(REGIONS);
  }

  get calculationMessage(): string {
    return this.calculationMessageKey ? this.copy.calculationMessage(this.calculationMessageKey) : '';
  }

  get storageMessage(): string {
    return this.storageMessageKey ? this.copy.calculationMessage(this.storageMessageKey) : '';
  }

  get canCalculate(): boolean {
    return (
      this.gamePrice !== null &&
      Number.isFinite(this.gamePrice) &&
      this.gamePrice > 0 &&
      this.gamePrice <= MAX_GAME_PRICE &&
      this.fixedAmounts.every((amount) => isPositiveInteger(this.rateFor(amount))) &&
      isPositiveInteger(this.customPoints) &&
      Number.isInteger(this.customAmount) &&
      this.customAmount >= this.region.customMin &&
      this.customAmount <= this.region.customMax
    );
  }

  get affordable(): boolean | null {
    return this.plan && this.balancePoints !== null
      ? this.plan.totalPoints <= this.balancePoints
      : null;
  }

  get remainingPoints(): number | null {
    return this.plan && this.balancePoints !== null
      ? Math.max(this.balancePoints - this.plan.totalPoints, 0)
      : null;
  }

  get missingPoints(): number | null {
    return this.plan && this.balancePoints !== null
      ? Math.max(this.plan.totalPoints - this.balancePoints, 0)
      : null;
  }

  get customRewardUrl(): string {
    return `https://rewards.bing.com/redeem/sku/${this.region.customRewardSku}?c=${this.customAmount}`;
  }

  get hasCustomRewardUrl(): boolean {
    return Boolean(this.region.customRewardSku);
  }

  updateValue(field: 'gamePrice' | 'balancePoints' | 'customAmount' | 'customPoints', value: string): void {
    if (field === 'customAmount') {
      const nextAmount = parseNonNegativeNumber(value) ?? this.region.customMin;
      if (nextAmount !== this.customAmount) {
        this.customPoints = null;
        this.calculationMessageKey = 'customReferenceChanged';
      } else {
        this.calculationMessageKey = null;
      }
      this.customAmount = nextAmount;
    } else {
      this[field] = field === 'gamePrice'
        ? parseNonNegativeNumber(value)
        : parsePoints(value);
      this.calculationMessageKey = null;
    }
    this.plan = null;
    this.persistValues();
  }

  updateRate(amount: number, value: string): void {
    this.rates[this.rateKey(amount)] = parsePoints(value);
    this.plan = null;
    this.calculationMessageKey = null;
    this.persistValues();
  }

  changeRegion(value: string): void {
    if (!isRegionId(value) || value === this.regionId) {
      return;
    }
    this.snapshotActiveValues();
    this.regionId = value;
    this.loadActiveValues(this.valuesByRegion[value]);
    this.plan = null;
    this.calculationMessageKey = null;
    this.persistValues();
  }

  changeLanguage(value: string): void {
    if (!isLanguage(value)) {
      return;
    }
    this.language = value;
    this.updateTitle();
    this.persistValues();
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.persistValues();
  }

  calculateStrategy(): void {
    if (!this.canCalculate || this.gamePrice === null) {
      this.plan = null;
      this.calculationMessageKey = 'missingFields';
      return;
    }

    const result = calculatePurchasePlan({
      gamePrice: this.gamePrice,
      fixedCards: this.fixedAmounts.map((amount) => ({
        amount,
        points: this.rateFor(amount)!,
      })),
      customMin: this.region.customMin,
      customMax: this.region.customMax,
      customAmount: this.customAmount,
      customPoints: this.customPoints!,
    });
    this.plan = result.plan;
    this.calculationMessageKey = result.error;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat(this.region.numberLocale, {
      style: 'currency',
      currency: this.region.currency,
    }).format(value);
  }

  formatPoints(value: number): string {
    return new Intl.NumberFormat(this.language, { maximumFractionDigits: 0 }).format(value);
  }

  displayAmount(units: number): number {
    return units / UNITS_PER_CURRENCY;
  }

  fixedRewardUrl(amount: number): string | null {
    const sku = this.region.fixedRewardSkus[this.rateKey(amount)];
    return sku ? `https://rewards.bing.com/redeem/sku/${sku}` : null;
  }

  clearValues(): void {
    this.gamePrice = null;
    this.balancePoints = null;
    this.rates = createEmptyValues(this.region).rates;
    this.customAmount = this.region.customMin;
    this.customPoints = null;
    this.plan = null;
    this.calculationMessageKey = null;
    this.persistValues();
  }

  rateFor(amount: number): number | null {
    return this.rates[this.rateKey(amount)] ?? null;
  }

  private rateKey(amount: number): string {
    return String(amount);
  }

  private updateTitle(): void {
    this.title.setTitle(this.language === 'en-US'
      ? 'ProfitMR | Microsoft Rewards calculator'
      : this.language === 'es'
        ? 'ProfitMR | Calculadora Microsoft Rewards'
        : 'ProfitMR | Calculadora Microsoft Rewards');
  }

  private snapshotActiveValues(): void {
    this.valuesByRegion[this.regionId] = {
      gamePrice: this.gamePrice,
      balancePoints: this.balancePoints,
      rates: { ...this.rates },
      customAmount: this.customAmount,
      customPoints: this.customPoints,
    };
  }

  private loadActiveValues(values: CalculatorValues): void {
    this.gamePrice = values.gamePrice;
    this.balancePoints = values.balancePoints;
    this.rates = { ...values.rates };
    this.customAmount = values.customAmount;
    this.customPoints = values.customPoints;
  }

  private restoreValues(): void {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) {
        const parsed: unknown = JSON.parse(current);
        if (!isStoredState(parsed)) {
          throw new Error('Invalid saved calculator settings.');
        }
        this.language = parsed.language;
        this.regionId = parsed.region;
        this.theme = parsed.theme;
        this.valuesByRegion = parsed.valuesByRegion;
        this.loadActiveValues(this.valuesByRegion[this.regionId]);
        this.updateTitle();
        return;
      }

      const previous = localStorage.getItem(PREVIOUS_STORAGE_KEY);
      if (previous) {
        const parsed: unknown = JSON.parse(previous);
        if (!isPreviousStoredState(parsed)) {
          throw new Error('Invalid saved regional calculator settings.');
        }
        this.language = parsed.language;
        this.regionId = parsed.region === 'pt' ? 'es' : parsed.region;
        this.theme = parsed.theme;
        this.valuesByRegion.br = parsed.valuesByRegion['br'];
        this.valuesByRegion.us = parsed.valuesByRegion['us'];
        this.valuesByRegion.es = parsed.valuesByRegion['pt'];
        this.loadActiveValues(this.valuesByRegion[this.regionId]);
        this.updateTitle();
        this.persistValues();
        return;
      }

      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacy) {
        return;
      }
      const parsed: unknown = JSON.parse(legacy);
      if (!isLegacyCalculatorValues(parsed)) {
        throw new Error('Invalid legacy calculator settings.');
      }
      this.gamePrice = parsed.gamePrice;
      this.balancePoints = parsed.balancePoints;
      this.rates = {
        '5': parsed.card5Points,
        '15': parsed.card15Points,
        '30': parsed.card30Points,
      };
      this.customAmount = parsed.customAmount;
      this.customPoints = parsed.customPoints;
      this.snapshotActiveValues();
      this.persistValues();
    } catch {
      this.storageMessageKey = 'restoreError';
    }
  }

  private importValuesFromExtension(): void {
    const url = new URL(location.href);
    const imported = {
      card5Points: url.searchParams.get('card5'),
      card15Points: url.searchParams.get('card15'),
      card30Points: url.searchParams.get('card30'),
      customAmount: url.searchParams.get('customAmount'),
      customPoints: url.searchParams.get('customPoints'),
    };
    if (Object.values(imported).every((value) => value !== null)) {
      const card5Points = Number(imported.card5Points);
      const card15Points = Number(imported.card15Points);
      const card30Points = Number(imported.card30Points);
      const customAmount = Number(imported.customAmount);
      const customPoints = Number(imported.customPoints);
      if (
        isPositiveInteger(card5Points) &&
        isPositiveInteger(card15Points) &&
        isPositiveInteger(card30Points) &&
        isPositiveInteger(customPoints) &&
        Number.isInteger(customAmount) &&
        customAmount >= REGIONS.br.customMin &&
        customAmount <= REGIONS.br.customMax
      ) {
        if (this.regionId !== 'br') {
          this.snapshotActiveValues();
          this.regionId = 'br';
          this.loadActiveValues(this.valuesByRegion.br);
        }
        this.rates = {
          ...this.rates,
          '5': card5Points,
          '15': card15Points,
          '30': card30Points,
        };
        this.customAmount = customAmount;
        this.customPoints = customPoints;
        this.snapshotActiveValues();
        this.persistValues();
        this.storageMessageKey = 'importSuccess';
      }
      url.search = '';
      history.replaceState(history.state, '', url.pathname + url.hash);
    }
  }

  private persistValues(): void {
    try {
      this.snapshotActiveValues();
      const state: StoredState = {
        version: 4,
        language: this.language,
        region: this.regionId,
        theme: this.theme,
        valuesByRegion: this.valuesByRegion,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.storageMessageKey = 'saved';
    } catch {
      this.storageMessageKey = 'saveError';
    }
  }
}
