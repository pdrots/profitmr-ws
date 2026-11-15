import { MAX_GAME_PRICE, REGIONS } from './rewards-calculator.data';
import type { CalculatorValues, Language, Region, RegionId, StoredState, PreviousStoredState, Theme } from './rewards-calculator.models';

export function createEmptyValues(region: Region): CalculatorValues {
  return {
    gamePrice: null,
    balancePoints: null,
    rates: Object.fromEntries(region.fixedAmounts.map((amount) => [String(amount), null])),
    customAmount: region.customMin,
    customPoints: null,
    customMaxPoints: null,
  };
}

export function isPositiveInteger(value: number | null): value is number {
  return value !== null && Number.isSafeInteger(value) && value > 0;
}

export function parsePoints(value: string): number | null {
  const parsed = parseNonNegativeNumber(value);
  return parsed !== null && Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseNonNegativeNumber(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOptionalNonNegativeNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

export function isOptionalPoints(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0);
}

export function isOptionalPositiveInteger(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value > 0);
}

export function isLanguage(value: string): value is Language {
  return value === 'pt-BR' || value === 'en-US' || value === 'es';
}

export function isRegionId(value: string): value is RegionId {
  return value === 'br' || value === 'us' || value === 'es';
}

export function isTheme(value: string): value is Theme {
  return value === 'light' || value === 'dark';
}

export function isCalculatorValues(value: unknown, region: Region): value is CalculatorValues {
  if (!isRecord(value)) {
    return false;
  }
  const rates = value['rates'];
  if (!isRecord(rates)) {
    return false;
  }
  return (
    isOptionalNonNegativeNumber(value['gamePrice']) &&
    (value['gamePrice'] === null ||
      typeof value['gamePrice'] === 'number' && value['gamePrice'] <= MAX_GAME_PRICE) &&
    isOptionalPoints(value['balancePoints']) &&
    region.fixedAmounts.every((amount) =>
      isOptionalPositiveInteger(rates[String(amount)]),
    ) &&
    typeof value['customAmount'] === 'number' &&
    Number.isInteger(value['customAmount']) &&
    value['customAmount'] >= region.customMin &&
    value['customAmount'] <= region.customMax &&
    isOptionalPositiveInteger(value['customPoints']) &&
    (value['customMaxPoints'] === undefined || isOptionalPositiveInteger(value['customMaxPoints']))
  );
}

export function isStoredState(value: unknown): value is StoredState {
  if (!isRecord(value)) {
    return false;
  }
  const valuesByRegion = value['valuesByRegion'];
  if (
    value['version'] !== 4 ||
    !isLanguage(String(value['language'])) ||
    !isRegionId(String(value['region'])) ||
    !isTheme(String(value['theme'])) ||
    !isRecord(valuesByRegion)
  ) {
    return false;
  }
  return (['br', 'us', 'es'] as const).every((regionId) =>
    isCalculatorValues(valuesByRegion[regionId], REGIONS[regionId]),
  );
}

export function isPreviousStoredState(value: unknown): value is PreviousStoredState {
  if (!isRecord(value)) {
    return false;
  }
  const valuesByRegion = value['valuesByRegion'];
  if (
    value['version'] !== 3 ||
    !isLanguage(String(value['language'])) ||
    !['br', 'us', 'pt'].includes(String(value['region'])) ||
    !isTheme(String(value['theme'])) ||
    !isRecord(valuesByRegion)
  ) {
    return false;
  }
  return (
    isCalculatorValues(valuesByRegion['br'], REGIONS.br) &&
    isCalculatorValues(valuesByRegion['us'], REGIONS.us) &&
    isCalculatorValues(valuesByRegion['pt'], REGIONS.es)
  );
}

export function isLegacyCalculatorValues(value: unknown): value is {
  gamePrice: number | null;
  balancePoints: number | null;
  card5Points: number | null;
  card15Points: number | null;
  card30Points: number | null;
  customAmount: number;
  customPoints: number | null;
} {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isOptionalNonNegativeNumber(value['gamePrice']) &&
    (value['gamePrice'] === null ||
      typeof value['gamePrice'] === 'number' && value['gamePrice'] <= MAX_GAME_PRICE) &&
    isOptionalPoints(value['balancePoints']) &&
    isOptionalPositiveInteger(value['card5Points']) &&
    isOptionalPositiveInteger(value['card15Points']) &&
    isOptionalPositiveInteger(value['card30Points']) &&
    typeof value['customAmount'] === 'number' &&
    Number.isInteger(value['customAmount']) &&
    value['customAmount'] >= REGIONS.br.customMin &&
    value['customAmount'] <= REGIONS.br.customMax &&
    isOptionalPositiveInteger(value['customPoints'])
  );
}
