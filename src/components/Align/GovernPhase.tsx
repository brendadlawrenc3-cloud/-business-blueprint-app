import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react';
import { Card, CardHeader, Badge } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type {
  AIOpportunity,
  GateStatus,
  IntegrationDesign,
  OpportunityStage,
  OversightLevel,
  RiskGate,
} from '../../types/align';
import { GATE_STATUS_LABELS, OVERSIGHT_LEVELS, PHASES, RISK_GATES } from '../../data/alignFramework';
import { designGaps, evaluateGates, type GateOutcome } from '../../utils/alignScoring';
import { Callout, NumberField, OpportunityPicker, PhaseHeader, TextField } from './shared';
import { inputClass } from './helpers';

const GATE_OUTCOME_DISPLAY: Record<GateOutcome, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  cleared: { label: 'Gates cleared', variant: 'success' },
  'cleared-with-conditions': { label: 'Cleared with conditions', variant: 'warning' },
  incomplete: { label: 'Gates incomplete', variant: 'default' },
  blocked: { label: 'Blocked by risk gate', variant: 'danger' },
};

const GATE_ICONS: Record<GateStatus, typeof ShieldCheck> = {
  pass: ShieldCheck,
  conditional: ShieldAlert,
  fail: ShieldX,
  'not-assessed': ShieldQuestion,
};

const GATE_COLORS: Record<GateStatus, string> = {
  pass: 'text-emerald-600',
  conditional: 'text-amber-500',
  fail: 'text-red-600',
  'not-assessed': 'text-slate-400',
};

const STAGES: OpportunityStage[] = ['identified', 'assessing', 'piloting', 'scaling', 'stopped'];

export function GovernPhase() {
  const { opportunities, updateOpportunity } = useAlign();
  const [selectedId, setSelectedId] = useState(opportunities[0]?.id ?? '');
  const selected = opportunities.find((o) => o.id === selectedId) ?? opportunities[0];

  return (
    <div className="space-y-6">
      <PhaseHeader letter="G" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card padding="sm">
          <p className="px-2 pt-2 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Opportunities</p>
          <OpportunityPicker
            opportunities={opportunities}
            selectedId={selected?.id ?? ''}
            onSelect={setSelectedId}
            renderMeta={(o) => {
              const d = GATE_OUTCOME_DISPLAY[evaluateGates(o)];
              return <Badge variant={d.variant}>{d.label}</Badge>;
            }}
          />
        </Card>

        {selected && (
          <div className="lg:col-span-3 space-y-6">
            <RiskGates opportunity={selected} onChange={updateOpportunity} />
            <BusinessCase opportunity={selected} onChange={updateOpportunity} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader title="Five integration questions" subtitle="AI integration is an organizational change initiative — not a technology project" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          {PHASES[3].executiveQuestions.map((q) => {
            const [head, ...rest] = q.split(':');
            return (
              <div key={q} className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-900">{head}</p>
                <p className="text-slate-600 mt-1">{rest.join(':').trim()}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function RiskGates({ opportunity: o, onChange }: { opportunity: AIOpportunity; onChange: (o: AIOpportunity) => void }) {
  const outcome = evaluateGates(o);
  const display = GATE_OUTCOME_DISPLAY[outcome];
  return (
    <Card padding="lg">
      <CardHeader
        title="Mandatory risk gates"
        subtitle="Risk is a gate, not a weighted score. One failure stops the opportunity, however valuable."
        action={<Badge variant={display.variant} size="md">{display.label}</Badge>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.keys(RISK_GATES) as RiskGate[]).map((gate) => {
          const status = o.gates[gate];
          const Icon = GATE_ICONS[status];
          return (
            <div key={gate} className="flex items-start gap-3 border border-slate-200 rounded-lg p-3">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${GATE_COLORS[status]}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{RISK_GATES[gate].label}</p>
                <p className="text-xs text-slate-500">{RISK_GATES[gate].question}</p>
              </div>
              <select
                aria-label={RISK_GATES[gate].label}
                className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white"
                value={status}
                onChange={(e) => onChange({ ...o, gates: { ...o.gates, [gate]: e.target.value as GateStatus } })}
              >
                {(Object.keys(GATE_STATUS_LABELS) as GateStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {GATE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function BusinessCase({ opportunity: o, onChange }: { opportunity: AIOpportunity; onChange: (o: AIOpportunity) => void }) {
  const gaps = designGaps(o);
  const set = <K extends keyof IntegrationDesign>(key: K, value: IntegrationDesign[K]) =>
    onChange({ ...o, design: { ...o.design, [key]: value } });
  const d = o.design;

  return (
    <Card padding="lg">
      <CardHeader
        title="AI Integration Business Case"
        subtitle="Define what the business needs AI to accomplish before evaluating any product"
        action={
          <select
            aria-label="Stage"
            className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white capitalize"
            value={o.stage}
            onChange={(e) => onChange({ ...o, stage: e.target.value as OpportunityStage })}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField label="Business objective" value={o.valueTest.successMeasure} onChange={(v) => onChange({ ...o, valueTest: { ...o.valueTest, successMeasure: v } })} />
        <TextField label="Process owner" value={d.processOwner} onChange={(v) => set('processOwner', v)} />
        <TextField label="Current challenge" value={d.currentChallenge} onChange={(v) => set('currentChallenge', v)} />
        <TextField label="Target outcome" value={d.targetOutcome} onChange={(v) => set('targetOutcome', v)} />
        <TextField label="AI-enabled capability (tool-agnostic)" value={d.aiCapability} onChange={(v) => set('aiCapability', v)} multiline />
        <TextField label="Process: how the workflow changes" value={d.processChange} onChange={(v) => set('processChange', v)} multiline />
        <TextField label="People: roles, skills, decision rights" value={d.peopleChange} onChange={(v) => set('peopleChange', v)} multiline />
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Oversight model</span>
            <select
              className={`${inputClass} mt-1`}
              value={d.oversightLevel}
              onChange={(e) => set('oversightLevel', e.target.value as OversightLevel)}
            >
              {(Object.keys(OVERSIGHT_LEVELS) as OversightLevel[]).map((l) => (
                <option key={l} value={l}>
                  {OVERSIGHT_LEVELS[l].label} — {OVERSIGHT_LEVELS[l].description}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Human oversight in practice" value={d.humanOversight} onChange={(v) => set('humanOversight', v)} />
        </div>
        <TextField label="Scale criteria (agreed before the pilot)" value={d.scaleCriteria} onChange={(v) => set('scaleCriteria', v)} multiline />
        <TextField label="Stop criteria (agreed before the pilot)" value={d.stopCriteria} onChange={(v) => set('stopCriteria', v)} multiline />
        <NumberField label="Pilot period (days)" value={d.pilotDays} onChange={(v) => set('pilotDays', v)} step={15} />
        <label className="flex items-center gap-2 mt-6 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={d.baselineCaptured}
            onChange={(e) => set('baselineCaptured', e.target.checked)}
            className="w-4 h-4"
          />
          Baseline measured before the pilot starts
        </label>
      </div>

      <div className="mt-6">
        {gaps.length > 0 ? (
          <Callout tone="warning" title={`${gaps.length} business-case gap${gaps.length === 1 ? '' : 's'} before approval`}>
            <ul className="list-disc list-inside">
              {gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </Callout>
        ) : (
          <Callout tone="success" title="Business case complete">
            Expand only if results meet the scale criteria and justify the cost and risk.
          </Callout>
        )}
      </div>
    </Card>
  );
}
