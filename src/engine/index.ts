// src/engine/index.ts

import { chainedAnnuity } from './chainedAnnuity';
import { dualVehicle } from './dualVehicle';
import { runMonteCarlo } from './monteCarlo';
import { computeSensitivity } from './sensitivity';
import type { SimulationInput, FullSimulationResult } from '../types/simulation';

export function runFullSimulation(input: SimulationInput): FullSimulationResult {
  const {
    payments,
    startingAge,
    annualRateConservative,
    annualRateOptimistic,
    annualRateFdLock,
    annualRateLiquid,
    inflationRate,
    whtRate,
    mcIterations,
    mcMu,
    mcSigma,
  } = input;

  const conservative = chainedAnnuity(payments, annualRateConservative, inflationRate, whtRate, startingAge);
  const optimistic = chainedAnnuity(payments, annualRateOptimistic, inflationRate, whtRate, startingAge);
  const noInterest = chainedAnnuity(payments, 0, inflationRate, whtRate, startingAge);
  const dv = dualVehicle(payments, annualRateFdLock, annualRateLiquid, inflationRate, whtRate, startingAge);
  const monteCarlo = runMonteCarlo(payments, mcIterations, mcMu, mcSigma, whtRate);
  const sensitivity = computeSensitivity(input);

  return {
    input,
    conservative,
    optimistic,
    noInterest,
    dualVehicle: dv,
    monteCarlo,
    sensitivity,
    computedAt: new Date().toISOString(),
  };
}

export { chainedAnnuity } from './chainedAnnuity';
export { dualVehicle } from './dualVehicle';
export { runMonteCarlo } from './monteCarlo';
export { computeSensitivity } from './sensitivity';
export { allocateGoals } from './goalProgramming';
export { inflationErosion, erosionScenarios } from './inflation';
export type { InflationErosionResult } from './inflation';