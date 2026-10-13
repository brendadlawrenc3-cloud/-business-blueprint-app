// Worked example: a $5M professional services firm whose CEO wants to reach
// $8M. Prospects are plentiful; converting them into contracts is not.
import type {
  AIOpportunity,
  AIUsageRecord,
  AlignState,
  BusinessFunction,
  IntegrationLevel,
  OperatingModel,
  RevenueExposure,
  StrategicPriority,
  ValidationSession,
} from '../types/align';
import { DEFAULT_THRESHOLDS } from './alignFramework';

const daysFromToday = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export const samplePriorities: StrategicPriority[] = [
  {
    id: 'p-revenue',
    name: 'Revenue growth',
    objective: 'Grow revenue from $5M to $8M',
    metricName: 'Annual revenue',
    unit: '$M',
    baseline: 5.0,
    current: 5.3,
    target: 8.0,
    direction: 'increase',
    constraint: 'Proposals take five days; follow-up is inconsistent; poor visibility into pipeline conversion.',
    constraintType: 'cycle-time',
    executiveOwner: 'VP of Sales',
  },
  {
    id: 'p-margin',
    name: 'Profitability',
    objective: 'Improve operating margin from 12% to 18%',
    metricName: 'Operating margin',
    unit: '%',
    baseline: 12,
    current: 13,
    target: 18,
    direction: 'increase',
    constraint: 'Project overruns are discovered after the fact; no early warning on engagement margin.',
    constraintType: 'insight',
    executiveOwner: 'CFO',
  },
  {
    id: 'p-efficiency',
    name: 'Operational efficiency',
    objective: 'Reduce delivery cost per engagement by 15%',
    metricName: 'Delivery cost index',
    unit: 'index',
    baseline: 100,
    current: 96,
    target: 85,
    direction: 'decrease',
    constraint: 'Senior staff spend a large share of time on research, formatting, and status reporting.',
    constraintType: 'capacity',
    executiveOwner: 'COO',
  },
  {
    id: 'p-retention',
    name: 'Customer experience',
    objective: 'Improve client retention from 85% to 92%',
    metricName: 'Client retention',
    unit: '%',
    baseline: 85,
    current: 86,
    target: 92,
    direction: 'increase',
    constraint: 'No one owns the client relationship between engagements; check-ins depend on who remembers.',
    constraintType: 'accountability',
    executiveOwner: 'Managing Partner',
  },
  {
    id: 'p-scale',
    name: 'Organizational scalability',
    objective: 'Double delivery capacity without doubling headcount',
    metricName: 'Engagements per consultant',
    unit: 'per yr',
    baseline: 6,
    current: 6.5,
    target: 12,
    direction: 'increase',
    constraint: 'Methodology and expertise live in three senior partners; juniors cannot work independently.',
    constraintType: 'knowledge-access',
    executiveOwner: 'COO',
  },
];

function baseOpportunity(
  id: string,
  title: string,
  priorityId: string,
  businessFunction: BusinessFunction,
  level: IntegrationLevel,
): AIOpportunity {
  return {
    id,
    title,
    priorityId,
    businessFunction,
    level,
    stage: 'identified',
    valueTest: { problem: '', impact: '', whyAI: '', successMeasure: '' },
    economics: { annualValue: 0, confidence: 0.5, oneTimeCost: 0, annualRunCost: 0 },
    readiness: {
      strategicClarity: 3,
      processMaturity: 3,
      dataReadiness: 3,
      leadershipReadiness: 3,
      workforceReadiness: 3,
      governanceReadiness: 3,
    },
    matrix: {
      strategicAlignment: 3,
      businessValue: 3,
      processDataReadiness: 3,
      feasibility: 3,
      adoptionReadiness: 3,
    },
    gates: {
      privacy: 'not-assessed',
      security: 'not-assessed',
      legalRegulatory: 'not-assessed',
      reliability: 'not-assessed',
      customerTrust: 'not-assessed',
      vendorDependency: 'not-assessed',
    },
    design: {
      processOwner: '',
      currentChallenge: '',
      aiCapability: '',
      targetOutcome: '',
      processChange: '',
      peopleChange: '',
      oversightLevel: 'human-approves',
      humanOversight: '',
      pilotDays: 90,
      baselineCaptured: false,
      scaleCriteria: '',
      stopCriteria: '',
    },
    measures: [],
    realization: { hoursFreedPerMonth: 0, redeployedTo: '', linkedOutcome: '' },
    rolesAffected: 0,
    reskillingPlan: '',
    sourcing: {
      approach: 'undecided',
      scores: { dataHandling: 3, integrationFit: 3, totalCost: 3, exitPortability: 3, providerViability: 3, timeToValue: 3 },
      rationale: '',
    },
    sustain: {
      owner: '',
      costReviewEveryDays: 90,
      lastCostReview: '',
      actualAnnualRunCost: 0,
      accuracyCheckEveryDays: 30,
      lastAccuracyCheck: '',
      accuracySampleSize: 10,
    },
    override: null,
  };
}

// Fills fields added in later versions so saved workspaces keep working.
export function withOpportunityDefaults(o: Partial<AIOpportunity> & { id: string }): AIOpportunity {
  const base = baseOpportunity(o.id, o.title ?? '', o.priorityId ?? '', o.businessFunction ?? 'operations', o.level ?? 'optimize');
  return {
    ...base,
    ...o,
    sourcing: { ...base.sourcing, ...o.sourcing, scores: { ...base.sourcing.scores, ...o.sourcing?.scores } },
    sustain: { ...base.sustain, ...o.sustain },
  };
}

export function createOpportunity(
  title: string,
  priorityId: string,
  businessFunction: BusinessFunction,
  level: IntegrationLevel,
): AIOpportunity {
  return baseOpportunity(`o-${Date.now().toString(36)}`, title, priorityId, businessFunction, level);
}

const proposals: AIOpportunity = {
  ...baseOpportunity('o-proposals', 'AI-assisted proposal research and drafting', 'p-revenue', 'sales', 'optimize'),
  stage: 'piloting',
  valueTest: {
    problem: 'Proposals take five business days, so qualified prospects cool off and competitors respond first.',
    impact: 'An estimated 8–10 lost deals per year at ~$45K average contract value.',
    whyAI:
      'The bottleneck is research and first-draft writing — unstructured, language-heavy work that AI handles well. The process is already standardized.',
    successMeasure: 'Turnaround from 5 days to 2 and win rate from 22% to 30% within two quarters.',
  },
  economics: { annualValue: 360000, confidence: 0.7, oneTimeCost: 35000, annualRunCost: 18000 },
  readiness: {
    strategicClarity: 5,
    processMaturity: 4,
    dataReadiness: 3,
    leadershipReadiness: 5,
    workforceReadiness: 3,
    governanceReadiness: 4,
  },
  matrix: { strategicAlignment: 5, businessValue: 5, processDataReadiness: 4, feasibility: 4, adoptionReadiness: 3 },
  gates: {
    privacy: 'pass',
    security: 'pass',
    legalRegulatory: 'pass',
    reliability: 'conditional',
    customerTrust: 'pass',
    vendorDependency: 'pass',
  },
  design: {
    processOwner: 'VP of Sales',
    currentChallenge: 'Proposals take five business days.',
    aiCapability: 'Assist with prospect research and first-draft proposal writing from the firm’s proposal library.',
    targetOutcome: 'Reduce proposal turnaround to two days.',
    processChange: 'Research and first draft move from the partner to an AI-assisted analyst step; partner edits and owns the final.',
    peopleChange: 'Analysts trained on prompting and fact-checking; partners shift saved time to client meetings.',
    oversightLevel: 'human-approves',
    humanOversight: 'Sales leadership reviews and approves every proposal before it is sent.',
    pilotDays: 90,
    baselineCaptured: true,
    scaleCriteria: 'Turnaround ≤ 2.5 days and win rate ≥ 26% after 90 days with no quality complaints.',
    stopCriteria: 'Turnaround not below 4 days at day 60, or any factual error reaching a client.',
  },
  measures: [
    { id: 'm1', category: 'operational', name: 'Proposal turnaround', unit: 'days', baseline: 5, target: 2, actual: 2.5 },
    { id: 'm2', category: 'customer', name: 'Proposal win rate', unit: '%', baseline: 22, target: 30, actual: 26 },
    { id: 'm3', category: 'financial', name: 'New contract value / quarter', unit: '$K', baseline: 900, target: 1200, actual: 1040 },
    { id: 'm4', category: 'organizational', name: 'Proposals using new process', unit: '%', baseline: 0, target: 90, actual: 75 },
  ],
  realization: {
    hoursFreedPerMonth: 60,
    redeployedTo: 'Partner business-development meetings with qualified prospects',
    linkedOutcome: 'Pipeline +$400K; win rate +4 pts',
  },
  rolesAffected: 4,
  reskillingPlan: 'Two half-day sessions on research prompting and fact-checking; weekly proposal review clinic for the first 60 days.',
  sourcing: {
    approach: 'buy',
    scores: { dataHandling: 4, integrationFit: 4, totalCost: 4, exitPortability: 3, providerViability: 4, timeToValue: 5 },
    rationale: 'Drafting assistance is a common capability, not a source of advantage. Our advantage is the proposal library, which stays in our own document store.',
  },
  sustain: {
    owner: 'Director of Sales Operations',
    costReviewEveryDays: 90,
    lastCostReview: daysFromToday(-40),
    actualAnnualRunCost: 19500,
    accuracyCheckEveryDays: 30,
    lastAccuracyCheck: daysFromToday(-45),
    accuracySampleSize: 10,
  },
};

const pipeline: AIOpportunity = {
  ...baseOpportunity('o-pipeline', 'Pipeline intelligence and follow-up prioritization', 'p-revenue', 'sales', 'transform'),
  stage: 'assessing',
  valueTest: {
    problem: 'Follow-up is inconsistent and leaders cannot see where deals stall.',
    impact: 'Conversion from qualified opportunity to proposal is 35% versus a 50% peer benchmark.',
    whyAI: 'Pattern detection across deal history can flag at-risk deals and next-best actions earlier than people can.',
    successMeasure: 'Qualified-to-proposal conversion from 35% to 45%.',
  },
  economics: { annualValue: 280000, confidence: 0.55, oneTimeCost: 40000, annualRunCost: 15000 },
  readiness: {
    strategicClarity: 4,
    processMaturity: 3,
    dataReadiness: 2,
    leadershipReadiness: 4,
    workforceReadiness: 3,
    governanceReadiness: 3,
  },
  matrix: { strategicAlignment: 4, businessValue: 4, processDataReadiness: 2, feasibility: 3, adoptionReadiness: 3 },
  gates: {
    privacy: 'pass',
    security: 'pass',
    legalRegulatory: 'pass',
    reliability: 'conditional',
    customerTrust: 'pass',
    vendorDependency: 'conditional',
  },
  design: {
    ...baseOpportunity('', '', '', 'sales', 'transform').design,
    processOwner: 'VP of Sales',
    currentChallenge: 'CRM data is incomplete; stages are used inconsistently.',
    aiCapability: 'Score deal risk and recommend follow-up actions.',
    targetOutcome: 'Every qualified deal has a next step within 48 hours.',
  },
};

const marginForecast: AIOpportunity = {
  ...baseOpportunity('o-margin', 'Engagement margin early-warning forecast', 'p-margin', 'finance', 'optimize'),
  stage: 'assessing',
  valueTest: {
    problem: 'Overruns are discovered at invoicing, when it is too late to correct scope or staffing.',
    impact: '~2 points of margin lost to unmanaged overruns.',
    whyAI: 'Forecasting from time-entry and scope patterns may detect overruns weeks earlier than monthly reviews.',
    successMeasure: 'Overruns flagged by week 3 of an engagement; margin +1.5 pts.',
  },
  economics: { annualValue: 100000, confidence: 0.45, oneTimeCost: 20000, annualRunCost: 8000 },
  readiness: {
    strategicClarity: 4,
    processMaturity: 3,
    dataReadiness: 4,
    leadershipReadiness: 4,
    workforceReadiness: 3,
    governanceReadiness: 4,
  },
  matrix: { strategicAlignment: 4, businessValue: 3, processDataReadiness: 4, feasibility: 3, adoptionReadiness: 3 },
  gates: {
    privacy: 'pass',
    security: 'pass',
    legalRegulatory: 'pass',
    reliability: 'pass',
    customerTrust: 'pass',
    vendorDependency: 'pass',
  },
};

const knowledge: AIOpportunity = {
  ...baseOpportunity('o-knowledge', 'Firm knowledge assistant for delivery teams', 'p-scale', 'human-resources', 'transform'),
  valueTest: {
    problem: 'Junior consultants depend on three senior partners for methodology and precedent.',
    impact: 'Partners are the capacity ceiling; ~25% of their time goes to answering repeat questions.',
    whyAI: 'Retrieval over the firm’s past deliverables can make institutional knowledge self-serve.',
    successMeasure: 'Partner interruptions down 50%; engagements per consultant from 6 to 9.',
  },
  economics: { annualValue: 420000, confidence: 0.5, oneTimeCost: 60000, annualRunCost: 24000 },
  readiness: {
    strategicClarity: 4,
    processMaturity: 2,
    dataReadiness: 2,
    leadershipReadiness: 4,
    workforceReadiness: 3,
    governanceReadiness: 2,
  },
  matrix: { strategicAlignment: 5, businessValue: 4, processDataReadiness: 2, feasibility: 2, adoptionReadiness: 3 },
  rolesAffected: 12,
  sourcing: {
    approach: 'partner',
    scores: { dataHandling: 2, integrationFit: 3, totalCost: 3, exitPortability: 2, providerViability: 3, timeToValue: 2 },
    rationale: '',
  },
};

const chatbot: AIOpportunity = {
  ...baseOpportunity('o-chatbot', 'AI chatbot for client check-ins', 'p-retention', 'customer-service', 'optimize'),
  valueTest: {
    problem: 'Clients feel neglected between engagements.',
    impact: 'Retention is 86% against a 92% goal.',
    whyAI: 'Automated check-ins could keep contact regular.',
    successMeasure: 'Retention to 92%.',
  },
  economics: { annualValue: 80000, confidence: 0.25, oneTimeCost: 25000, annualRunCost: 12000 },
  readiness: {
    strategicClarity: 3,
    processMaturity: 2,
    dataReadiness: 3,
    leadershipReadiness: 2,
    workforceReadiness: 3,
    governanceReadiness: 3,
  },
  matrix: { strategicAlignment: 2, businessValue: 2, processDataReadiness: 3, feasibility: 4, adoptionReadiness: 2 },
  gates: {
    privacy: 'pass',
    security: 'pass',
    legalRegulatory: 'pass',
    reliability: 'conditional',
    customerTrust: 'conditional',
    vendorDependency: 'pass',
  },
};

const clientData: AIOpportunity = {
  ...baseOpportunity('o-clientdata', 'Automated analysis of client financials in public AI tools', 'p-efficiency', 'operations', 'optimize'),
  valueTest: {
    problem: 'Analysts spend days building client financial analyses by hand.',
    impact: '~1,200 analyst hours per year.',
    whyAI: 'AI is strong at structured financial analysis and summarization.',
    successMeasure: 'Analysis time cut by 60%.',
  },
  economics: { annualValue: 150000, confidence: 0.7, oneTimeCost: 5000, annualRunCost: 6000 },
  readiness: {
    strategicClarity: 4,
    processMaturity: 4,
    dataReadiness: 4,
    leadershipReadiness: 3,
    workforceReadiness: 4,
    governanceReadiness: 2,
  },
  matrix: { strategicAlignment: 4, businessValue: 4, processDataReadiness: 4, feasibility: 5, adoptionReadiness: 4 },
  gates: {
    privacy: 'fail',
    security: 'fail',
    legalRegulatory: 'conditional',
    reliability: 'pass',
    customerTrust: 'fail',
    vendorDependency: 'pass',
  },
};

const benchmarking: AIOpportunity = {
  ...baseOpportunity('o-benchmark', 'AI-enabled benchmarking service sold to clients', 'p-revenue', 'product-service', 'reinvent'),
  valueTest: {
    problem: 'Revenue is capped by billable hours.',
    impact: 'A productized, subscription-priced service could add non-linear revenue.',
    whyAI: 'Anonymized cross-client data plus AI analysis can deliver benchmarks at a fraction of consulting cost.',
    successMeasure: '10 paying subscribers within 12 months.',
  },
  economics: { annualValue: 300000, confidence: 0.3, oneTimeCost: 90000, annualRunCost: 30000 },
  readiness: {
    strategicClarity: 3,
    processMaturity: 3,
    dataReadiness: 3,
    leadershipReadiness: 4,
    workforceReadiness: 3,
    governanceReadiness: 3,
  },
  matrix: { strategicAlignment: 4, businessValue: 2, processDataReadiness: 3, feasibility: 2, adoptionReadiness: 3 },
  gates: {
    privacy: 'conditional',
    security: 'pass',
    legalRegulatory: 'conditional',
    reliability: 'pass',
    customerTrust: 'conditional',
    vendorDependency: 'pass',
  },
};

const sampleInventory: AIUsageRecord[] = [
  { id: 'u1', useCase: 'Drafting client emails and memos', team: 'Consulting', toolCategory: 'Free public chat assistant', dataSensitivity: 'confidential', sanctioned: false, usersApprox: 14 },
  { id: 'u2', useCase: 'Pasting client spreadsheets for analysis', team: 'Analysts', toolCategory: 'Free public chat assistant', dataSensitivity: 'confidential', sanctioned: false, usersApprox: 5 },
  { id: 'u3', useCase: 'Meeting transcription and summaries', team: 'All', toolCategory: 'Meeting-notes add-on', dataSensitivity: 'internal', sanctioned: false, usersApprox: 20 },
  { id: 'u4', useCase: 'Proposal research and drafting (pilot)', team: 'Sales', toolCategory: 'Business-tier assistant', dataSensitivity: 'internal', sanctioned: true, usersApprox: 6 },
  { id: 'u5', useCase: 'Social posts and website copy', team: 'Marketing', toolCategory: 'Writing assistant', dataSensitivity: 'public', sanctioned: true, usersApprox: 2 },
];

const sampleExposure: RevenueExposure[] = [
  { id: 'x1', stream: 'Strategy engagements', revenueShare: 45, threat: 2, horizon: '3-plus-years', response: 'Differentiate on senior judgment and facilitation.' },
  { id: 'x2', stream: 'Market research & benchmarking reports', revenueShare: 25, threat: 5, horizon: 'now', response: '' },
  { id: 'x3', stream: 'Implementation support', revenueShare: 30, threat: 3, horizon: '1-2-years', response: 'Move from hourly billing to outcome-based fees.' },
];

const sampleOperatingModel: OperatingModel = {
  decisionRights: {
    setPriorities: { accountable: 'CEO', responsible: 'Leadership team', consulted: 'Board' },
    approveInvestment: { accountable: 'CEO', responsible: 'CFO', consulted: 'Process owner' },
    clearRiskGates: { accountable: '', responsible: 'Outside counsel', consulted: 'IT provider' },
    runPilot: { accountable: 'Process owner', responsible: 'Pilot team', consulted: 'Frontline staff' },
    scaleOrStop: { accountable: 'CEO', responsible: 'Process owner', consulted: 'CFO' },
    policyAndInventory: { accountable: 'COO', responsible: 'Operations manager', consulted: 'All staff' },
    portfolioReview: { accountable: 'CEO', responsible: 'COO', consulted: 'Leadership team' },
  },
  reviewCadence: 'quarterly',
  nextReviewDate: daysFromToday(30),
  workforceStance: 'redeploy-attrition',
  workforceCommitment:
    'No one will lose their job because of an AI pilot. Time AI frees up goes to client work and business development. Team size changes only through normal attrition.',
  comms: {
    whyBeforeWhat: true,
    commitmentStated: true,
    involveFrontline: true,
    trainingPlan: false,
    roleChanges: false,
    feedbackChannel: false,
    celebrateRedeployment: false,
  },
};

// Illustrative sessions showing how the validation log is used.
const sampleValidation: ValidationSession[] = [
  {
    id: 'v1', date: daysFromToday(-60), ceo: 'Example — CEO, engineering firm', industry: 'Engineering services', revenueBand: '10-50m',
    minutesToComplete: 180, topPickMatchedGut: true, overrides: 1, opportunitiesScored: 6,
    confusingQuestions: 'Confidence % felt arbitrary without examples.', followUp90: 'confirmed', notes: 'Pilot hit scale criteria at day 75.',
  },
  {
    id: 'v2', date: daysFromToday(-20), ceo: 'Example — CEO, distribution company', industry: 'Wholesale distribution', revenueBand: '50-250m',
    minutesToComplete: 260, topPickMatchedGut: false, overrides: 2, opportunitiesScored: 8,
    confusingQuestions: 'Difference between process maturity and data readiness.', followUp90: 'pending',
    notes: 'CEO favored a customer-facing bot; framework ranked inventory forecasting first.',
  },
];

export const sampleAlignState: AlignState = {
  companyName: 'Meridian Advisory Group',
  profile: { industry: 'Professional services', revenueBand: 'under-10m', employees: 32, edition: 'essentials', maxConcurrentPilots: null },
  priorities: samplePriorities,
  opportunities: [proposals, pipeline, marginForecast, knowledge, chatbot, clientData, benchmarking],
  aiInventory: sampleInventory,
  policy: {
    policyOwner: true,
    approvedTools: true,
    dataRules: false,
    humanReview: true,
    clientDisclosure: false,
    ipOwnership: false,
    incidentReporting: false,
    trainingRequired: false,
  },
  exposure: sampleExposure,
  operatingModel: sampleOperatingModel,
  thresholds: DEFAULT_THRESHOLDS,
  validation: sampleValidation,
  ipChecks: {
    trademarkSearch: false,
    distinctiveName: false,
    methodDocumented: true,
    materialsCopyright: false,
    licensingTerms: false,
    validatedWithCEOs: false,
  },
  lastReviewed: daysFromToday(0),
};

// Blank versions of the sections added after v1, used when upgrading a saved
// workspace so a user's own company never inherits the worked example's data.
const blankRight = { accountable: '', responsible: '', consulted: '' };

export const blankWorkspaceSections: Omit<AlignState, 'companyName' | 'priorities' | 'opportunities' | 'lastReviewed'> = {
  profile: { industry: '', revenueBand: 'under-10m', employees: 0, edition: 'essentials', maxConcurrentPilots: null },
  aiInventory: [],
  policy: {
    policyOwner: false,
    approvedTools: false,
    dataRules: false,
    humanReview: false,
    clientDisclosure: false,
    ipOwnership: false,
    incidentReporting: false,
    trainingRequired: false,
  },
  exposure: [],
  operatingModel: {
    decisionRights: {
      setPriorities: blankRight,
      approveInvestment: blankRight,
      clearRiskGates: blankRight,
      runPilot: blankRight,
      scaleOrStop: blankRight,
      policyAndInventory: blankRight,
      portfolioReview: blankRight,
    },
    reviewCadence: 'quarterly',
    nextReviewDate: '',
    workforceStance: 'undecided',
    workforceCommitment: '',
    comms: {
      whyBeforeWhat: false,
      commitmentStated: false,
      involveFrontline: false,
      trainingPlan: false,
      roleChanges: false,
      feedbackChannel: false,
      celebrateRedeployment: false,
    },
  },
  thresholds: DEFAULT_THRESHOLDS,
  validation: [],
  ipChecks: {
    trademarkSearch: false,
    distinctiveName: false,
    methodDocumented: false,
    materialsCopyright: false,
    licensingTerms: false,
    validatedWithCEOs: false,
  },
};
