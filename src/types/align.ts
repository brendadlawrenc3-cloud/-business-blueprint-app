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
  | 'decide'
  | 'operating-model'
  | 'advisor';

// ── Company profile & edition (size calibration) ────────────────────────────

export type RevenueBand = 'under-10m' | '10-50m' | '50-250m' | 'over-250m';

export type Edition = 'essentials' | 'enterprise';

export interface CompanyProfile {
  industry: string;
  revenueBand: RevenueBand;
  employees: number;
  edition: Edition;
  // Leadership-set override; null means use the size-based default.
  maxConcurrentPilots: number | null;
}

// ── Current AI use inventory ("shadow AI") & acceptable-use policy ───────────

export type DataSensitivity = 'public' | 'internal' | 'confidential' | 'personal';

export interface AIUsageRecord {
  id: string;
  useCase: string;
  team: string;
  toolCategory: string;
  dataSensitivity: DataSensitivity;
  sanctioned: boolean;
  usersApprox: number;
}

export type PolicyElement =
  | 'policyOwner'
  | 'approvedTools'
  | 'dataRules'
  | 'humanReview'
  | 'clientDisclosure'
  | 'ipOwnership'
  | 'incidentReporting'
  | 'trainingRequired';

// ── Competitive exposure ─────────────────────────────────────────────────────

export interface RevenueExposure {
  id: string;
  stream: string;
  revenueShare: number; // % of total revenue
  threat: Score; // how easily AI-enabled competitors could undercut it
  horizon: 'now' | '1-2-years' | '3-plus-years';
  response: string;
}

// ── Operating model: decision rights, cadence, workforce ─────────────────────

export type GovernanceActivity =
  | 'setPriorities'
  | 'approveInvestment'
  | 'clearRiskGates'
  | 'runPilot'
  | 'scaleOrStop'
  | 'policyAndInventory'
  | 'portfolioReview';

export interface DecisionRight {
  accountable: string;
  responsible: string;
  consulted: string;
}

export type WorkforceStance = 'undecided' | 'redeploy' | 'redeploy-attrition' | 'reduce';

export type CommsStep =
  | 'whyBeforeWhat'
  | 'commitmentStated'
  | 'involveFrontline'
  | 'trainingPlan'
  | 'roleChanges'
  | 'feedbackChannel'
  | 'celebrateRedeployment';

export interface OperatingModel {
  decisionRights: Record<GovernanceActivity, DecisionRight>;
  reviewCadence: 'monthly' | 'quarterly';
  nextReviewDate: string;
  workforceStance: WorkforceStance;
  workforceCommitment: string;
  comms: Record<CommsStep, boolean>;
}

// ── Advisor: validation & calibration, IP readiness ──────────────────────────

export interface DecisionThresholds {
  highValue: number; // min avg of strategic alignment + business value
  investScore: number; // min weighted score for Invest Now
  minConfidence: number; // 0–1 min confidence for Invest Now
  doNotPursueValue: number; // below this avg value → Do Not Pursue
}

export interface ValidationSession {
  id: string;
  date: string;
  ceo: string;
  industry: string;
  revenueBand: RevenueBand;
  minutesToComplete: number;
  topPickMatchedGut: boolean;
  overrides: number;
  opportunitiesScored: number;
  confusingQuestions: string;
  followUp90: 'pending' | 'confirmed' | 'mixed' | 'contradicted';
  notes: string;
}

export type IPCheck =
  | 'trademarkSearch'
  | 'distinctiveName'
  | 'methodDocumented'
  | 'materialsCopyright'
  | 'licensingTerms'
  | 'validatedWithCEOs';

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

export interface DecisionOverride {
  category: DecisionCategory;
  reason: string;
  date: string;
}

// ── Sourcing: build / buy / partner (tool-agnostic) ──────────────────────────

export type SourcingApproach = 'undecided' | 'buy' | 'build' | 'partner';

export type SourcingCriterion =
  | 'dataHandling'
  | 'integrationFit'
  | 'totalCost'
  | 'exitPortability'
  | 'providerViability'
  | 'timeToValue';

export interface SourcingDecision {
  approach: SourcingApproach;
  scores: Record<SourcingCriterion, Score>;
  rationale: string;
}

// ── Sustain: life after the pilot ────────────────────────────────────────────

export interface SustainPlan {
  owner: string;
  costReviewEveryDays: number;
  lastCostReview: string;
  actualAnnualRunCost: number;
  accuracyCheckEveryDays: number;
  lastAccuracyCheck: string;
  accuracySampleSize: number;
}

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
  rolesAffected: number;
  reskillingPlan: string;
  sourcing: SourcingDecision;
  sustain: SustainPlan;
  override: DecisionOverride | null;
}

export interface AlignState {
  companyName: string;
  profile: CompanyProfile;
  priorities: StrategicPriority[];
  opportunities: AIOpportunity[];
  aiInventory: AIUsageRecord[];
  policy: Record<PolicyElement, boolean>;
  exposure: RevenueExposure[];
  operatingModel: OperatingModel;
  thresholds: DecisionThresholds;
  validation: ValidationSession[];
  ipChecks: Record<IPCheck, boolean>;
  lastReviewed: string;
}
