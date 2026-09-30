import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/forms/TextField';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const ProjectBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { targetCareer, showToast } = useApp();

  const initialSkill = searchParams.get('skill') || 'Distributed Systems';
  const [skill, setSkill] = useState(initialSkill);
  const [projectTitle, setProjectTitle] = useState('High-Throughput Vector Ingestion Engine');
  const [techStack, setTechStack] = useState('TypeScript, Node.js, Redis, Pinecone');
  const [difficulty, setDifficulty] = useState<'Intermediate' | 'Advanced'>('Advanced');
  const [generating, setGenerating] = useState(false);
  const [specGenerated, setSpecGenerated] = useState(true);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSpecGenerated(true);
      showToast('Custom project specification generated!');
    }, 700);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <Link
        to={routes.projects}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </Link>

      <PageHeader
        phaseKicker="Project Generator"
        title="Custom Proof Project Builder"
        description={`Architect tailored portfolio projects designed to bridge gaps against ${targetCareer.title}.`}
      />

      <Card className="p-6 space-y-5 border border-[#E5E6DF] bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Target Competency to Bridge"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. Distributed Systems, Kubernetes, Raft"
          />
          <TextField
            label="Proposed Project Scope"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. In-memory Distributed Cache"
          />
        </div>

        <TextField
          label="Primary Technology Stack"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. Python, FastAPI, Docker, PostgreSQL"
        />

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#717A75] font-medium">Difficulty:</span>
            {(['Intermediate', 'Advanced'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-md border text-xs font-mono transition-colors cursor-pointer ${
                  difficulty === d
                    ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40 font-bold'
                    : 'bg-[#F0F1EA] text-[#717A75] border-[#E5E6DF]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="md"
            isLoading={generating}
            onClick={handleGenerate}
            iconRight={<Sparkles className="w-4 h-4" />}
          >
            Generate Architecture Spec
          </Button>
        </div>
      </Card>

      {/* Generated Spec Preview */}
      {specGenerated && (
        <Card className="p-6 space-y-6 border border-[#2D6A4F]/30 bg-white shadow-md animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E8E1]">
            <div>
              <span className="text-xs font-mono text-[#2D6A4F] uppercase tracking-wider block mb-1 font-bold">
                Generated Artifact Specification
              </span>
              <h3 className="text-xl font-bold text-[#18201D]">{projectTitle}</h3>
            </div>
            <span className="text-xs font-mono text-[#2D6A4F] bg-[#EBF3EE] px-3 py-1 rounded-md border border-[#2D6A4F]/40 font-bold self-start">
              {difficulty} Engineering
            </span>
          </div>

          <div className="space-y-3 text-sm text-[#18201D]">
            <h4 className="font-bold text-[#18201D]">System Architecture &amp; Core Requirements:</h4>
            <p className="text-xs text-[#717A75] leading-relaxed">
              Design a streaming ingestion service that buffers incoming unstructured text chunks, generates
              embeddings via batched async worker queues, and indexes into a vector store with strict backpressure
              handling.
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-[#717A75] uppercase tracking-wider block font-bold">
                Verification Deliverables Checklist:
              </span>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] mt-0.5 shrink-0" />
                  <span>
                    Async batching pipeline achieving 1,000 docs/sec throughput without dropping connections
                  </span>
                </li>
                <li className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] mt-0.5 shrink-0" />
                  <span>
                    Deterministic fallback test harness simulating 500 error responses and measuring retry jitter
                  </span>
                </li>
                <li className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] mt-0.5 shrink-0" />
                  <span>
                    CI/CD test report confirming sub-50ms p95 latency under simulated spike load
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E8E1] flex items-center justify-between">
            <span className="text-xs text-[#717A75] font-mono">
              Ready to add to your personal roadmap
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                showToast(`Project "${projectTitle}" added to your portfolio workspace!`);
                navigate(routes.projects);
              }}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Add to Active Portfolio
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
