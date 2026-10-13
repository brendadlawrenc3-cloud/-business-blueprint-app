import { useState } from 'react';
import { CalendarPlus, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar } from '../ui';
import { useAlign } from '../../context/AlignContext';
import { useCEO } from '../../context/CEOContext';
import type {
  CommsStep,
  DecisionRight,
  GovernanceActivity,
  IntegrationLevel,
  OperatingModel as OperatingModelState,
  WorkforceStance,
} from '../../types/align';
import { COMMS_STEPS, GOVERNANCE_ACTIVITIES, LEVELS, WORKFORCE_STANCES } from '../../data/alignFramework';
import { capacityStatus, finalCategory, operatingModelGaps } from '../../utils/alignScoring';
import { Callout, TextField } from './shared';
import { inputClass } from './helpers';

const REVIEW_AGENDA = [
  'Strategic priorities: what changed since last review?',
  'Scorecard: actuals vs baseline for every pilot',
  'Scale / iterate / stop decisions due',
  'Decision Matrix: new opportunities and re-scores',
  'Current AI use inventory and policy exceptions',
  'Sustain alerts: cost, accuracy, ownership',
  'Change capacity: pilots running vs limit',
];

export function OperatingModel() {
  const state = useAlign();
  const { operatingModel: m, patch } = state;
  const gaps = operatingModelGaps(m);
  const set = (p: Partial<OperatingModelState>) => patch({ operatingModel: { ...m, ...p } });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white" padding="lg">
        <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Operating model</p>
        <h2 className="text-2xl font-bold mt-1">Who decides, how often, and what we promise our people</h2>
        <p className="text-slate-300 mt-2 max-w-3xl">
          The phases say what to decide. This tab sets who owns each decision, how often the AI portfolio is reviewed,
          the commitment to employees that keeps adoption going, and how much change the company can absorb.
        </p>
      </Card>

      {gaps.length > 0 && (
        <Callout tone="warning" title="Operating-model gaps">
          <ul className="list-disc list-inside">{gaps.map((g) => <li key={g}>{g}</li>)}</ul>
        </Callout>
      )}

      <DecisionRights rights={m.decisionRights} onChange={(decisionRights) => set({ decisionRights })} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewCadence model={m} onChange={set} />
        <Capacity />
      </div>

      <Workforce model={m} onChange={set} />
    </div>
  );
}

function DecisionRights({
  rights,
  onChange,
}: {
  rights: Record<GovernanceActivity, DecisionRight>;
  onChange: (r: Record<GovernanceActivity, DecisionRight>) => void;
}) {
  const update = (a: GovernanceActivity, key: keyof DecisionRight, v: string) =>
    onChange({ ...rights, [a]: { ...rights[a], [key]: v } });

  return (
    <Card padding="lg">
      <CardHeader
        title="Decision rights"
        subtitle="Exactly one Accountable role per activity. Responsible does the work; Consulted gives input first."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-3">Activity</th>
              <th className="py-2 pr-3">Accountable</th>
              <th className="py-2 pr-3">Responsible</th>
              <th className="py-2">Consulted</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(GOVERNANCE_ACTIVITIES) as GovernanceActivity[]).map((a) => (
              <tr key={a} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-medium text-slate-800">{GOVERNANCE_ACTIVITIES[a]}</td>
                {(['accountable', 'responsible', 'consulted'] as (keyof DecisionRight)[]).map((k) => (
                  <td key={k} className="py-2 pr-3">
                    <input
                      aria-label={`${GOVERNANCE_ACTIVITIES[a]}: ${k}`}
                      className={`${inputClass} ${k === 'accountable' && !rights[a].accountable.trim() ? '!border-red-400 !bg-red-50' : ''}`}
                      value={rights[a][k]}
                      placeholder={k === 'accountable' ? 'Required' : ''}
                      onChange={(e) => update(a, k, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReviewCadence({ model: m, onChange }: { model: OperatingModelState; onChange: (p: Partial<OperatingModelState>) => void }) {
  const { addMeeting, meetings } = useCEO();
  const [added, setAdded] = useState(false);
  const alreadyScheduled = added || meetings.some((x) => x.title === 'AI Portfolio Review');
  const owner = m.decisionRights.portfolioReview.accountable || 'CEO';

  const schedule = () => {
    addMeeting({
      id: `align-review-${Date.now()}`,
      title: 'AI Portfolio Review',
      dayOfWeek: 'Thursday',
      time: '14:00',
      duration: m.reviewCadence === 'monthly' ? 60 : 120,
      attendees: [owner, m.decisionRights.portfolioReview.responsible, 'Leadership team'].filter(Boolean),
      type: 'strategy',
      recurring: true,
      agenda: REVIEW_AGENDA,
      notes: `ALIGN ${m.reviewCadence} review. Next: ${m.nextReviewDate || 'to be scheduled'}.`,
    });
    setAdded(true);
  };

  return (
    <Card padding="lg">
      <CardHeader title="Portfolio review rhythm" subtitle="Run it inside the leadership meeting cadence, not as a separate IT meeting" />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cadence</span>
          <select className={`${inputClass} mt-1`} value={m.reviewCadence} onChange={(e) => onChange({ reviewCadence: e.target.value as OperatingModelState['reviewCadence'] })}>
            <option value="quarterly">Quarterly (Essentials)</option>
            <option value="monthly">Monthly (Enterprise)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Next review</span>
          <input type="date" className={`${inputClass} mt-1`} value={m.nextReviewDate} onChange={(e) => onChange({ nextReviewDate: e.target.value })} />
        </label>
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-4 mb-2">Standing agenda</p>
      <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
        {REVIEW_AGENDA.map((a) => <li key={a}>{a}</li>)}
      </ol>
      <Button
        className="mt-4"
        size="sm"
        variant={alreadyScheduled ? 'secondary' : 'primary'}
        disabled={alreadyScheduled}
        onClick={schedule}
        icon={alreadyScheduled ? <Check className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
      >
        {alreadyScheduled ? 'In the Command Center meeting cadence' : 'Add to Command Center meetings'}
      </Button>
    </Card>
  );
}

function Capacity() {
  const state = useAlign();
  const cap = capacityStatus(state);
  const used = cap.active + cap.queued;
  const levels = (Object.keys(LEVELS) as IntegrationLevel[]).map((l) => ({
    level: l,
    count: state.opportunities.filter(
      (o) => o.level === l && o.stage !== 'stopped' && finalCategory(o, state.thresholds) !== 'do-not-pursue',
    ).length,
  }));
  const noBets = levels.filter((l) => l.level !== 'optimize').every((l) => l.count === 0);

  return (
    <Card padding="lg">
      <CardHeader title="Change capacity & portfolio balance" subtitle="Set the limit on Assess → Company profile" />
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Pilots running + approved to start</p>
          <p className={`text-4xl font-bold ${cap.overCapacity ? 'text-red-600' : 'text-slate-900'}`}>
            {used}<span className="text-lg text-slate-400"> / {cap.limit}</span>
          </p>
        </div>
        {cap.overCapacity ? (
          <Badge variant="danger" size="md"><AlertTriangle className="w-3.5 h-3.5 mr-1" />Over capacity</Badge>
        ) : (
          <Badge variant="success" size="md"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Within capacity</Badge>
        )}
      </div>
      <div className="mt-3">
        <ProgressBar value={Math.min(used, cap.limit)} max={cap.limit} color={cap.overCapacity ? 'red' : used === cap.limit ? 'amber' : 'green'} />
      </div>
      <p className="text-xs text-slate-500 mt-2">{cap.active} running · {cap.queued} approved and waiting</p>

      <p className="text-sm font-semibold text-slate-800 mt-6 mb-2">Active portfolio by level</p>
      <div className="grid grid-cols-3 gap-2">
        {levels.map(({ level, count }) => (
          <div key={level} className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500">{LEVELS[level].label}</p>
          </div>
        ))}
      </div>
      {noBets && (
        <p className="text-xs text-amber-700 mt-3">
          Every active item is Optimize. Consider at least one Transform or Reinvent bet, especially where the exposure check shows high threat.
        </p>
      )}
    </Card>
  );
}

function Workforce({ model: m, onChange }: { model: OperatingModelState; onChange: (p: Partial<OperatingModelState>) => void }) {
  const { opportunities } = useAlign();
  const stance = WORKFORCE_STANCES[m.workforceStance];
  const done = Object.values(m.comms).filter(Boolean).length;
  const total = Object.values(m.comms).length;
  const rolesAffected = opportunities.filter((o) => o.stage !== 'stopped').reduce((s, o) => s + o.rolesAffected, 0);
  const missingPlans = opportunities.filter((o) => o.rolesAffected > 0 && !o.reskillingPlan.trim());

  return (
    <Card padding="lg">
      <CardHeader
        title="Workforce commitment & communication"
        subtitle="People adopt AI when they trust what it means for them. Say it before the first pilot, in writing."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Leadership position</span>
            <select className={`${inputClass} mt-1`} value={m.workforceStance} onChange={(e) => onChange({ workforceStance: e.target.value as WorkforceStance })}>
              {(Object.keys(WORKFORCE_STANCES) as WorkforceStance[]).map((w) => (
                <option key={w} value={w}>{WORKFORCE_STANCES[w].label}</option>
              ))}
            </select>
          </label>
          <Callout tone={m.workforceStance === 'undecided' ? 'danger' : m.workforceStance === 'reduce' ? 'warning' : 'success'} title={stance.label}>
            {stance.guidance}
          </Callout>
          <TextField
            label="Commitment statement (shared with all staff)"
            value={m.workforceCommitment}
            onChange={(v) => onChange({ workforceCommitment: v })}
            multiline
            placeholder="In plain words: what AI means for jobs here, where freed time goes, and how people will be supported."
          />
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{rolesAffected}</span> roles affected across active opportunities.
            {missingPlans.length > 0 && (
              <span className="text-red-600"> {missingPlans.length} without a reskilling plan: {missingPlans.map((o) => o.title).join('; ')}.</span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-800">Communication plan</p>
            <span className="text-xs text-slate-500">{done}/{total} done</span>
          </div>
          <ProgressBar value={done} max={total} size="sm" color={done === total ? 'green' : done >= total / 2 ? 'amber' : 'red'} />
          <ul className="mt-3 space-y-2">
            {(Object.keys(COMMS_STEPS) as CommsStep[]).map((k, i) => (
              <li key={k}>
                <label className="flex items-start gap-3 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-0.5" checked={m.comms[k]} onChange={(e) => onChange({ comms: { ...m.comms, [k]: e.target.checked } })} />
                  <span className={m.comms[k] ? 'text-slate-400 line-through' : 'text-slate-700'}>{i + 1}. {COMMS_STEPS[k]}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
