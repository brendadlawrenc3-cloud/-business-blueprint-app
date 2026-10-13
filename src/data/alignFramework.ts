// Reference content for the ALIGN Framework™: phase definitions, executive
// questions, scoring rubrics, gates, and decision definitions.
import type {
  BusinessFunction,
  ConstraintType,
  DecisionCategory,
  GateStatus,
  IntegrationLevel,
  MatrixCriterion,
  OversightLevel,
  PerformanceCategory,
  ReadinessClass,
  ReadinessDimension,
  RiskGate,
} from '../types/align';

export const CORE_PRINCIPLE =
  'AI should not determine your business strategy. Your business strategy should determine where AI creates value.';

export const CENTRAL_QUESTION =
  'Where can AI strengthen our ability to execute our strategy, improve performance, and build a more valuable enterprise?';

export const VALUE_CHAIN = [
  'Business Strategy',
  'Business Processes',
  'AI Opportunities',
  'Execution',
  'Business Outcomes',
];

export interface PhaseDefinition {
  letter: string;
  name: string;
  decision: 'WHY' | 'WHERE' | 'WHEN' | 'HOW' | 'WHAT';
  question: string;
  purpose: string;
  executiveQuestions: string[];
  deliverable: string;
  exitCriteria: string[];
}

export const PHASES: PhaseDefinition[] = [
  {
    letter: 'A',
    name: 'Assess Business Priorities',
    decision: 'WHY',
    question: 'What strategic business outcome justifies AI investment?',
    purpose:
      'Start from what the business must accomplish — not from what technology can do. Separate gaps AI can close from gaps that need leadership, accountability, or process redesign.',
    executiveQuestions: [
      'What are our three most important business objectives?',
      'What is preventing us from achieving them?',
      'Where are we experiencing performance gaps?',
      'Which activities consume disproportionate time or resources?',
      'What capabilities must improve for the business to scale?',
      'Where could AI change how competitors, customers, or new entrants compete in our market?',
    ],
    deliverable: 'AI Strategic Alignment Map',
    exitCriteria: [
      'Three to five priorities with baseline, current, and target values',
      'A named executive owner for each priority',
      'Each constraint classified — AI lever, partial lever, or non-AI fix',
    ],
  },
  {
    letter: 'L',
    name: 'Locate Value Opportunities',
    decision: 'WHERE',
    question: 'Which processes, constraints, or capabilities offer the greatest opportunity?',
    purpose:
      'Examine how the business creates and delivers value, then locate the constraints that AI could remove. Every candidate must pass the Business Value Test and carry a quantified value hypothesis.',
    executiveQuestions: [
      'What business problem are we solving?',
      'What financial or operational impact does this problem create?',
      'Why is AI an appropriate solution rather than conventional process improvement or automation?',
      'What measurable result would justify the investment?',
    ],
    deliverable: 'AI Value Opportunity Map',
    exitCriteria: [
      'Every opportunity traces to a strategic priority',
      'All four Business Value Test questions answered',
      'Risk-adjusted annual value and total cost estimated',
    ],
  },
  {
    letter: 'I',
    name: 'Identify AI Readiness',
    decision: 'WHEN',
    question: 'Is the organization ready, and what must happen first?',
    purpose:
      'An opportunity is not the same as readiness. Score six dimensions; a critical deficiency blocks a pilot regardless of the average.',
    executiveQuestions: [
      'Do we know exactly what outcome we want?',
      'Is the process documented and understood?',
      'Is the necessary data accurate, accessible, and usable?',
      'Is there an accountable executive sponsor?',
      'Do employees have the skills and support to adopt AI?',
      'Can we manage privacy, security, reliability, and compliance risks?',
    ],
    deliverable: 'AI Integration Readiness Assessment',
    exitCriteria: [
      'All six dimensions scored with evidence',
      'Classification: Ready to Pilot, Prepare, or Defer/Redesign',
      'Readiness gaps converted into named preparation actions',
    ],
  },
  {
    letter: 'G',
    name: 'Govern Integration and Execution',
    decision: 'HOW',
    question: 'How will AI be integrated into operations, people, governance, and execution?',
    purpose:
      'AI integration is an organizational change initiative, not a technology project. Define the business case, human oversight, risk gates, baseline, and the criteria to scale or stop — before evaluating any product.',
    executiveQuestions: [
      'Process: How will the existing workflow change?',
      'People: How will responsibilities, skills, and decision rights change?',
      'Technology: What capabilities are required (tool-agnostic)?',
      'Governance: What controls, approvals, and human oversight are necessary?',
      'Performance: How will we determine whether the integration is successful?',
    ],
    deliverable: 'AI Integration Business Case & Implementation Roadmap',
    exitCriteria: [
      'Process owner and human-oversight model defined',
      'All risk gates assessed — none failed',
      'Baseline captured before the pilot starts',
      'Scale and stop criteria agreed in advance',
    ],
  },
  {
    letter: 'N',
    name: 'Navigate Performance and Scale',
    decision: 'WHAT',
    question: 'What measurable value is AI creating, and how will we sustain it?',
    purpose:
      'AI activity is not business impact. Measure against the baseline across four dimensions and require every efficiency gain to be connected to a financial or strategic outcome.',
    executiveQuestions: [
      'Did the target metric move against its baseline?',
      'Where did the freed capacity go?',
      'Did revenue, margin, capacity, or customer outcomes change as a result?',
      'Should we scale, iterate, or stop?',
      'What has changed in our strategy or market that requires reassessment?',
    ],
    deliverable: 'AI Business Performance Scorecard',
    exitCriteria: [
      'Actuals recorded against baseline for each measure',
      'Every efficiency gain linked to a business outcome',
      'Scale / iterate / stop decision recorded and fed into the next cycle',
    ],
  },
];

export interface ConstraintDefinition {
  label: string;
  aiFit: 'ai-lever' | 'partial' | 'non-ai';
  guidance: string;
}

// The "Is this an AI problem?" diagnostic.
export const CONSTRAINT_TYPES: Record<ConstraintType, ConstraintDefinition> = {
  capacity: {
    label: 'Capacity — too much work for the people available',
    aiFit: 'ai-lever',
    guidance: 'AI can absorb repetitive cognitive work. Plan where freed capacity is redeployed.',
  },
  'cycle-time': {
    label: 'Cycle time — work takes too long',
    aiFit: 'ai-lever',
    guidance: 'AI can compress research, drafting, and analysis steps. Map the full cycle first.',
  },
  consistency: {
    label: 'Consistency — quality varies by person',
    aiFit: 'ai-lever',
    guidance: 'AI can encode standards and best practice, but only once the standard exists.',
  },
  insight: {
    label: 'Insight — decisions lack timely information',
    aiFit: 'ai-lever',
    guidance: 'AI can surface patterns and forecasts — only as good as the underlying data.',
  },
  'knowledge-access': {
    label: 'Knowledge access — expertise is locked in a few heads',
    aiFit: 'ai-lever',
    guidance: 'AI can make institutional knowledge searchable. Requires captured knowledge.',
  },
  'process-design': {
    label: 'Process design — the workflow itself is broken',
    aiFit: 'partial',
    guidance: 'Redesign the process first. Applying AI to a broken process accelerates the breakage.',
  },
  'skills-talent': {
    label: 'Skills / talent — capability gaps on the team',
    aiFit: 'partial',
    guidance: 'AI can augment skills, but hiring, training, or role design may be the real fix.',
  },
  accountability: {
    label: 'Accountability — no clear owner or follow-through',
    aiFit: 'non-ai',
    guidance: 'Not an AI problem. Fix ownership, cadence, and consequences first.',
  },
  'leadership-alignment': {
    label: 'Leadership alignment — the team disagrees on direction',
    aiFit: 'non-ai',
    guidance: 'Not an AI problem. Resolve at the leadership-team level.',
  },
  'strategy-clarity': {
    label: 'Strategy clarity — priorities are unclear',
    aiFit: 'non-ai',
    guidance: 'Not an AI problem. Clarify strategy before evaluating any AI investment.',
  },
};

export const FUNCTION_LABELS: Record<BusinessFunction, string> = {
  sales: 'Sales',
  marketing: 'Marketing',
  operations: 'Operations',
  finance: 'Finance',
  'customer-service': 'Customer Service',
  'human-resources': 'Human Resources',
  'product-service': 'Product / Service Delivery',
};

export const FUNCTION_EXAMPLES: Record<BusinessFunction, { opportunity: string; outcome: string }> = {
  sales: { opportunity: 'Lead qualification and sales forecasting', outcome: 'Higher conversion rates' },
  marketing: { opportunity: 'Customer segmentation and campaign analysis', outcome: 'Lower acquisition costs' },
  operations: { opportunity: 'Workflow optimization and capacity planning', outcome: 'Reduced operating costs' },
  finance: { opportunity: 'Cash-flow forecasting and financial analysis', outcome: 'Improved financial visibility' },
  'customer-service': { opportunity: 'Faster inquiry resolution', outcome: 'Higher customer satisfaction' },
  'human-resources': { opportunity: 'Workforce planning and knowledge management', outcome: 'Greater organizational capacity' },
  'product-service': { opportunity: 'AI-enhanced or new AI-enabled offerings', outcome: 'New revenue and differentiation' },
};

export const LEVELS: Record<IntegrationLevel, { label: string; purpose: string; example: string; measure: string }> = {
  optimize: {
    label: 'Level 1 · Optimize',
    purpose: 'Improve existing operations',
    example: 'Reduce proposal development time',
    measure: 'Cost, cycle time, productivity',
  },
  transform: {
    label: 'Level 2 · Transform',
    purpose: 'Redesign how work gets done',
    example: 'An integrated, AI-enabled sales delivery process',
    measure: 'Capacity, margin, customer outcomes',
  },
  reinvent: {
    label: 'Level 3 · Reinvent',
    purpose: 'New business capabilities or revenue models',
    example: 'An AI-enabled advisory service the company can sell',
    measure: 'New revenue, differentiation, enterprise value',
  },
};

export const READINESS_DIMENSIONS: Record<
  ReadinessDimension,
  { label: string; question: string; critical: boolean; rubric: [string, string, string] }
> = {
  strategicClarity: {
    label: 'Strategic clarity',
    question: 'Do we know what outcome we want?',
    critical: false,
    rubric: ['No defined outcome', 'Outcome named, not measured', 'Measurable target with owner'],
  },
  processMaturity: {
    label: 'Process maturity',
    question: 'Is the process documented and understood?',
    critical: false,
    rubric: ['Undocumented, person-dependent', 'Partly documented, inconsistent', 'Documented, stable, measured'],
  },
  dataReadiness: {
    label: 'Data readiness',
    question: 'Is the necessary data accurate, accessible, and usable?',
    critical: true,
    rubric: ['Missing or unreliable', 'Exists but scattered / unclean', 'Accurate, accessible, governed'],
  },
  leadershipReadiness: {
    label: 'Leadership readiness',
    question: 'Is there an accountable executive sponsor?',
    critical: false,
    rubric: ['No sponsor', 'Interested but not accountable', 'Named, accountable, resourced'],
  },
  workforceReadiness: {
    label: 'Workforce readiness',
    question: 'Do employees have the skills and support to adopt AI?',
    critical: false,
    rubric: ['Resistant or unaware', 'Curious, untrained', 'Trained, involved, supported'],
  },
  governanceReadiness: {
    label: 'Governance readiness',
    question: 'Can we manage privacy, security, reliability, and compliance risks?',
    critical: true,
    rubric: ['No policy or controls', 'Informal guidelines', 'Policy, controls, and review in place'],
  },
};

export const READINESS_CLASSES: Record<ReadinessClass, { label: string; description: string }> = {
  'ready-to-pilot': {
    label: 'Ready to Pilot',
    description: 'Clearly defined use case, measurable outcomes, appropriate data, and sufficient safeguards.',
  },
  prepare: {
    label: 'Prepare Before Implementing',
    description: 'Promising, but processes, data, skills, or governance require improvement first.',
  },
  'defer-redesign': {
    label: 'Defer or Redesign',
    description: 'The business case is weak, the outcome undefined, or the risks outweigh the benefits.',
  },
};

export const MATRIX_CRITERIA: Record<MatrixCriterion, { label: string; weight: number; guide: string }> = {
  strategicAlignment: { label: 'Strategic alignment', weight: 0.25, guide: 'Directly advances a top-3 priority?' },
  businessValue: { label: 'Expected business value', weight: 0.25, guide: 'Size and certainty of measurable impact' },
  processDataReadiness: { label: 'Process & data readiness', weight: 0.2, guide: 'Process stable, data usable?' },
  feasibility: { label: 'Implementation feasibility', weight: 0.15, guide: 'Effort, complexity, dependencies' },
  adoptionReadiness: { label: 'Organizational adoption', weight: 0.15, guide: 'Will people actually use it?' },
};

export const RISK_GATES: Record<RiskGate, { label: string; question: string }> = {
  privacy: { label: 'Data privacy', question: 'Is personal or client-confidential data protected and used lawfully?' },
  security: { label: 'Security', question: 'Are access, data leakage, and vendor security controlled?' },
  legalRegulatory: { label: 'Legal, regulatory & IP', question: 'Does it comply with regulation, contracts, and IP ownership?' },
  reliability: { label: 'Reliability & accuracy', question: 'Are error rates acceptable and errors caught before harm?' },
  customerTrust: { label: 'Customer & reputational trust', question: 'Would customers be comfortable if they knew how AI was used?' },
  vendorDependency: { label: 'Vendor dependency & exit', question: 'Can we switch providers or exit without losing data or capability?' },
};

export const GATE_STATUS_LABELS: Record<GateStatus, string> = {
  'not-assessed': 'Not assessed',
  pass: 'Pass',
  conditional: 'Conditional',
  fail: 'Fail',
};

export const OVERSIGHT_LEVELS: Record<OversightLevel, { label: string; description: string }> = {
  'human-decides': { label: 'Human decides', description: 'AI informs; a person makes every decision.' },
  'human-approves': { label: 'Human approves', description: 'AI drafts or recommends; a person approves before action.' },
  'human-monitors': { label: 'Human monitors', description: 'AI acts within limits; people review samples and exceptions.' },
};

export const DECISION_CATEGORIES: Record<
  DecisionCategory,
  { label: string; description: string; variant: 'success' | 'info' | 'warning' | 'danger' }
> = {
  'invest-now': { label: 'Invest Now', description: 'High value, high readiness, acceptable risk.', variant: 'success' },
  'build-readiness': { label: 'Build Readiness', description: 'High value, insufficient readiness.', variant: 'info' },
  'pilot-validate': { label: 'Pilot & Validate', description: 'Promising value, uncertain benefits or feasibility.', variant: 'warning' },
  'do-not-pursue': { label: 'Do Not Pursue', description: 'Low strategic value, poor economics, or unacceptable risk.', variant: 'danger' },
};

export const PERFORMANCE_CATEGORIES: Record<PerformanceCategory, { label: string; examples: string }> = {
  financial: { label: 'Financial', examples: 'Revenue, gross margin, EBITDA, cost savings' },
  operational: { label: 'Operational', examples: 'Cycle time, productivity, error rates, capacity' },
  customer: { label: 'Customer', examples: 'Retention, satisfaction, response times' },
  organizational: { label: 'Organizational', examples: 'Employee capacity, adoption, decision quality' },
};

// Events that should trigger an off-cycle reassessment of the AI portfolio.
export const REASSESSMENT_TRIGGERS = [
  'Annual or quarterly strategic plan refresh',
  'A strategic priority is achieved, dropped, or materially changed',
  'A competitor or new entrant uses AI to change pricing, speed, or service',
  'A significant shift in AI capability or cost',
  'A pilot reaches its scale-or-stop decision point',
  'A new regulation, client contract term, or security incident',
];

export const CONTRAST_TABLE: [string, string][] = [
  ['What AI tools should we use?', 'What business outcomes must improve?'],
  ['Which activities can we automate?', 'Which business constraints should we remove?'],
  ['How quickly can we deploy AI?', 'When are we ready to integrate AI responsibly?'],
  ['How many employees are using AI?', 'How is AI improving enterprise performance?'],
  ['What new technology is available?', 'What new business capabilities should we develop?'],
];
