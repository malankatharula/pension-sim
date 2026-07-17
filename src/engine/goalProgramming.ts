// src/engine/goalProgramming.ts

import type { GoalAllocationInput, GoalAllocationResult } from '../types/simulation';

/**
 * Simple weighted-priority Goal Programming allocator.
 * Allocates monthly income across 4 goals in priority order (1 = highest).
 *
 * Each goal is funded fully (up to its monthly need) before moving to the
 * next-highest priority. Whatever's left over is surplus.
 */
export function allocateGoals(input: GoalAllocationInput): GoalAllocationResult {
  const {
    monthlyIncome,
    goalRetirementMonthly,
    goalEmergencyTarget,
    goalHousingTarget,
    goalEducationTarget,
    priorityRetirement,
    priorityEmergency,
    priorityHousing,
    priorityEducation,
  } = input;

  const goals = [
    { key: 'emergency', monthly: goalEmergencyTarget, priority: priorityEmergency },
    { key: 'housing', monthly: goalHousingTarget, priority: priorityHousing },
    { key: 'education', monthly: goalEducationTarget, priority: priorityEducation },
    { key: 'retirement', monthly: goalRetirementMonthly, priority: priorityRetirement },
  ].sort((a, b) => a.priority - b.priority);

  const allocation: Record<string, number> = {
    emergency: 0,
    housing: 0,
    education: 0,
    retirement: 0,
  };

  let remaining = monthlyIncome;
  let shortfall = 0;

  for (const goal of goals) {
    const needed = goal.monthly;
    const funded = Math.min(needed, remaining);
    allocation[goal.key] = funded;
    remaining -= funded;
    if (funded < needed) shortfall += needed - funded;
  }

  const monthlyTotal = monthlyIncome - remaining;
  const feasible = shortfall === 0;

  return {
    retirement: allocation.retirement,
    emergency: allocation.emergency,
    housing: allocation.housing,
    education: allocation.education,
    surplus: remaining,
    monthlyTotal,
    feasible,
    shortfall,
  };
}