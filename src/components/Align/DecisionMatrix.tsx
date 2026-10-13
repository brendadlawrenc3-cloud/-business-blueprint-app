import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { Card, CardHeader, Badge, Button } from '../ui';
import { useAlign } from '../../context/AlignContext';
import { useCEO } from '../../context/CEOContext';
import type { AIOpportunity, DecisionCategory, MatrixCriterion } from '../../types/align';
import type { Decision } from '../../types';
import { DECISION_CATEGORIES, MATRIX_CRITERIA } from '../../data/alignFramework';
import { assessReadiness, decide, evaluateGates, summarizeEconomics } from '../../utils/alignScoring';
import { DecisionBadge, ReadinessBadge, ScoreSelect } from './shared';
import { formatMoney } from './helpers';

const CATEGORY_ORDER: DecisionCategory[] = ['invest-now', 'build-readiness', 'pilot-validate', 'do-not-pursue'];

const CATEGORY_PRIORITY: Record<DecisionCategory, Decision['priority']> = {
  'invest-now': 'high',
  'build-readiness': 'medium',
  'pilot-validate': 'medium',
  'do-not-pursue': 'low',
};

export function DecisionMatrix() {
  const { opportunities, priorities, updateOpportunity, dispatch } = useAlign();
  const { addDecision, decisions } = useCEO();
  const [sent, setSent] = useState<Set<string>>(new Set());

  const rows = opportunities
    .map((o) => ({ o, d: decide(o) }))
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.d.category) - CATEGORY_ORDER.indexOf(b.d.category) || b.d.score - a.d.score,
    );

  const sendToDecisionFlow = (o: AIOpportunity) => {
    const d = decide(o);
    const priority = priorities.find((p) => p.id === o.priorityId);
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + 14);
    addDecision({
      id: `align-${o.id}-${now.getTime()}`,
      title: `AI: ${DECISION_CATEGORIES[d.category].label} — ${o.title}`,
      description: d.nextAction,
      owner: o.design.processOwner || priority?.executiveOwner || 'CEO',
      deadline: deadline.toISOString().split('T')[0],
      priority: CATEGORY_PRIORITY[d.category],
      status: 'pending',
      category: 'strategic',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      context: `ALIGN weighted score ${d.score}/100. Strategic priority: ${priority?.name ?? 'unlinked'}. ${d.reasons.join('. ')}.`,
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
            <p className="text-3xl font-bold text-slate-900 mt-2">{rows.filter((r) => r.d.category === c).length}</p>
            <p className="text-xs text-slate-500">{DECISION_CATEGORIES[c].description}</p>
          </Card>
        ))}
      </div>

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
          {rows.map(({ o, d }) => {
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
                    <DecisionBadge category={d.category} />
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
          <li>Strategic alignment + business value average below 2.5, or risk-adjusted value below run cost → Do Not Pursue.</li>
          <li>Outcome undefined (strategic clarity ≤ 2) → Defer / redesign.</li>
          <li>High value (≥ 3.5) but readiness below threshold or a critical deficiency → Build Readiness.</li>
          <li>Risk gates not yet assessed → no pilot until they are.</li>
          <li>High value, Ready to Pilot, confidence ≥ 60%, score ≥ 70 → Invest Now.</li>
          <li>Everything else with promise → Pilot &amp; Validate cheaply before committing.</li>
        </ol>
      </Card>
    </div>
  );
}
