import { useState } from 'react';
import { AlertOctagon, Info } from 'lucide-react';
import { Card, CardHeader, Badge } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type { ReadinessClass, ReadinessDimension } from '../../types/align';
import { READINESS_CLASSES, READINESS_DIMENSIONS } from '../../data/alignFramework';
import { assessReadiness } from '../../utils/alignScoring';
import { Callout, OpportunityPicker, PhaseHeader, ReadinessBadge, ScoreSelect } from './shared';

export function IdentifyPhase() {
  const { opportunities, updateOpportunity } = useAlign();
  const [selectedId, setSelectedId] = useState(opportunities[0]?.id ?? '');
  const selected = opportunities.find((o) => o.id === selectedId) ?? opportunities[0];
  const result = selected ? assessReadiness(selected) : null;

  return (
    <div className="space-y-6">
      <PhaseHeader letter="I" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="sm">
          <p className="px-2 pt-2 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Opportunities</p>
          <OpportunityPicker
            opportunities={opportunities}
            selectedId={selected?.id ?? ''}
            onSelect={setSelectedId}
            renderMeta={(o) => <ReadinessBadge classification={assessReadiness(o).classification} />}
          />
        </Card>

        {selected && result && (
          <Card className="lg:col-span-2" padding="lg">
            <CardHeader
              title="AI Integration Readiness Assessment"
              subtitle={selected.title}
              action={<ReadinessBadge classification={result.classification} />}
            />

            <div className="space-y-4">
              {(Object.keys(READINESS_DIMENSIONS) as ReadinessDimension[]).map((dim) => {
                const def = READINESS_DIMENSIONS[dim];
                const score = selected.readiness[dim];
                return (
                  <div key={dim} className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{def.label}</p>
                        {def.critical && <Badge variant="danger">Critical</Badge>}
                      </div>
                      <p className="text-sm text-slate-500">{def.question}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        1 = {def.rubric[0]} · 3 = {def.rubric[1]} · 5 = {def.rubric[2]}
                      </p>
                    </div>
                    <ScoreSelect
                      label={def.label}
                      value={score}
                      onChange={(s) => updateOpportunity({ ...selected, readiness: { ...selected.readiness, [dim]: s } })}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Average (for reference only)</p>
                <p className="text-3xl font-bold text-slate-900">{result.average.toFixed(1)}<span className="text-base text-slate-400"> / 5</span></p>
                <p className="text-xs text-slate-500 mt-2 flex gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Scores are not simply averaged: a critical data or governance deficiency blocks a pilot regardless of the total.
                </p>
              </div>
              <div>
                {result.blockers.length > 0 ? (
                  <Callout tone="danger" title="Blocking deficiencies">
                    <ul className="space-y-1">
                      {result.blockers.map((b) => (
                        <li key={b} className="flex gap-1.5">
                          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </Callout>
                ) : result.gaps.length > 0 ? (
                  <Callout tone="warning" title="Preparation needed">
                    Raise {result.gaps.map((g) => READINESS_DIMENSIONS[g].label.toLowerCase()).join(', ')} to at least 3.
                  </Callout>
                ) : (
                  <Callout tone="success" title="No blocking deficiencies">
                    {READINESS_CLASSES[result.classification].description}
                  </Callout>
                )}
              </div>
            </div>

            {result.gaps.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-800 mb-2">Readiness actions (become funded work, not footnotes)</p>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                  {result.gaps.map((g) => (
                    <li key={g}>
                      <span className="font-medium">{READINESS_DIMENSIONS[g].label}:</span>{' '}
                      move from “{READINESS_DIMENSIONS[g].rubric[0].toLowerCase()}” toward “
                      {READINESS_DIMENSIONS[g].rubric[2].toLowerCase()}”.
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(READINESS_CLASSES) as ReadinessClass[]).map((c) => (
          <Card key={c} padding="sm">
            <ReadinessBadge classification={c} />
            <p className="text-sm text-slate-600 mt-2">{READINESS_CLASSES[c].description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
