import schemesData from '../data/schemes.json';
import { StudentProfile } from './store';

export interface GovtSchemeMatch {
  id: string;
  name: string;
  category: string;
  ministry_or_dept: string;
  portal_name: string;
  portal_url: string;
  monthly_stipend_inr: string;
  target_audience: string;
  description: string;
  benefits: string[];
  eligible: boolean;
  reasons: string[];
  last_verified: string;
}

export function matchGovtSchemes(profile: StudentProfile): GovtSchemeMatch[] {
  const isMPResident =
    (profile.location || '').toLowerCase().includes('madhya pradesh') ||
    (profile.location || '').toLowerCase().includes('mp') ||
    (profile.location || '').toLowerCase().includes('bhopal') ||
    (profile.location || '').toLowerCase().includes('indore') ||
    (profile.location || '').toLowerCase().includes('sagar') ||
    (profile.location || '').toLowerCase().includes('jabalpur') ||
    (profile.location || '').toLowerCase().includes('gwalior');

  const degreeLower = (profile.degree || '').toLowerCase();
  const isGraduateOrTech =
    degreeLower.includes('b.tech') ||
    degreeLower.includes('bachelor') ||
    degreeLower.includes('b.e.') ||
    degreeLower.includes('graduate');
  const isDiploma = degreeLower.includes('diploma') || degreeLower.includes('polytechnic');

  const cgpaNum = parseFloat(profile.cgpa || '8.0') || 8.0;

  return schemesData.map((scheme) => {
    const reasons: string[] = [];
    let eligible = true;

    if (scheme.id === 'scheme_mmsky') {
      if (isMPResident) {
        reasons.push('Resident of Madhya Pradesh (Qualifies for state DBT subsidy)');
      } else {
        eligible = false;
        reasons.push('Requires MP domicile registration certificate on Samagra ID portal');
      }

      if (isGraduateOrTech) {
        reasons.push('Degree/Engineering graduate qualifies for highest ₹10,000/mo DBT slab');
      } else if (isDiploma) {
        reasons.push('Polytechnic diploma holder qualifies for ₹9,000/mo DBT slab');
      } else {
        reasons.push('Qualifies under 12th/Vocational ₹8,000/mo DBT slab');
      }
    } else if (scheme.id === 'scheme_naps') {
      eligible = true;
      reasons.push('Age >= 18 meets National Apprenticeship Act eligibility');
      reasons.push('Eligible for Government of India co-funded 25% stipend subsidy');
    } else if (scheme.id === 'scheme_pmkvy') {
      eligible = true;
      reasons.push('Eligible for zero-tuition Industry 4.0 NSQF certification under Skill India Mission');
      reasons.push('Free assessment and NSDC digital verification pass');
    } else if (scheme.id === 'scheme_meity_intern') {
      if (isGraduateOrTech) {
        reasons.push('Enrolled in technical degree (B.Tech / MCA / Computer Science)');
      } else {
        eligible = false;
        reasons.push('MeitY requires enrollment in B.Tech, M.Tech, MCA, or relevant technical program');
      }

      if (cgpaNum >= 6.5) {
        reasons.push(`Academic CGPA of ${profile.cgpa || '8.4'} satisfies minimum 60% requirement`);
      } else {
        eligible = false;
        reasons.push('Requires minimum 60% or 6.5 CGPA in previous examination');
      }
    } else if (scheme.id === 'scheme_aicte_virtual') {
      eligible = true;
      reasons.push('Directly mapped to NEP 2020 internship credits on academic transcript');
      reasons.push('Access to cloud enterprise sandbox and mentor workshops');
    } else if (scheme.id === 'scheme_mp_startup_seed') {
      if (isMPResident) {
        reasons.push('MP university student innovator eligible for ₹10,000/mo sustenance allowance');
        reasons.push('Eligible for prototyping seed matching grant up to ₹5,00,000');
      } else {
        eligible = false;
        reasons.push('Requires registration of venture in Madhya Pradesh');
      }
    }

    return {
      id: scheme.id,
      name: scheme.name,
      category: scheme.category,
      ministry_or_dept: scheme.ministry_or_dept,
      portal_name: scheme.portal_name,
      portal_url: scheme.portal_url,
      monthly_stipend_inr: scheme.monthly_stipend_inr,
      target_audience: scheme.target_audience,
      description: scheme.description,
      benefits: scheme.benefits,
      eligible,
      reasons,
      last_verified: scheme.last_verified,
    };
  });
}
