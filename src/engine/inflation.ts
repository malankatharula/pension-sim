// src/engine/inflation.ts

export interface InflationErosionResult {
  realValue: number;
  percentRetained: number; // 0-100
}

/**
 * Real (inflation-adjusted) value of a nominal amount after N years.
 * B_real = B_nominal / (1 + pi)^t
 */
export function inflationErosion(
  nominalAmount: number,
  annualInflationRate: number,
  years: number
): InflationErosionResult {
  const realValue = nominalAmount / Math.pow(1 + annualInflationRate, years);
  const percentRetained = (realValue / nominalAmount) * 100;

  return {
    realValue: Math.round(realValue),
    percentRetained: Math.round(percentRetained * 10) / 10, // 1 decimal
  };
}

/**
 * Convenience: erosion at a fixed set of standard scenario rates,
 * used for the Inflation Calculator's comparison bar chart.
 */
export function erosionScenarios(
  nominalAmount: number,
  years: number,
  rates: number[] = [0.04, 0.089, 0.15, 0.20]
): { rate: number; result: InflationErosionResult }[] {
  return rates.map((rate) => ({
    rate,
    result: inflationErosion(nominalAmount, rate, years),
  }));
}