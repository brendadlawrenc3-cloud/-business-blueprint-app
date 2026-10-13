import { Plus, Trash2, Lightbulb, RotateCcw } from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type { DecisionThresholds, IPCheck, RevenueBand, ValidationSession } from '../../types/align';
import { DEFAULT_THRESHOLDS, FOLLOW_UP_LABELS, IP_CHECKS, REVENUE_BANDS } from '../../data/alignFramework';
import { calibrationInsight, decide } from '../../utils/alignScoring';
import { Callout } from './shared';
import { inputClass } from './helpers';

const OFFERS = [
  { name: 'AI Strategic Alignment Assessment', scope: 'Diagnostic · 2–3 weeks', phases: 'A, L, I + Decision Matrix', output: 'Alignment Map, Opportunity Map, Readiness Assessment, prioritized decisions' },
  { name: 'AI Business Integration Workshop', scope: 'Half or full day · leadership team or CEO peer group', phases: 'A → Decision Matrix (Essentials)', output: 'Three prioritized opportunities, initial readiness, one proposed pilot' },
  { name: 'AI Business Integration Advisory', scope: '6–12 months', phases: 'Full cycle A → N, Operating Model', output: 'Governed pilots, scorecards, quarterly portfolio reviews' },
];

const pct = (n: number | null) => (n === null ? '—' : `${Math.round(n * 100)}%`);

export function AdvisorTab() {
  const state = useAlign();
  const { validation, thresholds, ipChecks, patch, opportunities } = state;
  const insight = calibrationInsight(state);
  const ipDone = Object.values(ipChecks).filter(Boolean).length;
  const ipTotal = Object.values(ipChecks).length;

  const updateSession = (v: ValidationSession) => patch({ validation: validation.map((x) => (x.id === v.id ? v : x)) });
  const addSession = () =>
    patch({
      validation: [
        ...validation,
        {
          id: `v-${Date.now().toString(36)}`,
          date: new Date().toISOString().split('T')[0],
          ceo: '',
          industry: '',
          revenueBand: 'under-10m',
          minutesToComplete: 0,
          topPickMatchedGut: false,
          overrides: 0,
          opportunitiesScored: 0,
          confusingQuestions: '',
          followUp90: 'pending',
          notes: '',
        },
      ],
    });

  // Live preview: how would the current portfolio change under these thresholds?
  const changed = opportunities.filter((o) => decide(o, thresholds).category !== decide(o, DEFAULT_THRESHOLDS).category).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white" padding="lg">
        <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Advisor workspace</p>
        <h2 className="text-2xl font-bold mt-1">Validate, calibrate, and protect the methodology</h2>
        <p className="text-slate-300 mt-2 max-w-3xl">
          Validate ALIGN against real CEO decisions before you formalize the name or weights. Each session shows
          where the rules match executive judgment and where they need tuning.
        </p>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Validation sessions" value={`${insight.sessions} / 5–8`} />
        <Stat label="Top pick matched CEO gut" value={pct(insight.gutMatchRate)} />
        <Stat label="Recommendations overridden" value={pct(insight.overrideRate)} />
        <Stat label="Avg time to complete" value={insight.avgMinutes === null ? '—' : `${Math.round(insight.avgMinutes)} min`} />
        <Stat label="90-day predictions held" value={pct(insight.followUpAccuracy)} />
      </div>

      {insight.suggestions.length > 0 && (
        <Callout tone="info" title="Calibration suggestions">
          <ul className="space-y-1">
            {insight.suggestions.map((s) => (
              <li key={s} className="flex gap-1.5"><Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />{s}</li>
            ))}
          </ul>
          <p className="text-xs mt-2">
            Overrides in this workspace: {insight.upgrades} upgraded, {insight.downgrades} downgraded vs. the framework's recommendation.
          </p>
        </Callout>
      )}

      <Card padding="lg">
        <CardHeader
          title="CEO validation log"
          subtitle="One row per CEO session. Follow up at 90 days: did the recommendations hold?"
          action={<Button size="sm" onClick={addSession} icon={<Plus className="w-4 h-4" />}>Session</Button>}
        />
        <div className="space-y-4">
          {validation.map((v) => (
            <div key={v.id} className="border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Field label="Date"><input type="date" className={inputClass} value={v.date} onChange={(e) => updateSession({ ...v, date: e.target.value })} /></Field>
                <div className="col-span-2"><Field label="CEO / company"><input className={inputClass} value={v.ceo} onChange={(e) => updateSession({ ...v, ceo: e.target.value })} /></Field></div>
                <Field label="Industry"><input className={inputClass} value={v.industry} onChange={(e) => updateSession({ ...v, industry: e.target.value })} /></Field>
                <Field label="Revenue">
                  <select className={inputClass} value={v.revenueBand} onChange={(e) => updateSession({ ...v, revenueBand: e.target.value as RevenueBand })}>
                    {(Object.keys(REVENUE_BANDS) as RevenueBand[]).map((b) => <option key={b} value={b}>{REVENUE_BANDS[b].label}</option>)}
                  </select>
                </Field>
                <Field label="Minutes"><input type="number" className={inputClass} value={v.minutesToComplete} onChange={(e) => updateSession({ ...v, minutesToComplete: parseInt(e.target.value, 10) || 0 })} /></Field>
                <Field label="Opps scored"><input type="number" className={inputClass} value={v.opportunitiesScored} onChange={(e) => updateSession({ ...v, opportunitiesScored: parseInt(e.target.value, 10) || 0 })} /></Field>
                <Field label="Overrides"><input type="number" className={inputClass} value={v.overrides} onChange={(e) => updateSession({ ...v, overrides: parseInt(e.target.value, 10) || 0 })} /></Field>
                <Field label="Top pick = gut?">
                  <select className={inputClass} value={v.topPickMatchedGut ? 'yes' : 'no'} onChange={(e) => updateSession({ ...v, topPickMatchedGut: e.target.value === 'yes' })}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <div className="col-span-2">
                  <Field label="90-day follow-up">
                    <select className={inputClass} value={v.followUp90} onChange={(e) => updateSession({ ...v, followUp90: e.target.value as ValidationSession['followUp90'] })}>
                      {(Object.keys(FOLLOW_UP_LABELS) as ValidationSession['followUp90'][]).map((f) => <option key={f} value={f}>{FOLLOW_UP_LABELS[f]}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="text-right self-end">
                  <button type="button" aria-label="Remove session" className="text-slate-400 hover:text-red-600" onClick={() => patch({ validation: validation.filter((x) => x.id !== v.id) })}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="col-span-2 md:col-span-3"><Field label="Confusing questions"><input className={inputClass} value={v.confusingQuestions} onChange={(e) => updateSession({ ...v, confusingQuestions: e.target.value })} /></Field></div>
                <div className="col-span-2 md:col-span-3"><Field label="Notes"><input className={inputClass} value={v.notes} onChange={(e) => updateSession({ ...v, notes: e.target.value })} /></Field></div>
              </div>
            </div>
          ))}
          {validation.length === 0 && <p className="text-sm text-slate-500">No sessions yet. Aim for 5–8 CEOs across 2–3 industries and revenue bands.</p>}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThresholdEditor thresholds={thresholds} onChange={(t) => patch({ thresholds: t })} changed={changed} />

        <Card padding="lg">
          <CardHeader title="IP readiness" subtitle="Protect the method before you market it" action={<Badge variant={ipDone === ipTotal ? 'success' : 'warning'}>{ipDone}/{ipTotal}</Badge>} />
          <ProgressBar value={ipDone} max={ipTotal} size="sm" color={ipDone === ipTotal ? 'green' : 'amber'} />
          <ul className="mt-4 space-y-3">
            {(Object.keys(IP_CHECKS) as IPCheck[]).map((k) => (
              <li key={k}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-0.5" checked={ipChecks[k]} onChange={(e) => patch({ ipChecks: { ...ipChecks, [k]: e.target.checked } })} />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{IP_CHECKS[k].label}</span>
                    <span className="block text-xs text-slate-500">{IP_CHECKS[k].detail}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader title="Advisory offers" subtitle="One methodology, three ways to buy it" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OFFERS.map((o) => (
            <div key={o.name} className="border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-900">{o.name}</p>
              <p className="text-xs text-blue-700 mt-1">{o.scope}</p>
              <p className="text-sm text-slate-600 mt-2"><span className="font-medium">Covers:</span> {o.phases}</p>
              <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Leaves with:</span> {o.output}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ThresholdEditor({
  thresholds: t,
  onChange,
  changed,
}: {
  thresholds: DecisionThresholds;
  onChange: (t: DecisionThresholds) => void;
  changed: number;
}) {
  const rows: { key: keyof DecisionThresholds; label: string; help: string; step: number; min: number; max: number; scale?: number }[] = [
    { key: 'highValue', label: '"High value" threshold', help: 'Avg of strategic alignment + business value (1–5)', step: 0.25, min: 2, max: 5 },
    { key: 'investScore', label: 'Invest Now score', help: 'Minimum weighted score (0–100)', step: 5, min: 40, max: 95 },
    { key: 'minConfidence', label: 'Invest Now confidence', help: 'Minimum confidence in the value hypothesis (%)', step: 5, min: 20, max: 95, scale: 100 },
    { key: 'doNotPursueValue', label: 'Do Not Pursue below', help: 'Avg alignment + value under this is closed (1–5)', step: 0.25, min: 1, max: 4 },
  ];

  return (
    <Card padding="lg">
      <CardHeader
        title="Decision thresholds"
        subtitle="Calibrate from validation evidence, not instinct"
        action={
          <Button size="sm" variant="ghost" onClick={() => onChange(DEFAULT_THRESHOLDS)} icon={<RotateCcw className="w-4 h-4" />}>
            Defaults
          </Button>
        }
      />
      <div className="space-y-4">
        {rows.map((r) => {
          const scale = r.scale ?? 1;
          const value = t[r.key] * scale;
          const def = DEFAULT_THRESHOLDS[r.key] * scale;
          return (
            <div key={r.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.help} · default {def}</p>
                </div>
                <span className="text-lg font-bold text-slate-900 w-14 text-right">{Math.round(value * 100) / 100}</span>
              </div>
              <input
                type="range"
                aria-label={r.label}
                className="w-full mt-1"
                min={r.min}
                max={r.max}
                step={r.step}
                value={value}
                onChange={(e) => onChange({ ...t, [r.key]: parseFloat(e.target.value) / scale })}
              />
            </div>
          );
        })}
      </div>
      <p className={`text-sm mt-4 ${changed ? 'text-amber-700' : 'text-slate-500'}`}>
        {changed
          ? `${changed} opportunit${changed === 1 ? 'y changes' : 'ies change'} category under these thresholds vs. the defaults.`
          : 'No opportunity changes category vs. the defaults.'}
      </p>
    </Card>
  );
}
