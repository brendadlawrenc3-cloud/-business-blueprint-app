// Decision rules for the ALIGN Framework™. Pure functions so the methodology
// is explicit, testable, and identical wherever it is applied.
import type {
  AIOpportunity,
  DecisionCategory,
  GateStatus,
  MatrixCriterion,
  PerformanceMeasure,
  ReadinessClass,
  ReadinessDimension,
  StrategicPriority,
} from '../types/align';
import { CONSTRAINT_TYPES, MATRIX_CRITERIA, READINESS_DIMENSIONS } from '../data/alignFramework';

// ── A: Strategic Alignment ───────────────────────────────────────────────────

// Share of the baseline→target gap closed so far (0–100, can exceed 100).
export function priorityProgress(p: StrategicPriority): number {
  const span = p.target - p.baseline;
  if (span === 0) return 100;
  return Math.round(((p.current - p.baseline) / span) * 100);
}

export function constraintFit(p: StrategicPriority) {
  return CONSTRAINT_TYPES[p.constraintType];
}

// ── L: Value economics ───────────────────────────────────────────────────────

export interface EconomicsSummary {
  riskAdjustedValue: number;
  netAnnualValue: number;
  firstYearCost: number;
  firstYearNet: number;
  paybackMonths: number | null;
  roiMultiple: number;
}

export function summarizeEconomics(o: AIOpportunity): EconomicsSummary {
  const { annualValue, confidence, oneTimeCost, annualRunCost } = o.economics;
  const riskAdjustedValue = annualValue * confidence;
  const netAnnualValue = riskAdjustedValue - annualRunCost;
  const firstYearCost = oneTimeCost + annualRunCost;
  const paybackMonths = netAnnualValue > 0 ? (oneTimeCost / netAnnualValue) * 12 : null;
  const roiMultiple = firstYearCost > 0 ? riskAdjustedValue / firstYearCost : 0;
  return {
    riskAdjustedValue,
    netAnnualValue,
    firstYearCost,
    firstYearNet: riskAdjustedValue - firstYearCost,
    paybackMonths,
    roiMultiple,
  };
}

export function valueTestComplete(o: AIOpportunity): boolean {
  return Object.values(o.valueTest).every((answer) => answer.trim().length > 0);
}

// ── I: Readiness ─────────────────────────────────────────────────────────────

export interface ReadinessResult {
  average: number;
  classification: ReadinessClass;
  blockers: string[];
  gaps: ReadinessDimension[];
}

// Scores are not simply averaged. A critical dimension (data, governance)
// below 3, or any dimension at 1, blocks a pilot regardless of the average.
export function assessReadiness(o: AIOpportunity): ReadinessResult {
  const entries = Object.entries(o.readiness) as [ReadinessDimension, number][];
  const average = entries.reduce((sum, [, s]) => sum + s, 0) / entries.length;
  const blockers: string[] = [];
  const gaps: ReadinessDimension[] = [];

  for (const [dim, score] of entries) {
    const def = READINESS_DIMENSIONS[dim];
    if (score <= 2) gaps.push(dim);
    if (def.critical && score <= 2) blockers.push(`${def.label} is critical and scored ${score}/5`);
    else if (score === 1) blockers.push(`${def.label} scored 1/5`);
  }

  let classification: ReadinessClass;
  if (o.readiness.strategicClarity <= 2 || o.matrix.businessValue <= 1) {
    classification = 'defer-redesign';
    blockers.unshift('Outcome or business case is not defined well enough to proceed');
  } else if (blockers.length > 0 || average < 3.5 || gaps.length > 0) {
    classification = 'prepare';
  } else {
    classification = 'ready-to-pilot';
  }

  return { average, classification, blockers, gaps };
}

// ── G: Risk gates ────────────────────────────────────────────────────────────

export type GateOutcome = 'cleared' | 'cleared-with-conditions' | 'incomplete' | 'blocked';

// Risk is a mandatory gate, never a weighted criterion: one failure stops
// the opportunity no matter how valuable it is.
export function evaluateGates(o: AIOpportunity): GateOutcome {
  const statuses = Object.values(o.gates) as GateStatus[];
  if (statuses.includes('fail')) return 'blocked';
  if (statuses.includes('not-assessed')) return 'incomplete';
  if (statuses.includes('conditional')) return 'cleared-with-conditions';
  return 'cleared';
}

export function designGaps(o: AIOpportunity): string[] {
  const d = o.design;
  const gaps: string[] = [];
  if (!d.processOwner.trim()) gaps.push('No accountable process owner');
  if (!d.humanOversight.trim()) gaps.push('Human oversight not defined');
  if (!d.baselineCaptured) gaps.push('Baseline not captured — results cannot be attributed');
  if (!d.scaleCriteria.trim()) gaps.push('No scale criteria agreed in advance');
  if (!d.stopCriteria.trim()) gaps.push('No stop criteria agreed in advance');
  if (!d.peopleChange.trim()) gaps.push('Impact on roles and people not addressed');
  return gaps;
}

// ── Executive Decision Matrix ────────────────────────────────────────────────

// Weighted score normalized to 0–100.
export function weightedScore(o: AIOpportunity): number {
  const total = (Object.keys(MATRIX_CRITERIA) as MatrixCriterion[]).reduce(
    (sum, key) => sum + o.matrix[key] * MATRIX_CRITERIA[key].weight,
    0,
  );
  return Math.round((total / 5) * 100);
}

export interface DecisionResult {
  category: DecisionCategory;
  score: number;
  reasons: string[];
  nextAction: string;
}

export function decide(o: AIOpportunity): DecisionResult {
  const score = weightedScore(o);
  const readiness = assessReadiness(o);
  const gates = evaluateGates(o);
  const econ = summarizeEconomics(o);
  const valueStrength = (o.matrix.strategicAlignment + o.matrix.businessValue) / 2;
  const reasons: string[] = [];

  if (gates === 'blocked') {
    reasons.push('A mandatory risk gate failed');
    return { category: 'do-not-pursue', score, reasons, nextAction: 'Redesign to remove the failed risk, or close.' };
  }
  if (valueStrength < 2.5) {
    reasons.push('Weak strategic alignment or business value');
    return { category: 'do-not-pursue', score, reasons, nextAction: 'Close and redirect effort to higher-value priorities.' };
  }
  if (econ.netAnnualValue <= 0) {
    reasons.push('Risk-adjusted value does not cover running costs');
    return { category: 'do-not-pursue', score, reasons, nextAction: 'Rework the economics or close.' };
  }
  if (readiness.classification === 'defer-redesign') {
    reasons.push(...readiness.blockers);
    return { category: 'do-not-pursue', score, reasons, nextAction: 'Defer: clarify the outcome and business case, then reassess.' };
  }

  const highValue = valueStrength >= 3.5;

  if (highValue && readiness.classification === 'prepare') {
    reasons.push(...(readiness.blockers.length ? readiness.blockers : ['Readiness below pilot threshold']));
    return { category: 'build-readiness', score, reasons, nextAction: 'Fund the readiness work, then re-score.' };
  }
  if (gates === 'incomplete') {
    reasons.push('Risk gates not yet assessed');
    return {
      category: highValue ? 'build-readiness' : 'pilot-validate',
      score,
      reasons,
      nextAction: 'Complete the risk-gate review before any pilot.',
    };
  }
  if (highValue && o.economics.confidence >= 0.6 && score >= 70) {
    reasons.push('High value, ready to pilot, risks acceptable');
    if (gates === 'cleared-with-conditions') reasons.push('Proceed with the gate conditions in place');
    return { category: 'invest-now', score, reasons, nextAction: 'Approve a time-boxed pilot with baseline and scale/stop criteria.' };
  }

  if (o.economics.confidence < 0.6) reasons.push('Value hypothesis has low confidence');
  if (!highValue) reasons.push('Value is promising but not yet proven');
  if (score < 70) reasons.push('Weighted score below the Invest Now threshold (70)');
  if (readiness.classification === 'prepare') reasons.push('Readiness gaps to close during validation');
  return { category: 'pilot-validate', score, reasons, nextAction: 'Run a small, cheap validation to test the value hypothesis.' };
}

// ── N: Performance ───────────────────────────────────────────────────────────

// Share of the baseline→target gap closed by the actual (null if no actual).
export function measureProgress(m: PerformanceMeasure): number | null {
  if (m.actual === null) return null;
  const span = m.target - m.baseline;
  if (span === 0) return 100;
  return Math.round(((m.actual - m.baseline) / span) * 100);
}

export type RealizationStatus = 'realized' | 'unlinked' | 'not-applicable';

// Time saved is not value created unless it is redeployed to an outcome.
export function realizationStatus(o: AIOpportunity): RealizationStatus {
  const r = o.realization;
  if (r.hoursFreedPerMonth <= 0) return 'not-applicable';
  return r.redeployedTo.trim() && r.linkedOutcome.trim() ? 'realized' : 'unlinked';
}

export type PilotVerdict = 'scale' | 'iterate' | 'stop' | 'too-early';

export function pilotVerdict(o: AIOpportunity): PilotVerdict {
  const progress = o.measures.map(measureProgress).filter((p): p is number => p !== null);
  if (progress.length === 0) return 'too-early';
  const avg = progress.reduce((a, b) => a + b, 0) / progress.length;
  if (avg >= 80 && realizationStatus(o) !== 'unlinked') return 'scale';
  if (avg < 25) return 'stop';
  return 'iterate';
}
