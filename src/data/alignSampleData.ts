// Worked example: a $5M professional services firm whose CEO wants to reach
// $8M. Prospects are plentiful; converting them into contracts is not.
import type {
  AIOpportunity,
  AlignState,
  BusinessFunction,
  IntegrationLevel,
  StrategicPriority,
} from '../types/align';

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

export const sampleAlignState: AlignState = {
  companyName: 'Meridian Advisory Group',
  priorities: samplePriorities,
  opportunities: [proposals, pipeline, marginForecast, knowledge, chatbot, clientData, benchmarking],
  lastReviewed: new Date().toISOString().split('T')[0],
};
