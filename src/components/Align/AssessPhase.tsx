import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type { ConstraintType, StrategicPriority } from '../../types/align';
import { CONSTRAINT_TYPES, PHASES } from '../../data/alignFramework';
import { constraintFit, priorityProgress } from '../../utils/alignScoring';
import { Callout, PhaseHeader, TextField } from './shared';
import { inputClass } from './helpers';

const FIT_DISPLAY = {
  'ai-lever': { label: 'AI lever', variant: 'success' as const, icon: CheckCircle2 },
  partial: { label: 'Fix process first', variant: 'warning' as const, icon: AlertTriangle },
  'non-ai': { label: 'Not an AI problem', variant: 'danger' as const, icon: XCircle },
};

export function AssessPhase() {
  const { priorities, opportunities, updatePriority, dispatch } = useAlign();
  const [editingId, setEditingId] = useState<string | null>(null);
  const phase = PHASES[0];

  const addPriority = () => {
    const p: StrategicPriority = {
      id: `p-${Date.now().toString(36)}`,
      name: 'New priority',
      objective: '',
      metricName: '',
      unit: '',
      baseline: 0,
      current: 0,
      target: 100,
      direction: 'increase',
      constraint: '',
      constraintType: 'strategy-clarity',
      executiveOwner: '',
    };
    dispatch({ type: 'ADD_PRIORITY', payload: p });
    setEditingId(p.id);
  };

  const nonAiCount = priorities.filter((p) => constraintFit(p).aiFit === 'non-ai').length;

  return (
    <div className="space-y-6">
      <PhaseHeader letter="A" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="lg">
          <CardHeader
            title="AI Strategic Alignment Map"
            subtitle="Strategic objective → current performance → gap → root constraint → is AI the right lever?"
            action={
              <Button size="sm" onClick={addPriority} icon={<Plus className="w-4 h-4" />}>
                Priority
              </Button>
            }
          />
          <div className="space-y-4">
            {priorities.map((p) => {
              const fit = constraintFit(p);
              const display = FIT_DISPLAY[fit.aiFit];
              const progress = priorityProgress(p);
              const linked = opportunities.filter((o) => o.priorityId === p.id).length;
              const editing = editingId === p.id;
              return (
                <div key={p.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900">{p.name}</h4>
                        <Badge variant={display.variant}>
                          <display.icon className="w-3 h-3 mr-1" />
                          {display.label}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {linked} AI {linked === 1 ? 'opportunity' : 'opportunities'} linked
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{p.objective}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(editing ? null : p.id)}>
                        {editing ? 'Done' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => dispatch({ type: 'REMOVE_PRIORITY', payload: p.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Baseline</p>
                      <p className="font-medium">{p.baseline} {p.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Current</p>
                      <p className="font-medium">{p.current} {p.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Target</p>
                      <p className="font-medium">{p.target} {p.unit}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar value={Math.max(0, progress)} size="sm" color={progress >= 60 ? 'green' : progress >= 25 ? 'amber' : 'red'} />
                    <span className="text-xs text-slate-500 whitespace-nowrap">{progress}% of gap closed</span>
                  </div>

                  <div className="mt-3 bg-slate-50 rounded-md p-3 text-sm">
                    <p className="text-slate-700">
                      <span className="font-semibold">Constraint:</span> {p.constraint || '—'}
                    </p>
                    <p className="text-slate-500 mt-1">
                      <span className="font-medium">{fit.label}.</span> {fit.guidance}
                    </p>
                  </div>

                  {editing && <PriorityEditor priority={p} onChange={updatePriority} />}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Executive questions" />
            <ol className="space-y-2 list-decimal list-inside text-sm text-slate-700">
              {phase.executiveQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </Card>

          <Callout tone={nonAiCount > 0 ? 'warning' : 'info'} title="Not every strategic problem requires AI">
            {nonAiCount > 0
              ? `${nonAiCount} of ${priorities.length} priorities are constrained by leadership, accountability, or strategy clarity. Address those directly — AI will not fix them, and may hide them.`
              : 'Some constraints require better leadership, clearer accountability, process redesign, or organizational change. Classify each constraint honestly before looking for AI opportunities.'}
          </Callout>

          <Card>
            <CardHeader title="Exit criteria" />
            <ul className="space-y-2 text-sm text-slate-700">
              {phase.exitCriteria.map((c) => (
                <li key={c} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PriorityEditor({
  priority: p,
  onChange,
}: {
  priority: StrategicPriority;
  onChange: (p: StrategicPriority) => void;
}) {
  const set = <K extends keyof StrategicPriority>(key: K, value: StrategicPriority[K]) =>
    onChange({ ...p, [key]: value });
  const num = (key: 'baseline' | 'current' | 'target') => (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{key}</span>
      <input
        type="number"
        className={`${inputClass} mt-1`}
        value={p[key]}
        onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
      />
    </label>
  );

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
      <TextField label="Priority" value={p.name} onChange={(v) => set('name', v)} />
      <TextField label="Executive owner" value={p.executiveOwner} onChange={(v) => set('executiveOwner', v)} />
      <TextField label="Business objective" value={p.objective} onChange={(v) => set('objective', v)} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Metric" value={p.metricName} onChange={(v) => set('metricName', v)} />
        <TextField label="Unit" value={p.unit} onChange={(v) => set('unit', v)} />
      </div>
      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        {num('baseline')}
        {num('current')}
        {num('target')}
      </div>
      <TextField label="What is preventing progress?" value={p.constraint} onChange={(v) => set('constraint', v)} multiline />
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Root constraint type</span>
        <select
          className={`${inputClass} mt-1`}
          value={p.constraintType}
          onChange={(e) => set('constraintType', e.target.value as ConstraintType)}
        >
          {(Object.keys(CONSTRAINT_TYPES) as ConstraintType[]).map((c) => (
            <option key={c} value={c}>
              {CONSTRAINT_TYPES[c].label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
