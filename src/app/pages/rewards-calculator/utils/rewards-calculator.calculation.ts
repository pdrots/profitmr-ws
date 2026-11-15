import { MAX_OVERPAY, UNITS_PER_CURRENCY } from './rewards-calculator.data';
import type { CardOption, PlannedCard, PurchasePlan } from './rewards-calculator.models';

interface PurchaseStrategyInput {
  gamePrice: number;
  fixedCards: CardOption[];
  customMin: number;
  customMax: number;
  customAmount: number;
  customPoints: number;
}

type CalculationError = 'noCombination' | 'invalidStrategy';

interface CalculationResult {
  plan: PurchasePlan | null;
  error: CalculationError | null;
}

export function calculatePurchasePlan(input: PurchaseStrategyInput): CalculationResult {
  const options = input.fixedCards.map((card) => ({
    amount: Math.round(card.amount * UNITS_PER_CURRENCY),
    points: card.points,
  }));
  for (let amount = input.customMin; amount <= input.customMax; amount++) {
    options.push({
      amount: amount * UNITS_PER_CURRENCY,
      points: Math.ceil((input.customPoints * amount) / input.customAmount),
    });
  }

  const targetAmount = Math.ceil(input.gamePrice * UNITS_PER_CURRENCY - Number.EPSILON);
  const maxAmount = targetAmount + MAX_OVERPAY * UNITS_PER_CURRENCY;
  const bestPoints = new Array<number>(maxAmount + 1).fill(Number.POSITIVE_INFINITY);
  const bestCardCount = new Array<number>(maxAmount + 1).fill(Number.POSITIVE_INFINITY);
  const previousAmount = new Array<number>(maxAmount + 1).fill(-1);
  const previousOption = new Array<number>(maxAmount + 1).fill(-1);
  bestPoints[0] = 0;
  bestCardCount[0] = 0;

  for (let amount = 0; amount <= maxAmount; amount++) {
    if (!Number.isFinite(bestPoints[amount])) {
      continue;
    }
    for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
      const option = options[optionIndex];
      const nextAmount = amount + option.amount;
      if (nextAmount > maxAmount) {
        continue;
      }

      const nextPoints = bestPoints[amount] + option.points;
      const nextCardCount = bestCardCount[amount] + 1;
      if (
        nextPoints < bestPoints[nextAmount] ||
        (nextPoints === bestPoints[nextAmount] && nextCardCount < bestCardCount[nextAmount])
      ) {
        bestPoints[nextAmount] = nextPoints;
        bestCardCount[nextAmount] = nextCardCount;
        previousAmount[nextAmount] = amount;
        previousOption[nextAmount] = optionIndex;
      }
    }
  }

  let chosenAmount = -1;
  for (let amount = targetAmount; amount <= maxAmount; amount++) {
    if (!Number.isFinite(bestPoints[amount])) {
      continue;
    }
    if (
      chosenAmount === -1 ||
      bestPoints[amount] < bestPoints[chosenAmount] ||
      (bestPoints[amount] === bestPoints[chosenAmount] && amount < chosenAmount) ||
      (bestPoints[amount] === bestPoints[chosenAmount] &&
        amount === chosenAmount &&
        bestCardCount[amount] < bestCardCount[chosenAmount])
    ) {
      chosenAmount = amount;
    }
  }

  if (chosenAmount === -1) {
    return { plan: null, error: 'noCombination' };
  }

  const cardCounts = new Map<string, PlannedCard>();
  let amount = chosenAmount;
  while (amount > 0) {
    const optionIndex = previousOption[amount];
    const previous = previousAmount[amount];
    if (optionIndex < 0 || previous < 0) {
      return { plan: null, error: 'invalidStrategy' };
    }
    const option = options[optionIndex];
    const key = `${option.amount}:${option.points}`;
    const existing = cardCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      cardCounts.set(key, { ...option, count: 1 });
    }
    amount = previous;
  }

  const cards = [...cardCounts.values()].sort((a, b) => b.amount - a.amount);
  return {
    plan: {
      totalAmount: chosenAmount,
      totalPoints: bestPoints[chosenAmount],
      customReferenceAmount: input.customAmount,
      cards,
    },
    error: null,
  };
}
