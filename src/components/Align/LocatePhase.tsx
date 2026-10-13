import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardHeader, Badge, Button } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type { AIOpportunity, BusinessFunction, IntegrationLevel } from '../../types/align';
import { FUNCTION_EXAMPLES, FUNCTION_LABELS, LEVELS, PHASES } from '../../data/alignFramework';
import { constraintFit, summarizeEconomics, valueTestComplete } from '../../utils/alignScoring';
import { createOpportunity } from '../../data/alignSampleData';
import { Callout, NumberField, PhaseHeader, TextField } from './shared';
import { formatMoney, inputClass } from './helpers';

const VALUE_TEST_FIELDS: { key: keyof AIOpportunity['valueTest']; label: string }[] = [
  { key: 'problem', label: '1. What business problem are we solving?' },
  { key: 'impact', label: '2. What financial or operational impact does this problem create?' },
  { key: 'whyAI', label: '3. Why is AI the right solution — rather than process improvement or conventional automation?' },
  { key: 'successMeasure', label: '4. What measurable result would justify the investment?' },
];

export function LocatePhase() {
  const { opportunities, priorities, updateOpportunity, dispatch } = useAlign();
  const [selectedId, setSelectedId] = useState(opportunities[0]?.id ?? '');
  const selected = opportunities.find((o) => o.id === selectedId) ?? opportunities[0];

  const addOpportunity = () => {
    const o = createOpportunity('New AI opportunity', priorities[0]?.id ?? '', 'operations', 'optimize');
    dispatch({ type: 'ADD_OPPORTUNITY', payload: o });
    setSelectedId(o.id);
  };

  return (
    <div className="space-y-6">
      <PhaseHeader letter="L" />

      <Card padding="lg">
        <CardHeader
          title="AI Value Opportunity Map"
          subtitle="Every opportunity traces to a strategic priority and carries a risk-adjusted value hypothesis"
          action={
            <Button size="sm" onClick={addOpportunity} icon={<Plus className="w-4 h-4" />}>
              Opportunity
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Opportunity</th>
                <th className="py-2 pr-4">Strategic priority</th>
                <th className="py-2 pr-4">Function</th>
                <th className="py-2 pr-4">Level</th>
                <th className="py-2 pr-4 text-right">Risk-adj. value</th>
                <th className="py-2 pr-4 text-right">Payback</th>
                <th className="py-2">Value test</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => {
                const econ = summarizeEconomics(o);
                const priority = priorities.find((p) => p.id === o.priorityId);
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={`border-b border-slate-100 cursor-pointer ${o.id === selected?.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{o.title}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{priority?.name ?? <span className="text-red-600">Unlinked</span>}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{FUNCTION_LABELS[o.businessFunction]}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={o.level === 'optimize' ? 'default' : o.level === 'transform' ? 'info' : 'purple'}>
                        {o.level}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium">{formatMoney(econ.riskAdjustedValue)}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-600">
                      {econ.paybackMonths === null ? '—' : `${econ.paybackMonths.toFixed(1)} mo`}
                    </td>
                    <td className="py-2.5">
                      {valueTestComplete(o) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-label="Complete" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" aria-label="Incomplete" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" padding="lg">
            <CardHeader
              title="The Business Value Test"
              subtitle={selected.title}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Remove opportunity"
                  onClick={() => {
                    dispatch({ type: 'REMOVE_OPPORTUNITY', payload: selected.id });
                    setSelectedId(opportunities.find((o) => o.id !== selected.id)?.id ?? '');
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              }
            />
            <OpportunityEditor opportunity={selected} onChange={updateOpportunity} />
          </Card>

          <div className="space-y-6">
            <EconomicsCard opportunity={selected} onChange={updateOpportunity} />
            <LinkedConstraint opportunity={selected} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Where to look" subtitle="Potential applications — not automatic recommendations" />
          <div className="space-y-2 text-sm">
            {(Object.keys(FUNCTION_EXAMPLES) as BusinessFunction[]).map((f) => (
              <div key={f} className="grid grid-cols-3 gap-3 py-1.5 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-800">{FUNCTION_LABELS[f]}</span>
                <span className="text-slate-600">{FUNCTION_EXAMPLES[f].opportunity}</span>
                <span className="text-slate-500">{FUNCTION_EXAMPLES[f].outcome}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Three levels of AI integration" />
          <div className="space-y-3 text-sm">
            {(Object.keys(LEVELS) as IntegrationLevel[]).map((l) => (
              <div key={l}>
                <p className="font-semibold text-slate-800">{LEVELS[l].label} — {LEVELS[l].purpose}</p>
                <p className="text-slate-500">Example: {LEVELS[l].example}. Measured by: {LEVELS[l].measure}.</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">{PHASES[1].exitCriteria.join(' · ')}</p>
        </Card>
      </div>
    </div>
  );
}

function OpportunityEditor({
  opportunity: o,
  onChange,
}: {
  opportunity: AIOpportunity;
  onChange: (o: AIOpportunity) => void;
}) {
  const { priorities } = useAlign();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField label="Opportunity" value={o.title} onChange={(title) => onChange({ ...o, title })} />
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Strategic priority</span>
          <select
            className={`${inputClass} mt-1`}
            value={o.priorityId}
            onChange={(e) => onChange({ ...o, priorityId: e.target.value })}
          >
            <option value="">— Not linked —</option>
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Business function</span>
          <select
            className={`${inputClass} mt-1`}
            value={o.businessFunction}
            onChange={(e) => onChange({ ...o, businessFunction: e.target.value as BusinessFunction })}
          >
            {(Object.keys(FUNCTION_LABELS) as BusinessFunction[]).map((f) => (
              <option key={f} value={f}>
                {FUNCTION_LABELS[f]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Integration level</span>
          <select
            className={`${inputClass} mt-1`}
            value={o.level}
            onChange={(e) => onChange({ ...o, level: e.target.value as IntegrationLevel })}
          >
            {(Object.keys(LEVELS) as IntegrationLevel[]).map((l) => (
              <option key={l} value={l}>
                {LEVELS[l].label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {VALUE_TEST_FIELDS.map(({ key, label }) => (
        <TextField
          key={key}
          label={label}
          multiline
          value={o.valueTest[key]}
          onChange={(v) => onChange({ ...o, valueTest: { ...o.valueTest, [key]: v } })}
        />
      ))}
    </div>
  );
}

function EconomicsCard({
  opportunity: o,
  onChange,
}: {
  opportunity: AIOpportunity;
  onChange: (o: AIOpportunity) => void;
}) {
  const econ = summarizeEconomics(o);
  const set = (key: keyof AIOpportunity['economics'], v: number) =>
    onChange({ ...o, economics: { ...o.economics, [key]: v } });

  return (
    <Card>
      <CardHeader title="Value hypothesis" subtitle="Risk-adjusted economics" />
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Annual value ($)" value={o.economics.annualValue} onChange={(v) => set('annualValue', v)} step={5000} />
        <NumberField
          label="Confidence (%)"
          value={Math.round(o.economics.confidence * 100)}
          onChange={(v) => set('confidence', Math.min(100, Math.max(0, v)) / 100)}
          step={5}
        />
        <NumberField label="One-time cost ($)" value={o.economics.oneTimeCost} onChange={(v) => set('oneTimeCost', v)} step={1000} />
        <NumberField label="Annual run cost ($)" value={o.economics.annualRunCost} onChange={(v) => set('annualRunCost', v)} step={1000} />
      </div>
      <dl className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Risk-adjusted value</dt>
          <dd className="font-semibold">{formatMoney(econ.riskAdjustedValue)}/yr</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Net of run cost</dt>
          <dd className={`font-semibold ${econ.netAnnualValue > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatMoney(econ.netAnnualValue)}/yr
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Year-1 cost</dt>
          <dd className="font-semibold">{formatMoney(econ.firstYearCost)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Payback</dt>
          <dd className="font-semibold">
            {econ.paybackMonths === null ? 'Never' : `${econ.paybackMonths.toFixed(1)} months`}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-slate-500 mt-3">
        Include the cost of human oversight, training, and data preparation — not just licences.
      </p>
    </Card>
  );
}

function LinkedConstraint({ opportunity }: { opportunity: AIOpportunity }) {
  const { priorities } = useAlign();
  const priority = priorities.find((p) => p.id === opportunity.priorityId);
  if (!priority) {
    return (
      <Callout tone="danger" title="No strategic priority">
        An opportunity that does not advance a strategic priority is a technology experiment, not a business
        investment. Link it or remove it.
      </Callout>
    );
  }
  const fit = constraintFit(priority);
  return (
    <Callout
      tone={fit.aiFit === 'ai-lever' ? 'success' : fit.aiFit === 'partial' ? 'warning' : 'danger'}
      title={`Constraint check · ${priority.name}`}
    >
      {priority.constraint} <span className="block mt-1 font-medium">{fit.guidance}</span>
    </Callout>
  );
}
