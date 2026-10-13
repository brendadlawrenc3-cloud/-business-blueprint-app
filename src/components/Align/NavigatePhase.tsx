import { useState } from 'react';
import { Plus, Trash2, Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type { AIOpportunity, PerformanceCategory, PerformanceMeasure } from '../../types/align';
import { PERFORMANCE_CATEGORIES, PHASES } from '../../data/alignFramework';
import { measureProgress, pilotVerdict, realizationStatus, type PilotVerdict } from '../../utils/alignScoring';
import { Callout, OpportunityPicker, PhaseHeader, TextField } from './shared';
import { inputClass } from './helpers';

const VERDICTS: Record<PilotVerdict, { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; text: string }> = {
  scale: { label: 'Scale', variant: 'success', text: 'Targets largely met and efficiency linked to outcomes. Expand deliberately.' },
  iterate: { label: 'Iterate', variant: 'warning', text: 'Partial progress. Adjust the design and re-measure before scaling.' },
  stop: { label: 'Stop', variant: 'danger', text: 'Little movement against baseline. Apply the stop criteria and redeploy the investment.' },
  'too-early': { label: 'Too early', variant: 'default', text: 'No actuals yet. Record results against the baseline.' },
};

export function NavigatePhase() {
  const { opportunities, updateOpportunity } = useAlign();
  const tracked = opportunities.filter((o) => o.stage === 'piloting' || o.stage === 'scaling' || o.measures.length > 0);
  const list = tracked.length > 0 ? tracked : opportunities;
  const [selectedId, setSelectedId] = useState(list[0]?.id ?? '');
  const selected = list.find((o) => o.id === selectedId) ?? list[0];

  return (
    <div className="space-y-6">
      <PhaseHeader letter="N" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card padding="sm">
          <p className="px-2 pt-2 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {tracked.length > 0 ? 'Pilots & scaled initiatives' : 'Opportunities'}
          </p>
          <OpportunityPicker
            opportunities={list}
            selectedId={selected?.id ?? ''}
            onSelect={setSelectedId}
            renderMeta={(o) => {
              const v = VERDICTS[pilotVerdict(o)];
              return <Badge variant={v.variant}>{v.label}</Badge>;
            }}
          />
        </Card>

        {selected && (
          <div className="lg:col-span-3 space-y-6">
            <Scorecard opportunity={selected} onChange={updateOpportunity} />
            <Realization opportunity={selected} onChange={updateOpportunity} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader title="Questions for the quarterly AI performance review" />
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm list-decimal list-inside text-slate-700">
          {PHASES[4].executiveQuestions.map((q) => (
            <li key={q} className="bg-slate-50 rounded-lg p-3">{q}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Scorecard({ opportunity: o, onChange }: { opportunity: AIOpportunity; onChange: (o: AIOpportunity) => void }) {
  const verdict = VERDICTS[pilotVerdict(o)];

  const updateMeasure = (m: PerformanceMeasure) =>
    onChange({ ...o, measures: o.measures.map((x) => (x.id === m.id ? m : x)) });

  const addMeasure = () =>
    onChange({
      ...o,
      measures: [
        ...o.measures,
        { id: `m-${Date.now().toString(36)}`, category: 'financial', name: 'New measure', unit: '', baseline: 0, target: 100, actual: null },
      ],
    });

  return (
    <Card padding="lg">
      <CardHeader
        title="AI Business Performance Scorecard"
        subtitle={o.title}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={verdict.variant} size="md">Verdict: {verdict.label}</Badge>
            <Button size="sm" variant="secondary" onClick={addMeasure} icon={<Plus className="w-4 h-4" />}>
              Measure
            </Button>
          </div>
        }
      />
      <p className="text-sm text-slate-600 mb-4">{verdict.text}</p>

      {o.measures.length === 0 ? (
        <p className="text-sm text-slate-500">
          No measures yet. Add at least one per category that matters — and record the baseline before the pilot starts.
        </p>
      ) : (
        <div className="space-y-3">
          {o.measures.map((m) => {
            const progress = measureProgress(m);
            return (
              <div key={m.id} className="grid grid-cols-12 gap-2 items-center border-b border-slate-100 pb-3">
                <select
                  aria-label="Category"
                  className={`${inputClass} col-span-2 !px-2`}
                  value={m.category}
                  onChange={(e) => updateMeasure({ ...m, category: e.target.value as PerformanceCategory })}
                >
                  {(Object.keys(PERFORMANCE_CATEGORIES) as PerformanceCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {PERFORMANCE_CATEGORIES[c].label}
                    </option>
                  ))}
                </select>
                <input aria-label="Measure" className={`${inputClass} col-span-3`} value={m.name} onChange={(e) => updateMeasure({ ...m, name: e.target.value })} />
                <input aria-label="Baseline" type="number" className={`${inputClass} col-span-1 !px-2`} value={m.baseline} onChange={(e) => updateMeasure({ ...m, baseline: parseFloat(e.target.value) || 0 })} />
                <input aria-label="Target" type="number" className={`${inputClass} col-span-1 !px-2`} value={m.target} onChange={(e) => updateMeasure({ ...m, target: parseFloat(e.target.value) || 0 })} />
                <input
                  aria-label="Actual"
                  type="number"
                  placeholder="—"
                  className={`${inputClass} col-span-1 !px-2`}
                  value={m.actual ?? ''}
                  onChange={(e) => updateMeasure({ ...m, actual: e.target.value === '' ? null : parseFloat(e.target.value) })}
                />
                <span className="col-span-1 text-xs text-slate-500">{m.unit}</span>
                <div className="col-span-2">
                  {progress === null ? (
                    <span className="text-xs text-slate-400">No actual</span>
                  ) : (
                    <>
                      <ProgressBar value={Math.max(0, progress)} size="sm" color={progress >= 80 ? 'green' : progress >= 25 ? 'amber' : 'red'} />
                      <span className="text-xs text-slate-500">{progress}% of target gap</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${m.name}`}
                  className="col-span-1 justify-self-end text-slate-400 hover:text-red-600"
                  onClick={() => onChange({ ...o, measures: o.measures.filter((x) => x.id !== m.id) })}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          <p className="text-xs text-slate-400">Columns: category · measure · baseline · target · actual · unit · progress</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {(Object.keys(PERFORMANCE_CATEGORIES) as PerformanceCategory[]).map((c) => {
          const count = o.measures.filter((m) => m.category === c).length;
          return (
            <div key={c} className={`rounded-lg p-3 ${count ? 'bg-slate-50' : 'bg-amber-50'}`}>
              <p className="text-sm font-semibold text-slate-800">{PERFORMANCE_CATEGORIES[c].label}</p>
              <p className="text-xs text-slate-500">{PERFORMANCE_CATEGORIES[c].examples}</p>
              <p className="text-xs mt-1 font-medium">{count ? `${count} measure${count > 1 ? 's' : ''}` : 'Not measured'}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Realization({ opportunity: o, onChange }: { opportunity: AIOpportunity; onChange: (o: AIOpportunity) => void }) {
  const status = realizationStatus(o);
  const r = o.realization;
  const set = (patch: Partial<AIOpportunity['realization']>) => onChange({ ...o, realization: { ...r, ...patch } });

  return (
    <Card padding="lg">
      <CardHeader title="Value realization chain" subtitle="Time saved is not automatically value created" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-center">
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Hours freed / month
          </span>
          <input
            type="number"
            className={`${inputClass} mt-1`}
            value={r.hoursFreedPerMonth}
            onChange={(e) => set({ hoursFreedPerMonth: parseFloat(e.target.value) || 0 })}
          />
        </label>
        <ArrowRight className="hidden md:block w-5 h-5 text-slate-400 mt-5" />
        <TextField label="Redeployed to" value={r.redeployedTo} onChange={(v) => set({ redeployedTo: v })} placeholder="e.g. client development" />
        <ArrowRight className="hidden md:block w-5 h-5 text-slate-400 mt-5" />
        <TextField label="Business outcome moved" value={r.linkedOutcome} onChange={(v) => set({ linkedOutcome: v })} placeholder="e.g. pipeline +$400K" />
      </div>
      <div className="mt-4">
        {status === 'unlinked' && (
          <Callout tone="warning" title="Unrealized efficiency">
            {r.hoursFreedPerMonth} hours a month are being saved, but nothing shows where they went. Were they
            redirected to revenue-generating work? Did delivery capacity increase? Did costs decline? Until this is
            answered, report it as activity — not value.
          </Callout>
        )}
        {status === 'realized' && (
          <Callout tone="success" title="Efficiency connected to an outcome">
            {r.hoursFreedPerMonth} hours/month → {r.redeployedTo} → {r.linkedOutcome}.
          </Callout>
        )}
        {status === 'not-applicable' && (
          <p className="text-sm text-slate-500">Record freed capacity here if this initiative saves time.</p>
        )}
      </div>
    </Card>
  );
}
