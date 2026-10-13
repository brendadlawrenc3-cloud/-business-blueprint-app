import { Plus, Trash2, ShieldAlert, Users, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar } from '../ui';
import { useAlign } from '../../context/AlignContext';
import type {
  AIUsageRecord,
  DataSensitivity,
  Edition,
  PolicyElement,
  RevenueBand,
  RevenueExposure,
} from '../../types/align';
import {
  DATA_SENSITIVITY,
  EDITIONS,
  POLICY_ELEMENTS,
  REVENUE_BANDS,
} from '../../data/alignFramework';
import { exposureSummary, inventoryRisk, pilotLimit, policyCoverage } from '../../utils/alignScoring';
import { Callout, ScoreSelect, TextField } from './shared';
import { inputClass } from './helpers';

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

// ── Current AI use inventory & acceptable-use policy ─────────────────────────

export function CurrentUseSection() {
  const { aiInventory, policy, patch } = useAlign();
  const risk = inventoryRisk(aiInventory);
  const coverage = policyCoverage(policy);

  const update = (r: AIUsageRecord) => patch({ aiInventory: aiInventory.map((x) => (x.id === r.id ? r : x)) });
  const add = () =>
    patch({
      aiInventory: [
        ...aiInventory,
        { id: newId('u'), useCase: '', team: '', toolCategory: '', dataSensitivity: 'internal', sanctioned: false, usersApprox: 1 },
      ],
    });

  return (
    <div className="space-y-6">
      <Callout tone="info" title="Start with what is already happening">
        In most companies, people are already using AI tools without a policy. That is usually the most immediate risk,
        and it shows where demand exists. Take 15 minutes with the leadership team: list every use you know of or
        suspect, then fill in the gaps in the policy.
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <p className="text-xs text-slate-500">Known uses</p>
          <p className="text-3xl font-bold text-slate-900">{risk.total}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> People using AI</p>
          <p className="text-3xl font-bold text-slate-900">~{risk.peopleUsing}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500">Unsanctioned</p>
          <p className="text-3xl font-bold text-amber-600">{risk.unsanctioned}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> High risk</p>
          <p className={`text-3xl font-bold ${risk.highRisk.length ? 'text-red-600' : 'text-emerald-600'}`}>{risk.highRisk.length}</p>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader
          title="Current AI use inventory"
          subtitle="Record the use, not the brand: what work, which team, what data"
          action={<Button size="sm" onClick={add} icon={<Plus className="w-4 h-4" />}>Use</Button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-2">Use case</th>
                <th className="py-2 pr-2">Team</th>
                <th className="py-2 pr-2">Kind of tool</th>
                <th className="py-2 pr-2">Data involved</th>
                <th className="py-2 pr-2 w-20">People</th>
                <th className="py-2 pr-2">Sanctioned</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {aiInventory.map((r) => {
                const high = !r.sanctioned && DATA_SENSITIVITY[r.dataSensitivity].risk >= 3;
                return (
                  <tr key={r.id} className={`border-b border-slate-100 ${high ? 'bg-red-50' : ''}`}>
                    <td className="py-2 pr-2"><input aria-label="Use case" className={inputClass} value={r.useCase} onChange={(e) => update({ ...r, useCase: e.target.value })} /></td>
                    <td className="py-2 pr-2"><input aria-label="Team" className={inputClass} value={r.team} onChange={(e) => update({ ...r, team: e.target.value })} /></td>
                    <td className="py-2 pr-2"><input aria-label="Kind of tool" className={inputClass} value={r.toolCategory} onChange={(e) => update({ ...r, toolCategory: e.target.value })} /></td>
                    <td className="py-2 pr-2">
                      <select aria-label="Data involved" className={inputClass} value={r.dataSensitivity} onChange={(e) => update({ ...r, dataSensitivity: e.target.value as DataSensitivity })}>
                        {(Object.keys(DATA_SENSITIVITY) as DataSensitivity[]).map((d) => (
                          <option key={d} value={d}>{DATA_SENSITIVITY[d].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2"><input aria-label="People" type="number" className={inputClass} value={r.usersApprox} onChange={(e) => update({ ...r, usersApprox: parseInt(e.target.value, 10) || 0 })} /></td>
                    <td className="py-2 pr-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={r.sanctioned} onChange={(e) => update({ ...r, sanctioned: e.target.checked })} className="w-4 h-4" />
                        {high && <Badge variant="danger">Act now</Badge>}
                      </label>
                    </td>
                    <td className="py-2 text-right">
                      <button type="button" aria-label="Remove use" className="text-slate-400 hover:text-red-600" onClick={() => patch({ aiInventory: aiInventory.filter((x) => x.id !== r.id) })}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {risk.highRisk.length > 0 && (
          <div className="mt-4">
            <Callout tone="danger" title={`${risk.highRisk.length} unsanctioned use${risk.highRisk.length > 1 ? 's' : ''} of client or personal data`}>
              Don't ban it, because people will just hide it. Within two weeks, either move the work to a business-grade
              tool with data protections or stop entering that data. Then cover it in the data classification rules
              below.
            </Callout>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <CardHeader title="Minimum acceptable-use policy" subtitle="This is the first governance deliverable, and it comes before any pilot" />
        <div className="flex items-center gap-3 mb-4">
          <ProgressBar value={coverage} color={coverage >= 75 ? 'green' : coverage >= 40 ? 'amber' : 'red'} />
          <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{coverage}% in place</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(POLICY_ELEMENTS) as PolicyElement[]).map((k) => (
            <label key={k} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${policy[k] ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'}`}>
              <input type="checkbox" className="w-4 h-4 mt-0.5" checked={policy[k]} onChange={(e) => patch({ policy: { ...policy, [k]: e.target.checked } })} />
              <span>
                <span className="block text-sm font-medium text-slate-900">{POLICY_ELEMENTS[k].label}</span>
                <span className="block text-xs text-slate-500">{POLICY_ELEMENTS[k].detail}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Competitive exposure ─────────────────────────────────────────────────────

const HORIZONS: Record<RevenueExposure['horizon'], string> = {
  now: 'Already happening',
  '1-2-years': '1–2 years',
  '3-plus-years': '3+ years',
};

export function ExposureSection() {
  const { exposure, patch } = useAlign();
  const summary = exposureSummary(exposure);
  const totalShare = exposure.reduce((s, e) => s + e.revenueShare, 0);

  const update = (x: RevenueExposure) => patch({ exposure: exposure.map((e) => (e.id === x.id ? x : e)) });
  const add = () =>
    patch({ exposure: [...exposure, { id: newId('x'), stream: '', revenueShare: 0, threat: 3, horizon: '1-2-years', response: '' }] });

  return (
    <div className="space-y-6">
      <Callout tone="info" title="AI is also a threat, not only an opportunity">
        For each revenue stream, ask: <em>could a competitor or new entrant using AI deliver this faster, cheaper, or
        without us?</em> Streams with a threat score of 4–5 need a strategic response. That response often becomes a
        Transform or Reinvent opportunity.
      </Callout>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <p className="text-xs text-slate-500">Revenue under high AI threat</p>
          <p className={`text-3xl font-bold ${summary.revenueAtRisk >= 25 ? 'text-red-600' : 'text-slate-900'}`}>{summary.revenueAtRisk}%</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500">High-threat streams without a response</p>
          <p className={`text-3xl font-bold ${summary.unanswered.length ? 'text-amber-600' : 'text-emerald-600'}`}>{summary.unanswered.length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500">Revenue mapped</p>
          <p className={`text-3xl font-bold ${totalShare === 100 ? 'text-slate-900' : 'text-amber-600'}`}>{totalShare}%</p>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader
          title="AI exposure check"
          subtitle="Threat: 1 = hard to replicate with AI · 5 = AI-enabled rivals could undercut it today"
          action={<Button size="sm" onClick={add} icon={<Plus className="w-4 h-4" />}>Revenue stream</Button>}
        />
        <div className="space-y-4">
          {exposure.map((x) => (
            <div key={x.id} className={`border rounded-lg p-4 ${x.threat >= 4 ? 'border-red-200 bg-red-50/40' : 'border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4"><TextField label="Revenue stream" value={x.stream} onChange={(v) => update({ ...x, stream: v })} /></div>
                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">% of revenue</span>
                  <input type="number" className={`${inputClass} mt-1`} value={x.revenueShare} onChange={(e) => update({ ...x, revenueShare: parseFloat(e.target.value) || 0 })} />
                </label>
                <div className="md:col-span-3">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">AI threat</span>
                  <ScoreSelect label="AI threat" value={x.threat} onChange={(s) => update({ ...x, threat: s })} invert />
                </div>
                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Horizon</span>
                  <select className={`${inputClass} mt-1`} value={x.horizon} onChange={(e) => update({ ...x, horizon: e.target.value as RevenueExposure['horizon'] })}>
                    {(Object.keys(HORIZONS) as RevenueExposure['horizon'][]).map((h) => <option key={h} value={h}>{HORIZONS[h]}</option>)}
                  </select>
                </label>
                <div className="md:col-span-1 text-right">
                  <button type="button" aria-label="Remove stream" className="text-slate-400 hover:text-red-600" onClick={() => patch({ exposure: exposure.filter((e) => e.id !== x.id) })}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <TextField
                  label={x.threat >= 4 ? 'Strategic response (required)' : 'Strategic response'}
                  value={x.response}
                  onChange={(v) => update({ ...x, response: v })}
                  placeholder="e.g. productize it ourselves, reprice, move up-market, differentiate on judgment"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Company profile & edition ────────────────────────────────────────────────

export function ProfileSection() {
  const state = useAlign();
  const { profile, companyName, patch } = state;
  const defaultPilots = REVENUE_BANDS[profile.revenueBand].defaultPilots;
  const recommendedEdition = REVENUE_BANDS[profile.revenueBand].edition;

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader title="Company profile" subtitle="Size sets how deep to go and how many pilots the company can run at once" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <TextField label="Company" value={companyName} onChange={(v) => patch({ companyName: v })} />
          <TextField label="Industry" value={profile.industry} onChange={(v) => patch({ profile: { ...profile, industry: v } })} />
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Annual revenue</span>
            <select
              className={`${inputClass} mt-1`}
              value={profile.revenueBand}
              onChange={(e) => {
                const band = e.target.value as RevenueBand;
                patch({ profile: { ...profile, revenueBand: band, edition: REVENUE_BANDS[band].edition } });
              }}
            >
              {(Object.keys(REVENUE_BANDS) as RevenueBand[]).map((b) => <option key={b} value={b}>{REVENUE_BANDS[b].label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Employees</span>
            <input type="number" className={`${inputClass} mt-1`} value={profile.employees} onChange={(e) => patch({ profile: { ...profile, employees: parseInt(e.target.value, 10) || 0 } })} />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(EDITIONS) as Edition[]).map((ed) => (
            <button
              key={ed}
              type="button"
              onClick={() => patch({ profile: { ...profile, edition: ed } })}
              className={`text-left border-2 rounded-xl p-4 transition ${profile.edition === ed ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                {profile.edition === ed ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                <p className="font-semibold text-slate-900">{EDITIONS[ed].label}</p>
                {ed === recommendedEdition && <Badge variant="info">Recommended for this size</Badge>}
              </div>
              <p className="text-sm text-slate-600 mt-2">{EDITIONS[ed].description}</p>
              <ul className="text-xs text-slate-500 mt-2 space-y-0.5">
                {EDITIONS[ed].focus.map((f) => <li key={f}>• {f}</li>)}
              </ul>
            </button>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader title="Change capacity" subtitle="How many AI pilots can the organization absorb at the same time?" />
        <div className="flex items-end gap-6 flex-wrap">
          <div>
            <p className="text-xs text-slate-500">Size-based default</p>
            <p className="text-3xl font-bold text-slate-900">{defaultPilots}</p>
          </div>
          <label className="block w-48">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Leadership override</span>
            <input
              type="number"
              min={1}
              placeholder={`Default (${defaultPilots})`}
              className={`${inputClass} mt-1`}
              value={profile.maxConcurrentPilots ?? ''}
              onChange={(e) =>
                patch({ profile: { ...profile, maxConcurrentPilots: e.target.value === '' ? null : Math.max(1, parseInt(e.target.value, 10) || 1) } })
              }
            />
          </label>
          <div>
            <p className="text-xs text-slate-500">Limit in effect</p>
            <p className="text-3xl font-bold text-blue-700">{pilotLimit(profile)}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Every pilot takes leadership attention, staff time for training, and process change. Running more pilots
          than the organization can absorb is a common reason AI programs stall. The Decision Matrix warns when
          approved work goes over this limit.
        </p>
      </Card>
    </div>
  );
}
