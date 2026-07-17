// src/engine/dualVehicle.ts

import type { DualVehicleResult, DualVehiclePeriod } from '../types/simulation';

/**
 * Dual-Vehicle FD Model
 *
 * Track A (FD corpus): at the start of each period, the accumulated corpus
 * is locked into a Fixed Deposit at annualRateFdLock for 60 months.
 *
 * Track B (liquid accumulation): new monthly payments accumulate during the
 * period in a savings account at annualRateLiquid.
 *
 * At period end: combined = FD matured corpus + liquid accumulation.
 * This becomes the new FD principal for the next period.
 */
export function dualVehicle(
  payments: number[],
  annualRateFdLock: number,
  annualRateLiquid: number,
  inflationRate: number,
  whtRate: number,
  startingAge: number
): DualVehicleResult {
  const netFdRate = annualRateFdLock * (1 - whtRate);
  const netLiquidRate = annualRateLiquid * (1 - whtRate);
  const rmFD = netFdRate / 12;
  const rmLiq = netLiquidRate / 12;

  let corpus = 0;
  const periods: DualVehiclePeriod[] = [];

  for (let i = 0; i < payments.length; i++) {
    // Track A: previously accumulated corpus locked into FD, grows for 60 months
    const fdCorpusGrowth = corpus * Math.pow(1 + rmFD, 60);

    // Track B: new monthly deposits accumulate in liquid account
    const liquidAccumulation =
      payments[i] * ((Math.pow(1 + rmLiq, 60) - 1) / rmLiq);

    corpus = fdCorpusGrowth + liquidAccumulation;

    periods.push({
      period: i + 1,
      ageStart: startingAge + i * 5,
      ageEnd: startingAge + i * 5 + 5,
      fdCorpusGrowth: Math.round(fdCorpusGrowth),
      liquidAccumulation: Math.round(liquidAccumulation),
      combinedBalance: Math.round(corpus),
    });
  }

  const finalNominal = Math.round(corpus);
  const years = payments.length * 5;
  const realFinal = Math.round(finalNominal / Math.pow(1 + inflationRate, years));

  return { periods, finalNominal, realFinal };
}