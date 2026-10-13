import { ArrowRight, RefreshCw, Compass } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type { AlignView, DecisionCategory, IntegrationLevel } from '../../types/align';
import {
  CENTRAL_QUESTION,
  CONTRAST_TABLE,
  CORE_PRINCIPLE,
  DECISION_CATEGORIES,
  LEVELS,
  PHASES,
  REASSESSMENT_TRIGGERS,
  VALUE_CHAIN,
} from '../../data/alignFramework';
import { decide, summarizeEconomics } from '../../utils/alignScoring';
import { formatMoney } from './helpers';

const PHASE_VIEWS: AlignView[] = ['assess', 'locate', 'identify', 'govern', 'navigate'];

export function AlignOverview({ onNavigate }: { onNavigate: (v: AlignView) => void }) {
  const { opportunities, priorities, companyName, lastReviewed } = useAlign();

  const decisions = opportunities.map((o) => ({ o, d: decide(o) }));
  const byCategory = (c: DecisionCategory) => decisions.filter((x) => x.d.category === c);
  const byLevel = (l: IntegrationLevel) => opportunities.filter((o) => o.level === l).length;
  const investValue = byCategory('invest-now').reduce(
    (sum, { o }) => sum + summarizeEconomics(o).riskAdjustedValue,
    0,
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white" padding="lg">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
              The ALIGN Framework™ · AI Business Integration
            </p>
            <h2 className="text-2xl font-bold mt-1">{CORE_PRINCIPLE}</h2>
            <p className="text-slate-300 mt-3">{CENTRAL_QUESTION}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-slate-400">Company</p>
            <p className="font-semibold">{companyName}</p>
            <p className="text-slate-400 mt-2">Last portfolio review</p>
            <p className="font-semibold">{lastReviewed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-6 flex-wrap text-sm">
          {VALUE_CHAIN.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg">{step}</span>
              {i < VALUE_CHAIN.length - 1 && <ArrowRight className="w-4 h-4 text-slate-400" />}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-4">
          The objective isn’t AI adoption. It is business performance improvement enabled by AI.
        </p>
      </Card>

      {/* Five executive decisions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {PHASES.map((phase, i) => (
          <button
            key={phase.letter}
            type="button"
            onClick={() => onNavigate(PHASE_VIEWS[i])}
            className="text-left bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-400 hover:shadow transition"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center">
                {phase.letter}
              </span>
              <span className="text-xs font-bold text-blue-600 tracking-wider">{phase.decision}</span>
            </div>
            <p className="font-semibold text-slate-900 mt-3">{phase.name}</p>
            <p className="text-sm text-slate-500 mt-1">{phase.question}</p>
            <p className="text-xs text-slate-400 mt-3">→ {phase.deliverable}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="AI Portfolio" subtitle="Executive Decision Matrix outcomes" />
          <div className="space-y-3">
            {(Object.keys(DECISION_CATEGORIES) as DecisionCategory[]).map((c) => (
              <div key={c} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{DECISION_CATEGORIES[c].label}</p>
                  <p className="text-xs text-slate-500">{DECISION_CATEGORIES[c].description}</p>
                </div>
                <span className="text-2xl font-bold text-slate-900">{byCategory(c).length}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
            {priorities.length} strategic priorities · {opportunities.length} opportunities ·{' '}
            <span className="font-semibold text-emerald-700">{formatMoney(investValue)}</span> risk-adjusted value
            ready to invest
          </div>
          <button
            type="button"
            onClick={() => onNavigate('decide')}
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Open the Decision Matrix →
          </button>
        </Card>

        <Card>
          <CardHeader title="Levels of AI Integration" subtitle="Operational value and strategic value" />
          <div className="space-y-3">
            {(Object.keys(LEVELS) as IntegrationLevel[]).map((l) => (
              <div key={l} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{LEVELS[l].label}</p>
                  <p className="text-xs text-slate-500">
                    {LEVELS[l].purpose} — e.g. {LEVELS[l].example.toLowerCase()}
                  </p>
                </div>
                <span className="text-xl font-bold text-slate-900">{byLevel(l)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Levels are not sequential. A healthy portfolio usually funds several Optimize moves while
            deliberately exploring at least one Transform or Reinvent bet.
          </p>
        </Card>

        <Card>
          <CardHeader title="A Cyclical Discipline" subtitle="Reassess when these events occur" />
          <ul className="space-y-2">
            {REASSESSMENT_TRIGGERS.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-slate-700">
                <RefreshCw className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Why ALIGN is different"
          subtitle="Complementary to risk frameworks such as the NIST AI RMF — ALIGN connects AI to strategy, performance, and investment decisions"
          action={<Compass className="w-5 h-5 text-slate-400" />}
        />
        <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-lg overflow-hidden text-sm">
          <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-500">Traditional AI adoption</div>
          <div className="bg-slate-50 px-4 py-2 font-semibold text-blue-700">ALIGN strategic approach</div>
          {CONTRAST_TABLE.map(([from, to]) => (
            <div key={from} className="contents">
              <div className="bg-white px-4 py-2.5 text-slate-500">{from}</div>
              <div className="bg-white px-4 py-2.5 text-slate-900 font-medium">{to}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
