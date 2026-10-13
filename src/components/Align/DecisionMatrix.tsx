import { useState } from 'react';
import { Send, Check, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, Badge, Button } from '../ui';
import { useAlign } from '../../context/AlignContext';
import { useCEO } from '../../context/CEOContext';
import type { AIOpportunity, DecisionCategory, MatrixCriterion } from '../../types/align';
import type { Decision } from '../../types';
import { DECISION_CATEGORIES, MATRIX_CRITERIA } from '../../data/alignFramework';
import { assessReadiness, capacityStatus, decide, evaluateGates, finalCategory, summarizeEconomics } from '../../utils/alignScoring';
import { Callout, DecisionBadge, ReadinessBadge, ScoreSelect } from './shared';
import { formatMoney, inputClass } from './helpers';

const CATEGORY_ORDER: DecisionCategory[] = ['invest-now', 'build-readiness', 'pilot-validate', 'do-not-pursue'];

const CATEGORY_PRIORITY: Record<DecisionCategory, Decision['priority']> = {
  'invest-now': 'high',
  'build-readiness': 'medium',
  'pilot-validate': 'medium',
  'do-not-pursue': 'low',
};

export function DecisionMatrix() {
  const state = useAlign();
  const { opportunities, priorities, updateOpportunity, dispatch, thresholds: t } = state;
  const { addDecision, decisions } = useCEO();
  const [sent, setSent] = useState<Set<string>>(new Set());
  const capacity = capacityStatus(state);

  const rows = opportunities
    .map((o) => {
      const d = decide(o, t);
      return { o, d, final: finalCategory(o, t) };
    })
    .sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.final) - CATEGORY_ORDER.indexOf(b.final) || b.d.score - a.d.score,
    );

  const sendToDecisionFlow = (o: AIOpportunity) => {
    const d = decide(o, t);
    const category = finalCategory(o, t);
    const overrideNote = o.override
      ? ` Leadership override from ${DECISION_CATEGORIES[d.category].label}: ${o.override.reason}.`
      : '';
    const priority = priorities.find((p) => p.id === o.priorityId);
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + 14);
    addDecision({
      id: `align-${o.id}-${now.getTime()}`,
      title: `AI: ${DECISION_CATEGORIES[category].label} — ${o.title}`,
      description: d.nextAction,
      owner: o.design.processOwner || priority?.executiveOwner || 'CEO',
      deadline: deadline.toISOString().split('T')[0],
      priority: CATEGORY_PRIORITY[category],
      status: 'pending',
      category: 'strategic',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      context: `ALIGN weighted score ${d.score}/100. Strategic priority: ${priority?.name ?? 'unlinked'}. ${d.reasons.join('. ')}.${overrideNote}`,
    });
    setSent((s) => new Set(s).add(o.id));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white" padding="lg">
        <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">ALIGN Executive Decision Matrix</p>
        <h2 className="text-2xl font-bold mt-1">Evaluate competing AI opportunities</h2>
        <p className="text-slate-300 mt-2 max-w-3xl">
          Weighted criteria prioritize. Risk gates and critical readiness deficiencies decide — they are mandatory
          gates, never traded off against value.
        </p>
        <div className="flex flex-wrap gap-2 mt-4 text-sm">
          {(Object.keys(MATRIX_CRITERIA) as MatrixCriterion[]).map((k) => (
            <span key={k} className="bg-white/10 px-3 py-1.5 rounded-lg">
              {MATRIX_CRITERIA[k].label} · {Math.round(MATRIX_CRITERIA[k].weight * 100)}%
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORY_ORDER.map((c) => (
          <Card key={c} padding="sm">
            <DecisionBadge category={c} />
            <p className="text-3xl font-bold text-slate-900 mt-2">{rows.filter((r) => r.final === c).length}</p>
            <p className="text-xs text-slate-500">{DECISION_CATEGORIES[c].description}</p>
          </Card>
        ))}
      </div>

      {capacity.overCapacity && (
        <Callout tone="danger" title={`Over change capacity: ${capacity.active + capacity.queued} pilots for a limit of ${capacity.limit}`}>
          {capacity.active} running and {capacity.queued} approved (Invest Now) but not started. Sequence them: start the
          highest-scoring ones first and queue the rest, or raise the limit deliberately on Assess → Company profile.
        </Callout>
      )}

      <Card padding="lg">
        <CardHeader
          title="Scoring"
          subtitle="Score each criterion 1–5 · ranked by decision, then weighted score"
          action={
            <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'MARK_REVIEWED' })}>
              Mark portfolio reviewed
            </Button>
          }
        />
        <div className="divide-y divide-slate-100">
          {rows.map(({ o, d, final }) => {
            const gates = evaluateGates(o);
            const econ = summarizeEconomics(o);
            const alreadySent = sent.has(o.id) || decisions.some((x) => x.id.startsWith(`align-${o.id}-`));
            return (
              <div key={o.id} className="py-5 grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-3">
                  <p className="font-medium text-slate-900">{o.title}</p>
                  <p className="text-xs text-slate-500">
                    {priorities.find((p) => p.id === o.priorityId)?.name ?? 'Unlinked'} · {o.level} ·{' '}
                    {formatMoney(econ.riskAdjustedValue)}/yr risk-adj.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant={gates === 'blocked' ? 'danger' : gates === 'incomplete' ? 'default' : gates === 'cleared' ? 'success' : 'warning'}>
                      {gates === 'blocked' ? 'Gate failed' : gates === 'incomplete' ? 'Gates open' : gates === 'cleared' ? 'Gates pass' : 'Gates conditional'}
                    </Badge>
                    <ReadinessBadge classification={assessReadiness(o).classification} />
                  </div>
                </div>

                <div className="xl:col-span-5 space-y-1.5">
                  {(Object.keys(MATRIX_CRITERIA) as MatrixCriterion[]).map((k) => (
                    <div key={k} className="flex items-center justify-between gap-3" title={MATRIX_CRITERIA[k].guide}>
                      <span className="text-xs text-slate-600">
                        {MATRIX_CRITERIA[k].label} <span className="text-slate-400">{Math.round(MATRIX_CRITERIA[k].weight * 100)}%</span>
                      </span>
                      <ScoreSelect
                        label={`${o.title}: ${MATRIX_CRITERIA[k].label}`}
                        value={o.matrix[k]}
                        onChange={(s) => updateOpportunity({ ...o, matrix: { ...o.matrix, [k]: s } })}
                      />
                    </div>
                  ))}
                </div>

                <div className="xl:col-span-4 flex gap-4">
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-bold text-slate-900">{d.score}</p>
                    <p className="text-xs text-slate-400">/ 100</p>
                  </div>
                  <div>
                    <DecisionBadge category={final} />
                    {o.override && (
                      <p className="text-xs text-purple-700 mt-1 flex gap-1">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        Leadership override (framework said {DECISION_CATEGORIES[d.category].label}): {o.override.reason}
                      </p>
                    )}
                    <ul className="text-xs text-slate-600 mt-1 space-y-0.5">
                      {d.reasons.slice(0, 3).map((r) => (
                        <li key={r}>• {r}</li>
                      ))}
                    </ul>
                    <p className="text-xs font-medium text-slate-800 mt-1">Next: {d.nextAction}</p>
                    <button
                      type="button"
                      disabled={alreadySent}
                      onClick={() => sendToDecisionFlow(o)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-emerald-600"
                    >
                      {alreadySent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      {alreadySent ? 'In Decision Flow' : 'Send to Decision Flow'}
                    </button>
                    <OverrideControl opportunity={o} systemCategory={d.category} onChange={updateOpportunity} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Decision rules" subtitle="Applied in this order — transparent so leadership can challenge them" />
        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1.5">
          <li>Any risk gate <strong>fails</strong> → Do Not Pursue (redesign or close).</li>
          <li>Strategic alignment + business value average below {t.doNotPursueValue}, or risk-adjusted value below run cost → Do Not Pursue.</li>
          <li>Outcome undefined (strategic clarity ≤ 2) → Defer / redesign.</li>
          <li>High value (≥ {t.highValue}) but readiness below threshold or a critical deficiency → Build Readiness.</li>
          <li>Risk gates not yet assessed → no pilot until they are.</li>
          <li>High value, Ready to Pilot, confidence ≥ {Math.round(t.minConfidence * 100)}%, score ≥ {t.investScore} → Invest Now.</li>
          <li>Everything else with promise → Pilot &amp; Validate cheaply before committing.</li>
          <li>Leadership may override any recommendation, with a written reason. Overrides feed calibration on the Advisor tab.</li>
          <li>Invest Now approvals plus running pilots must fit the change-capacity limit ({capacity.limit}).</li>
        </ol>
      </Card>
    </div>
  );
}

function OverrideControl({
  opportunity: o,
  systemCategory,
  onChange,
}: {
  opportunity: AIOpportunity;
  systemCategory: DecisionCategory;
  onChange: (o: AIOpportunity) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DecisionCategory>(o.override?.category ?? systemCategory);
  const [reason, setReason] = useState(o.override?.reason ?? '');
  const blockedByGate = evaluateGates(o) === 'blocked';

  if (!open) {
    return (
      <div className="mt-1 flex gap-3">
        <button type="button" className="text-xs text-slate-500 hover:text-slate-800" onClick={() => setOpen(true)}>
          {o.override ? 'Edit override' : 'Override…'}
        </button>
        {o.override && (
          <button type="button" className="text-xs text-slate-500 hover:text-red-600" onClick={() => onChange({ ...o, override: null })}>
            Remove override
          </button>
        )}
      </div>
    );
  }

  const upgradingPastGate = blockedByGate && category !== 'do-not-pursue';
  return (
    <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-2">
      <select aria-label="Override category" className={`${inputClass} !py-1.5`} value={category} onChange={(e) => setCategory(e.target.value as DecisionCategory)}>
        {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{DECISION_CATEGORIES[c].label}</option>)}
      </select>
      <input aria-label="Override reason" className={`${inputClass} !py-1.5`} placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
      {upgradingPastGate && (
        <p className="text-xs text-red-700 flex gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />A risk gate failed. Risk gates cannot be overridden; fix the risk first.</p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!reason.trim() || category === systemCategory || upgradingPastGate}
          onClick={() => {
            onChange({ ...o, override: { category, reason: reason.trim(), date: new Date().toISOString().split('T')[0] } });
            setOpen(false);
          }}
        >
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
