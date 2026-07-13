// src/engine/monteCarlo.ts

import type { MonteCarloResult } from '../types/simulation';

/** Box-Muller transform for standard normal random variable */
function randnBM(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

/**
 * Vasicek mean-reverting interest rate model, run as a Monte Carlo simulation.
 *
 * r(t+1) = max(rFloor, r(t) + kappa * (mu - r(t)) + sigma * epsilon)
 * where epsilon ~ N(0,1)
 *
 * One rate draw is made per 5-year period, then applied as a constant
 * monthly rate for that period's 60 months.
 */
export function runMonteCarlo(
  payments: number[],
  iterations: number,
  mu: number,
  sigma: number,
  whtRate: number,
  kappa: number = 0.3,
  rFloor: number = 0.04
): MonteCarloResult {
  const outcomes: number[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    let balance = 0;
    let r = mu;

    for (let i = 0; i < payments.length; i++) {
      r = Math.max(rFloor, r + kappa * (mu - r) + sigma * randnBM());
      const netR = r * (1 - whtRate);
      const rm = netR / 12;

      for (let m = 0; m < 60; m++) {
        balance = balance * (1 + rm) + payments[i];
      }
    }

    outcomes.push(balance / 1e6); // store in millions
  }

  const sorted = outcomes.slice().sort((a, b) => a - b);

  return {
    sorted,
    p5: percentile(sorted, 5),
    p25: percentile(sorted, 25),
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p95: percentile(sorted, 95),
  };
}