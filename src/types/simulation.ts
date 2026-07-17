// src/types/simulation.ts

export interface SimulationInput {
  startingAge: number;           // e.g. 25
  retirementAge: number;         // e.g. 50
  payments: number[];            // monthly payment per period, e.g. [25000, 35000, 45000, 55000, 65000]
  // Each entry covers one 5-year period (60 months).
  // Length of payments array = number of periods = (retirementAge - startingAge) / 5

  annualRateConservative: number;  // e.g. 0.06
  annualRateOptimistic: number;    // e.g. 0.10
  annualRateFdLock: number;        // e.g. 0.12 — rate locked into FD corpus each period
  annualRateLiquid: number;        // e.g. 0.09 — rate for monthly accumulation track

  inflationRate: number;           // e.g. 0.089
  whtRate: number;                 // e.g. 0.05 — withholding tax on interest income

  mcIterations: number;            // e.g. 5000
  mcMu: number;                    // Vasicek mean rate, e.g. 0.10
  mcSigma: number;                 // Vasicek sigma, e.g. 0.025
}

export interface PeriodResult {
  period: number;
  ageStart: number;
  ageEnd: number;
  monthlyPayment: number;
  totalContributed: number;
  interestEarned: number;
  closingBalance: number;
}

export interface ChainedAnnuityResult {
  periods: PeriodResult[];
  finalNominal: number;
  totalContributed: number;
  totalInterest: number;
  realFinal: number;            // inflation-adjusted
}

export interface DualVehiclePeriod {
  period: number;
  ageStart: number;
  ageEnd: number;
  fdCorpusGrowth: number;       // Track A: locked FD compound growth
  liquidAccumulation: number;   // Track B: new monthly deposits in liquid account
  combinedBalance: number;
}

export interface DualVehicleResult {
  periods: DualVehiclePeriod[];
  finalNominal: number;
  realFinal: number;
}

export interface MonteCarloResult {
  sorted: number[];             // all outcomes in ascending order (in millions)
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface SensitivityRow {
  variable: string;
  baseValue: string;
  range: string;
  lowOutcome: number;           // in millions
  highOutcome: number;
  impact: 'Very High' | 'High' | 'Medium-High' | 'Medium' | 'Low';
}

export interface GoalAllocationInput {
  monthlyIncome: number;
  goalRetirementMonthly: number;
  goalEmergencyTarget: number;
  goalHousingTarget: number;
  goalEducationTarget: number;
  priorityRetirement: number;
  priorityEmergency: number;
  priorityHousing: number;
  priorityEducation: number;
}

export interface GoalAllocationResult {
  retirement: number;
  emergency: number;
  housing: number;
  education: number;
  surplus: number;
  monthlyTotal: number;
  feasible: boolean;
  shortfall: number;
}

export interface FullSimulationResult {
  input: SimulationInput;
  conservative: ChainedAnnuityResult;
  optimistic: ChainedAnnuityResult;
  noInterest: ChainedAnnuityResult;
  dualVehicle: DualVehicleResult;
  monteCarlo: MonteCarloResult;
  sensitivity: SensitivityRow[];
  computedAt: string;           // ISO timestamp
}