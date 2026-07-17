// src/engine/chainedAnnuity.ts

import type { ChainedAnnuityResult, PeriodResult } from '../types/simulation';

/**
 * Chained Annuity Model
 *
 * Each 5-year period (60 months) is its own ordinary annuity at a fixed
 * monthly payment. The closing balance of one period carries forward and
 * continues compounding into the next period.
 *
 * B_k = B_(k-1) * (1 + r_m)^60 + FV_k
 */
export function chainedAnnuity(
  payments: number[],
  annualRate: number,
  inflationRate: number,
  whtRate: number,
  startingAge: number
): ChainedAnnuityResult {
  // Apply WHT: net rate = gross * (1 - whtRate)
  const netAnnualRate = annualRate * (1 - whtRate);
  const rm = netAnnualRate / 12;

  let balance = 0;
  let totalInterest = 0;
  const periods: PeriodResult[] = [];

  for (let i = 0; i < payments.length; i++) {
    const pmt = payments[i];
    let periodInterest = 0;

    for (let m = 0; m < 60; m++) {
      const interestThisMonth = balance * rm;
      periodInterest += interestThisMonth;
      balance = balance + interestThisMonth + pmt;
    }

    totalInterest += periodInterest;

    periods.push({
      period: i + 1,
      ageStart: startingAge + i * 5,
      ageEnd: startingAge + i * 5 + 5,
      monthlyPayment: pmt,
      totalContributed: pmt * 60,
      interestEarned: Math.round(periodInterest),
      closingBalance: Math.round(balance),
    });
  }

  const totalContributed = payments.reduce((sum, p) => sum + p * 60, 0);
  const finalNominal = Math.round(balance);
  const years = payments.length * 5;
  const realFinal = Math.round(finalNominal / Math.pow(1 + inflationRate, years));

  return {
    periods,
    finalNominal,
    totalContributed,
    totalInterest: Math.round(totalInterest),
    realFinal,
  };
}