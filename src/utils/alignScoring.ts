// Decision rules for the ALIGN Framework™. Pure functions so the methodology
// is explicit, testable, and identical wherever it is applied.
import type {
  AIOpportunity,
  AIUsageRecord,
  AlignState,
  CompanyProfile,
  DecisionThresholds,
  DecisionCategory,
  OperatingModel,
  PolicyElement,
  RevenueExposure,
  SourcingCriterion,
  ValidationSession,
  GateStatus,
  MatrixCriterion,
  PerformanceMeasure,
  ReadinessClass,
  ReadinessDimension,
  StrategicPriority,
} from '../types/align';
import {
  CONSTRAINT_TYPES,
  DATA_SENSITIVITY,
  DEFAULT_THRESHOLDS,
  GOVERNANCE_ACTIVITIES,
  MATRIX_CRITERIA,
  READINESS_DIMENSIONS,
  REVENUE_BANDS,
} from '../data/alignFramework';

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
  if (o.rolesAffected > 0 && !o.reskillingPlan.trim()) gaps.push(`${o.rolesAffected} roles affected but no reskilling plan`);
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

// The framework's recommendation. Leadership may override it (with a stated
// reason); overrides are kept so the thresholds can be calibrated over time.
export function decide(o: AIOpportunity, t: DecisionThresholds = DEFAULT_THRESHOLDS): DecisionResult {
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
  if (valueStrength < t.doNotPursueValue) {
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

  const highValue = valueStrength >= t.highValue;

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
  if (highValue && o.economics.confidence >= t.minConfidence && score >= t.investScore) {
    reasons.push('High value, ready to pilot, risks acceptable');
    if (gates === 'cleared-with-conditions') reasons.push('Proceed with the gate conditions in place');
    return { category: 'invest-now', score, reasons, nextAction: 'Approve a time-boxed pilot with baseline and scale/stop criteria.' };
  }

  if (o.economics.confidence < t.minConfidence) reasons.push('Value hypothesis has low confidence');
  if (!highValue) reasons.push('Value is promising but not yet proven');
  if (score < t.investScore) reasons.push(`Weighted score below the Invest Now threshold (${t.investScore})`);
  if (readiness.classification === 'prepare') reasons.push('Readiness gaps to close during validation');
  return { category: 'pilot-validate', score, reasons, nextAction: 'Run a small, cheap validation to test the value hypothesis.' };
}

// Leadership overrides apply, except that a failed risk gate can never be
// overridden into an investment.
export function finalCategory(o: AIOpportunity, t: DecisionThresholds = DEFAULT_THRESHOLDS): DecisionCategory {
  if (evaluateGates(o) === 'blocked') return 'do-not-pursue';
  return o.override?.category ?? decide(o, t).category;
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

// ── Size calibration & change capacity ───────────────────────────────────────

export function pilotLimit(profile: CompanyProfile): number {
  return profile.maxConcurrentPilots ?? REVENUE_BANDS[profile.revenueBand].defaultPilots;
}

export interface CapacityStatus {
  limit: number;
  active: number;
  queued: number;
  overCapacity: boolean;
}

// A company can only absorb so much change at once. Active pilots plus
// Invest Now approvals not yet started must fit within the limit.
export function capacityStatus(state: AlignState): CapacityStatus {
  const limit = pilotLimit(state.profile);
  const active = state.opportunities.filter((o) => o.stage === 'piloting').length;
  const queued = state.opportunities.filter(
    (o) => o.stage !== 'piloting' && o.stage !== 'scaling' && o.stage !== 'stopped' &&
      finalCategory(o, state.thresholds) === 'invest-now',
  ).length;
  return { limit, active, queued, overCapacity: active + queued > limit };
}

// ── Current AI use & policy ──────────────────────────────────────────────────

export interface InventoryRisk {
  total: number;
  unsanctioned: number;
  highRisk: AIUsageRecord[]; // unsanctioned use touching confidential or personal data
  peopleUsing: number;
}

export function inventoryRisk(records: AIUsageRecord[]): InventoryRisk {
  return {
    total: records.length,
    unsanctioned: records.filter((r) => !r.sanctioned).length,
    highRisk: records.filter((r) => !r.sanctioned && DATA_SENSITIVITY[r.dataSensitivity].risk >= 3),
    peopleUsing: records.reduce((sum, r) => sum + r.usersApprox, 0),
  };
}

export function policyCoverage(policy: Record<PolicyElement, boolean>): number {
  const values = Object.values(policy);
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

// ── Competitive exposure ─────────────────────────────────────────────────────

export function exposureSummary(exposure: RevenueExposure[]) {
  const highThreat = exposure.filter((e) => e.threat >= 4);
  const revenueAtRisk = highThreat.reduce((sum, e) => sum + e.revenueShare, 0);
  const unanswered = highThreat.filter((e) => !e.response.trim());
  return { highThreat, revenueAtRisk, unanswered };
}

// ── Sourcing ─────────────────────────────────────────────────────────────────

export function sourcingScore(o: AIOpportunity): number {
  const scores = Object.values(o.sourcing.scores) as number[];
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function sourcingWarnings(o: AIOpportunity): string[] {
  const w: string[] = [];
  const s = o.sourcing.scores;
  const weak = (Object.keys(s) as SourcingCriterion[]).filter((k) => s[k] <= 2);
  if (o.sourcing.approach !== 'undecided' && evaluateGates(o) === 'incomplete')
    w.push('A sourcing choice was made before the risk gates were assessed');
  if (s.dataHandling <= 2) w.push('Data handling is weak — this usually fails the privacy gate later');
  if (s.exitPortability <= 2) w.push('Weak exit terms create lock-in; negotiate before signing');
  if (weak.length >= 3) w.push('Three or more weak criteria — reconsider the approach');
  return w;
}

// ── Sustain ──────────────────────────────────────────────────────────────────

function daysSince(date: string, today: Date): number | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((today.getTime() - d.getTime()) / 86_400_000);
}

export function sustainAlerts(o: AIOpportunity, today: Date = new Date()): string[] {
  if (o.stage !== 'scaling' && o.stage !== 'piloting') return [];
  const s = o.sustain;
  const alerts: string[] = [];
  if (!s.owner.trim()) alerts.push('No long-term owner after the pilot');
  const costAge = daysSince(s.lastCostReview, today);
  if (costAge === null || costAge > s.costReviewEveryDays) alerts.push('Cost review overdue');
  const accAge = daysSince(s.lastAccuracyCheck, today);
  if (accAge === null || accAge > s.accuracyCheckEveryDays) alerts.push('Accuracy check overdue');
  if (s.actualAnnualRunCost > o.economics.annualRunCost * 1.2)
    alerts.push(`Run cost is ${Math.round((s.actualAnnualRunCost / Math.max(1, o.economics.annualRunCost) - 1) * 100)}% over plan`);
  return alerts;
}

// ── Operating model ──────────────────────────────────────────────────────────

export function operatingModelGaps(m: OperatingModel, today: Date = new Date()): string[] {
  const gaps: string[] = [];
  const missing = (Object.keys(m.decisionRights) as (keyof typeof GOVERNANCE_ACTIVITIES)[]).filter(
    (a) => !m.decisionRights[a].accountable.trim(),
  );
  if (missing.length) gaps.push(`${missing.length} activit${missing.length === 1 ? 'y has' : 'ies have'} no accountable owner`);
  const age = daysSince(m.nextReviewDate, today);
  if (!m.nextReviewDate) gaps.push('No portfolio review scheduled');
  else if (age !== null && age > 0) gaps.push('Portfolio review date has passed');
  if (m.workforceStance === 'undecided') gaps.push('Workforce position not stated');
  const commsDone = Object.values(m.comms).filter(Boolean).length;
  if (commsDone < Object.values(m.comms).length / 2) gaps.push('Workforce communication plan less than half complete');
  return gaps;
}

// ── Foundations: is the organization ready to run ALIGN at all? ─────────────

export interface FoundationCheck {
  label: string;
  done: boolean;
}

export function foundationChecks(state: AlignState): FoundationCheck[] {
  const inv = inventoryRisk(state.aiInventory);
  return [
    { label: 'Current AI use inventoried', done: inv.total > 0 },
    { label: 'No unsanctioned use of client or personal data', done: inv.highRisk.length === 0 },
    { label: 'Acceptable-use policy ≥ 75% complete', done: policyCoverage(state.policy) >= 75 },
    { label: 'Workforce position stated', done: state.operatingModel.workforceStance !== 'undecided' },
    { label: 'Decision rights assigned', done: operatingModelGaps(state.operatingModel).every((g) => !g.includes('accountable')) },
    { label: 'Competitive exposure assessed', done: state.exposure.length > 0 },
    { label: 'Pilot load within change capacity', done: !capacityStatus(state).overCapacity },
  ];
}

// ── Advisor: validation & calibration ────────────────────────────────────────

export interface CalibrationInsight {
  sessions: number;
  gutMatchRate: number | null;
  overrideRate: number | null;
  avgMinutes: number | null;
  followUpAccuracy: number | null;
  upgrades: number;
  downgrades: number;
  suggestions: string[];
}

const CATEGORY_RANK: Record<DecisionCategory, number> = {
  'do-not-pursue': 0,
  'pilot-validate': 1,
  'build-readiness': 2,
  'invest-now': 3,
};

export function calibrationInsight(state: AlignState): CalibrationInsight {
  const v: ValidationSession[] = state.validation;
  const n = v.length;
  const scored = v.reduce((sum, s) => sum + s.opportunitiesScored, 0);
  const overrides = v.reduce((sum, s) => sum + s.overrides, 0);
  const followed = v.filter((s) => s.followUp90 !== 'pending');

  // Overrides recorded in this workspace show which way leaders disagree.
  let upgrades = 0;
  let downgrades = 0;
  for (const o of state.opportunities) {
    if (!o.override) continue;
    const system = decide(o, state.thresholds).category;
    const diff = CATEGORY_RANK[o.override.category] - CATEGORY_RANK[system];
    if (diff > 0) upgrades++;
    if (diff < 0) downgrades++;
  }

  const suggestions: string[] = [];
  const overrideRate = scored > 0 ? overrides / scored : null;
  if (n < 5) suggestions.push(`Run ${5 - n} more validation session${5 - n === 1 ? '' : 's'} before changing names or weights.`);
  if (overrideRate !== null && overrideRate > 0.25)
    suggestions.push('Over 25% of recommendations are overridden — review the decision rules with the CEOs who overrode them.');
  if (upgrades > downgrades + 1)
    suggestions.push(`Leaders upgrade more often than they downgrade — consider lowering the Invest Now score (now ${state.thresholds.investScore}) by 5.`);
  if (downgrades > upgrades + 1)
    suggestions.push(`Leaders downgrade more often than they upgrade — consider raising the Invest Now score (now ${state.thresholds.investScore}) by 5.`);
  const avgMinutes = n ? v.reduce((s, x) => s + x.minutesToComplete, 0) / n : null;
  if (avgMinutes !== null && avgMinutes > 240)
    suggestions.push('Average completion exceeds 4 hours — simplify for the Essentials edition.');
  const contradicted = followed.filter((s) => s.followUp90 === 'contradicted').length;
  if (followed.length >= 3 && contradicted / followed.length > 0.3)
    suggestions.push('More than 30% of 90-day follow-ups contradicted the recommendation — revisit the confidence threshold.');

  return {
    sessions: n,
    gutMatchRate: n ? v.filter((s) => s.topPickMatchedGut).length / n : null,
    overrideRate,
    avgMinutes,
    followUpAccuracy: followed.length ? followed.filter((s) => s.followUp90 === 'confirmed').length / followed.length : null,
    upgrades,
    downgrades,
    suggestions,
  };
}
