import type { ReactNode } from 'react';
import { Badge } from '../ui';
import type { AIOpportunity, DecisionCategory, ReadinessClass, Score } from '../../types/align';
import { DECISION_CATEGORIES, PHASES, READINESS_CLASSES } from '../../data/alignFramework';
import { SCORES, inputClass } from './helpers';


export function PhaseHeader({ letter }: { letter: string }) {
  const phase = PHASES.find((p) => p.letter === letter)!;
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl font-bold">
          {phase.letter}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
            Executive decision: {phase.decision}
          </p>
          <h2 className="text-2xl font-bold">{phase.name}</h2>
          <p className="text-slate-300 mt-1">{phase.question}</p>
          <p className="text-sm text-slate-400 mt-3 max-w-3xl">{phase.purpose}</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs text-slate-400">Deliverable</p>
          <p className="font-semibold">{phase.deliverable}</p>
        </div>
      </div>
    </div>
  );
}

export function ScoreSelect({
  value,
  onChange,
  label,
  invert = false,
}: {
  value: Score;
  onChange: (s: Score) => void;
  label: string;
  // For risk-style scales where 5 is bad.
  invert?: boolean;
}) {
  const good = invert ? value <= 2 : value >= 4;
  const bad = invert ? value >= 4 : value <= 2;
  const color = bad ? 'bg-red-500' : good ? 'bg-emerald-500' : 'bg-amber-500';
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {SCORES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={s === value}
          onClick={() => onChange(s)}
          className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
            s === value ? `${color} text-white` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function DecisionBadge({ category }: { category: DecisionCategory }) {
  const def = DECISION_CATEGORIES[category];
  return <Badge variant={def.variant}>{def.label}</Badge>;
}

export function ReadinessBadge({ classification }: { classification: ReadinessClass }) {
  const variant =
    classification === 'ready-to-pilot' ? 'success' : classification === 'prepare' ? 'warning' : 'danger';
  return <Badge variant={variant}>{READINESS_CLASSES[classification].label}</Badge>;
}

export function OpportunityPicker({
  opportunities,
  selectedId,
  onSelect,
  renderMeta,
}: {
  opportunities: AIOpportunity[];
  selectedId: string;
  onSelect: (id: string) => void;
  renderMeta?: (o: AIOpportunity) => ReactNode;
}) {
  return (
    <ul className="space-y-1">
      {opportunities.map((o) => (
        <li key={o.id}>
          <button
            type="button"
            onClick={() => onSelect(o.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
              o.id === selectedId
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-transparent hover:bg-slate-50'
            }`}
          >
            <p className="text-sm font-medium text-slate-900">{o.title}</p>
            {renderMeta && <div className="mt-1">{renderMeta(o)}</div>}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
      {multiline ? (
        <textarea
          className={`${inputClass} mt-1 min-h-[72px]`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={`${inputClass} mt-1`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
      <input
        type="number"
        step={step}
        className={`${inputClass} mt-1`}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </label>
  );
}

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  children: ReactNode;
}) {
  const tones = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  };
  return (
    <div className={`border rounded-lg p-4 ${tones[tone]}`}>
      <p className="font-semibold text-sm">{title}</p>
      <div className="text-sm mt-1 opacity-90">{children}</div>
    </div>
  );
}

export function SubTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string; alert?: boolean }[];
  value: T;
  onChange: (t: T) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          aria-current={value === t.key ? 'page' : undefined}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
            value === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.label}
          {t.alert && <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2 align-middle" />}
        </button>
      ))}
    </div>
  );
}
