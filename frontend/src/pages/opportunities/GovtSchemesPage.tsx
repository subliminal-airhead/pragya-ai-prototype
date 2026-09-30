import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../lib/api';
import { govtSchemes as defaultSchemes } from '../../lib/data';
import { GovtScheme } from '../../types';
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Landmark,
} from 'lucide-react';

export const GovtSchemesPage: React.FC = () => {
  const { user } = useApp();
  const [schemes, setSchemes] = useState<GovtScheme[]>(defaultSchemes);
  const [filter, setFilter] = useState<'all' | 'mp' | 'national' | 'eligible'>('all');

  useEffect(() => {
    // Fetch matched govt schemes from backend
    apiClient.matchGovtSchemes(user.id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSchemes(data.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            ministryOrDept: s.ministry_or_dept,
            portalName: s.portal_name,
            portalUrl: s.portal_url,
            monthlyStipendInr: s.monthly_stipend_inr,
            targetAudience: s.target_audience,
            description: s.description,
            benefits: s.benefits || [],
            eligible: s.eligible,
            reasons: s.reasons || [],
            lastVerified: s.last_verified,
          })));
        }
      })
      .catch(() => {
        // Fallback to local default schemes
      });
  }, [user.id, user.location, user.degree]);

  const filtered = schemes.filter((s) => {
    if (filter === 'mp') return s.category.toLowerCase().includes('madhya pradesh');
    if (filter === 'national') return !s.category.toLowerCase().includes('madhya pradesh');
    if (filter === 'eligible') return s.eligible;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="State &amp; National Initiatives"
        title="Government Opportunities &amp; Apprenticeships"
        description={`Direct Benefit Transfer (DBT) stipends and statutory apprenticeships calibrated for ${user.fullName} (${user.degree}, ${user.location}). Verified against official portals.`}
      >
        <div className="flex items-center gap-1 p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            All Schemes ({schemes.length})
          </button>
          <button
            onClick={() => setFilter('mp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'mp'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Madhya Pradesh State ({schemes.filter((s) => s.category.includes('Madhya Pradesh')).length})
          </button>
          <button
            onClick={() => setFilter('national')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'national'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            National / Central
          </button>
          <button
            onClick={() => setFilter('eligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'eligible'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Eligible for You ({schemes.filter((s) => s.eligible).length})
          </button>
        </div>
      </PageHeader>

      {/* MP MMSKY Spotlight Card */}
      <Card className="border border-[#2D6A4F]/40 bg-[#EBF3EE] p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] uppercase font-bold">
              <Landmark className="w-4 h-4" />
              <span>Madhya Pradesh Flagship Scheme • MMSKY</span>
            </div>
            <h3 className="text-xl font-bold text-[#18201D]">
              Mukhyamantri Seekho-Kamao Yojana (₹8,000 - ₹10,000 / month DBT)
            </h3>
            <p className="text-xs text-[#717A75] max-w-3xl leading-relaxed">
              MP Government initiative offering on-the-job training in 703 industrial courses across 46 sectors. 75% of your monthly stipend is credited directly via Aadhaar DBT into your bank account.
            </p>
          </div>
          <a
            href="https://mmsky.mp.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            <Button variant="primary" size="md" iconRight={<ExternalLink className="w-4 h-4" />}>
              Apply on MMSKY Portal
            </Button>
          </a>
        </div>
      </Card>

      <div className="space-y-4">
        {filtered.map((scheme) => (
          <div
            key={scheme.id}
            className="p-6 rounded-xl border border-[#E5E6DF] bg-white space-y-4 shadow-xs hover:border-[#D0D2C7] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-[#2D6A4F] font-bold uppercase block mb-1">
                  {scheme.category}
                </span>
                <h3 className="text-lg font-bold text-[#18201D]">{scheme.name}</h3>
                <p className="text-xs text-[#717A75] mt-0.5">{scheme.ministryOrDept}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs font-bold text-[#2D6A4F] bg-[#EBF3EE] px-3 py-1.5 rounded-lg border border-[#2D6A4F]/30">
                  {scheme.monthlyStipendInr}
                </span>
                {scheme.eligible ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6A4F] bg-[#EBF3EE] px-2.5 py-1 rounded-lg border border-[#2D6A4F]/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Eligible</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B27B18] bg-[#FDF8ED] px-2.5 py-1 rounded-lg border border-[#D4A347]/40">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Check Prereq</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-[#18201D] leading-relaxed">{scheme.description}</p>

            {/* Candidate Qualification Analysis */}
            <div className="p-3.5 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] text-xs space-y-2">
              <span className="font-mono text-[#717A75] uppercase text-[11px] font-bold block">
                Candidate Eligibility Assessment ({user.fullName.split(' ')[0]}):
              </span>
              <ul className="space-y-1 list-disc list-inside text-[#18201D]">
                {scheme.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="space-y-1 text-xs">
              <span className="font-mono text-[#717A75] uppercase text-[11px] font-semibold block">
                Key Trainee Benefits:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {scheme.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[#18201D]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E8E1] text-xs">
              <span className="text-[#717A75] font-mono">
                Target: {scheme.targetAudience} • Verified {scheme.lastVerified}
              </span>
              <a
                href={scheme.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold hover:bg-[#24553F] transition-colors"
              >
                <span>Visit {scheme.portalName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
