// ALIGN Framework™ — AI Business Integration Framework
// Principle: AI should not determine business strategy. Business strategy
// should determine where AI creates value.

export type AlignView =
  | 'overview'
  | 'assess'
  | 'locate'
  | 'identify'
  | 'govern'
  | 'navigate'
  | 'decide';

// ── A: Assess Business Priorities ────────────────────────────────────────────

// Root-cause categories for a performance gap. Only some are AI-addressable;
// the rest call for leadership, accountability, or process work first.
export type ConstraintType =
  | 'capacity'
  | 'cycle-time'
  | 'consistency'
  | 'insight'
  | 'knowledge-access'
  | 'process-design'
  | 'accountability'
  | 'leadership-alignment'
  | 'skills-talent'
  | 'strategy-clarity';

export type MetricDirection = 'increase' | 'decrease';

export interface StrategicPriority {
  id: string;
  name: string;
  objective: string;
  metricName: string;
  unit: string;
  baseline: number;
  current: number;
  target: number;
  direction: MetricDirection;
  constraint: string;
  constraintType: ConstraintType;
  executiveOwner: string;
}

// ── L: Locate Value Opportunities ────────────────────────────────────────────

export type BusinessFunction =
  | 'sales'
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'customer-service'
  | 'human-resources'
  | 'product-service';

export type IntegrationLevel = 'optimize' | 'transform' | 'reinvent';

export interface BusinessValueTest {
  problem: string;
  impact: string;
  whyAI: string;
  successMeasure: string;
}

export interface ValueEconomics {
  annualValue: number; // gross annual value if the hypothesis holds
  confidence: number; // 0–1 likelihood the value is realized
  oneTimeCost: number; // design, integration, data prep, training
  annualRunCost: number; // licences, usage, support, oversight time
}

// ── I: Identify AI Readiness ─────────────────────────────────────────────────

export type ReadinessDimension =
  | 'strategicClarity'
  | 'processMaturity'
  | 'dataReadiness'
  | 'leadershipReadiness'
  | 'workforceReadiness'
  | 'governanceReadiness';

export type Score = 1 | 2 | 3 | 4 | 5;

export type ReadinessScores = Record<ReadinessDimension, Score>;

export type ReadinessClass = 'ready-to-pilot' | 'prepare' | 'defer-redesign';

// ── G: Govern Integration and Execution ──────────────────────────────────────

export type RiskGate =
  | 'privacy'
  | 'security'
  | 'legalRegulatory'
  | 'reliability'
  | 'customerTrust'
  | 'vendorDependency';

export type GateStatus = 'not-assessed' | 'pass' | 'conditional' | 'fail';

export type OversightLevel = 'human-decides' | 'human-approves' | 'human-monitors';

export interface IntegrationDesign {
  processOwner: string;
  currentChallenge: string;
  aiCapability: string;
  targetOutcome: string;
  processChange: string;
  peopleChange: string;
  oversightLevel: OversightLevel;
  humanOversight: string;
  pilotDays: number;
  baselineCaptured: boolean;
  scaleCriteria: string;
  stopCriteria: string;
}

// ── N: Navigate Performance and Scale ────────────────────────────────────────

export type PerformanceCategory = 'financial' | 'operational' | 'customer' | 'organizational';

export interface PerformanceMeasure {
  id: string;
  category: PerformanceCategory;
  name: string;
  unit: string;
  baseline: number;
  target: number;
  actual: number | null;
}

// "Time saved is not value created" — every efficiency gain must name where
// the freed capacity went and which business outcome it moved.
export interface ValueRealization {
  hoursFreedPerMonth: number;
  redeployedTo: string;
  linkedOutcome: string;
}

export type OpportunityStage = 'identified' | 'assessing' | 'piloting' | 'scaling' | 'stopped';

// ── Executive Decision Matrix ────────────────────────────────────────────────

export type MatrixCriterion =
  | 'strategicAlignment'
  | 'businessValue'
  | 'processDataReadiness'
  | 'feasibility'
  | 'adoptionReadiness';

export type MatrixScores = Record<MatrixCriterion, Score>;

export type DecisionCategory = 'invest-now' | 'build-readiness' | 'pilot-validate' | 'do-not-pursue';

export interface AIOpportunity {
  id: string;
  title: string;
  priorityId: string;
  businessFunction: BusinessFunction;
  level: IntegrationLevel;
  stage: OpportunityStage;
  valueTest: BusinessValueTest;
  economics: ValueEconomics;
  readiness: ReadinessScores;
  matrix: MatrixScores;
  gates: Record<RiskGate, GateStatus>;
  design: IntegrationDesign;
  measures: PerformanceMeasure[];
  realization: ValueRealization;
}

export interface AlignState {
  companyName: string;
  priorities: StrategicPriority[];
  opportunities: AIOpportunity[];
  lastReviewed: string;
}
