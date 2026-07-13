// src/engine/sensitivity.ts

import { chainedAnnuity } from './chainedAnnuity';
import { dualVehicle } from './dualVehicle';
import type { SimulationInput, SensitivityRow } from '../types/simulation';

/**
 * Generates a Tornado chart dataset — for each variable, shows the final
 * corpus outcome when that variable is moved from its low to high value,
 * holding everything else at the base case.
 */
export function computeSensitivity(input: SimulationInput): SensitivityRow[] {
  const {
    payments,
    inflationRate,
    whtRate,
    startingAge,
    annualRateConservative: baseRate,
    annualRateFdLock,
  } = input;

  const base = (r: number) =>
    chainedAnnuity(payments, r, inflationRate, whtRate, startingAge).finalNominal / 1e6;

  const baseDv = (rFD: number, rLiq: number) =>
    dualVehicle(payments, rFD, rLiq, inflationRate, whtRate, startingAge).finalNominal / 1e6;

  // Shifted payment arrays for starting-savings sensitivity
  const pmtsLow = payments.map((p, i) => (i === 0 ? Math.max(5000, p - 10000) : p));
  const pmtsHigh = payments.map((p, i) => (i === 0 ? p + 15000 : p));

  // Shifted step-up sensitivity: reduce/increase the step between periods
  const pmtsStepLow = payments.map((_, i) => payments[0] + i * 5000);
  const pmtsStepHigh = payments.map((_, i) => payments[0] + i * 20000);

  return [
    {
      variable: 'Annual interest rate',
      baseValue: `${(baseRate * 100).toFixed(0)}%`,
      range: '4%–12%',
      lowOutcome: base(0.04),
      highOutcome: base(0.12),
      impact: 'Very High',
    },
    {
      variable: 'Starting monthly savings',
      baseValue: `LKR ${payments[0].toLocaleString()}`,
      range: '±LKR 10–15K',
      lowOutcome: chainedAnnuity(pmtsLow, baseRate, inflationRate, whtRate, startingAge).finalNominal / 1e6,
      highOutcome: chainedAnnuity(pmtsHigh, baseRate, inflationRate, whtRate, startingAge).finalNominal / 1e6,
      impact: 'High',
    },
    {
      variable: 'Savings step-up per period',
      baseValue: 'Per schedule',
      range: 'LKR 5K–20K step',
      lowOutcome: chainedAnnuity(pmtsStepLow, baseRate, inflationRate, whtRate, startingAge).finalNominal / 1e6,
      highOutcome: chainedAnnuity(pmtsStepHigh, baseRate, inflationRate, whtRate, startingAge).finalNominal / 1e6,
      impact: 'Medium-High',
    },
    {
      variable: 'FD lock rate (dual-vehicle)',
      baseValue: `${(annualRateFdLock * 100).toFixed(0)}%`,
      range: '8%–15%',
      lowOutcome: baseDv(0.08, 0.07),
      highOutcome: baseDv(0.15, 0.11),
      impact: 'High',
    },
    {
      variable: 'Inflation rate',
      baseValue: `${(inflationRate * 100).toFixed(1)}%`,
      range: '4%–15%',
      lowOutcome: chainedAnnuity(payments, baseRate, 0.04, whtRate, startingAge).realFinal / 1e6,
      highOutcome: chainedAnnuity(payments, baseRate, 0.15, whtRate, startingAge).realFinal / 1e6,
      impact: 'High',
    },
  ];
}