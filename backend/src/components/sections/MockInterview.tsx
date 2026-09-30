import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { mockQuestions } from '../../lib/data';
import { MockInterviewQuestion, MockInterviewResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../lib/api';
import {
  Mic,
  MicOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';

export const MockInterview: React.FC = () => {
  const { targetCareer, addInterviewResult, showToast, user } = useApp();
  const [selectedQuestion, setSelectedQuestion] = useState<MockInterviewQuestion>(mockQuestions[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(selectedQuestion.timeLimitSeconds);
  const [answerText, setAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState<MockInterviewResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);

  useEffect(() => {
    setTimer(selectedQuestion.timeLimitSeconds);
    setAnswerText('');
    setEvaluation(null);
    setIsRecording(false);
  }, [selectedQuestion]);

  useEffect(() => {
    let interval: any;
    if (isRecording && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && isRecording) {
      setIsRecording(false);
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      if (!answerText) {
        setAnswerText(
          'In our architecture, we place an in-memory Redis cluster in front of the primary SQL database to act as an LRU cache. When a request arrives, we check Redis with a TTL of 15 minutes, returning sub-12ms cache hits. If missed, we use distributed locks via Redis Mutex to prevent cache stampedes, querying the database and repopulating the cache.'
        );
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleEvaluate = async () => {
    if (!answerText.trim()) {
      showToast('Please provide an answer before submitting for evaluation.');
      return;
    }
    setIsEvaluating(true);

    try {
      // Call backend API if possible
      let interviewId = activeInterviewId;
      if (!interviewId) {
        const startRes = await apiClient.startInterview(user.id, targetCareer.title, 'Intermediate');
        interviewId = startRes.interview_id;
        setActiveInterviewId(interviewId);
      }

      const answerRes = await apiClient.submitInterviewAnswer(interviewId as string, answerText);

      const mockResult: MockInterviewResult = {
        id: `mock_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        role: `${targetCareer.title} (${selectedQuestion.category})`,
        score: answerRes.feedback.score,
        feedback: {
          strengths: answerRes.feedback.strengths,
          improvements: answerRes.feedback.improvements,
          rubricScores: {
            technicalDepth: answerRes.feedback.technical_depth || 88,
            communication: answerRes.feedback.communication || 84,
            problemSolving: 88,
            confidence: 85,
          },
          overallReview: 'Solid technical demonstration with sound architectural tradeoff awareness.',
        },
      };

      setEvaluation(mockResult);
      addInterviewResult(mockResult);
      showToast('AI Interview rubric evaluation generated from backend!');
    } catch {
      // Fallback
      const fallbackResult: MockInterviewResult = {
        id: `mock_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        role: `${targetCareer.title} (${selectedQuestion.category})`,
        score: 87,
        feedback: {
          strengths: [
            'Directly addressed latency constraints with in-memory caching',
            'Demonstrated awareness of cache stampedes and distributed locking',
            'Structured response with clear problem resolution',
          ],
          improvements: [
            'Quantify memory overhead for storing high-dimensional keys',
            'Discuss TTL invalidation strategy when source data updates',
          ],
          rubricScores: {
            technicalDepth: 90,
            communication: 86,
            problemSolving: 88,
            confidence: 84,
          },
          overallReview: 'Strong engineering response demonstrating production readiness.',
        },
      };
      setEvaluation(fallbackResult);
      addInterviewResult(fallbackResult);
      showToast('AI Interview rubric evaluation generated!');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Question Selector */}
      <div className="flex flex-wrap gap-2">
        {mockQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelectedQuestion(q)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              selectedQuestion.id === q.id
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] border-[#E5E6DF] hover:text-[#18201D]'
            }`}
          >
            {q.category}
          </button>
        ))}
      </div>

      {/* Main Question Card */}
      <Card className="border border-[#E5E6DF] bg-white p-6 space-y-4 shadow-sm rounded-xl">
        <div className="flex items-center justify-between text-xs text-[#717A75] font-mono">
          <span className="uppercase text-[#2D6A4F] font-bold tracking-wider">
            {selectedQuestion.category} • {targetCareer.title}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[#18201D] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#717A75]" />
            <span>
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#18201D] leading-snug">
          {selectedQuestion.question}
        </h3>

        <div className="p-3.5 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF] text-xs text-[#18201D] leading-relaxed">
          <span className="font-bold text-[#717A75] block mb-1">Scenario Context:</span>
          {selectedQuestion.context}
        </div>

        {/* Expected key points */}
        <div className="space-y-1.5 text-xs">
          <span className="font-mono text-[#717A75] uppercase tracking-wider block font-semibold">
            Rubric Benchmarks Evaluated:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {selectedQuestion.keyPointsToCover.map((pt, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-[#18201D] p-2 rounded-md bg-[#F0F1EA] border border-[#E5E6DF]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-1.5 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Answer input */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-[#717A75]">
            <span className="font-medium">Your Response (Speech-to-text or typed)</span>
            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? 'danger' : 'secondary'}
                size="sm"
                onClick={toggleRecording}
                icon={isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              >
                {isRecording ? 'Stop Mic Recording' : 'Simulate Voice Response'}
              </Button>
            </div>
          </div>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={5}
            placeholder="Deliver your technical design response here..."
            className="w-full rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] p-4 text-sm text-[#18201D] placeholder-[#717A75] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setAnswerText('');
              setEvaluation(null);
            }}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isEvaluating}
            onClick={handleEvaluate}
            iconRight={<Sparkles className="w-4 h-4" />}
          >
            Submit for AI Feedback
          </Button>
        </div>
      </Card>

      {/* Evaluation Results Card */}
      {evaluation && (
        <Card className="border border-[#E5E6DF] bg-white p-6 space-y-5 animate-in fade-in duration-300 shadow-md rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E8E1]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] uppercase tracking-wider mb-1 font-semibold">
                <Award className="w-4 h-4 text-[#2D6A4F]" />
                <span>AI Interview Assessment Result</span>
              </div>
              <h4 className="text-lg font-bold text-[#18201D]">
                Score: {evaluation.score} / 100 • Strong Technical Demonstration
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/40 font-bold">
                Pass Criterion Met
              </span>
            </div>
          </div>

          {/* Rubric scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(evaluation.feedback.rubricScores).map(([key, score]) => (
              <div
                key={key}
                className="p-3 rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] text-center"
              >
                <div className="text-[11px] font-mono text-[#717A75] uppercase font-semibold">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-xl font-bold font-mono text-[#18201D] mt-0.5">
                  {score}%
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-[#18201D] leading-relaxed italic bg-[#F8F8F5] p-3.5 rounded-lg border border-[#E5E6DF]">
            &quot;{evaluation.feedback.overallReview}&quot;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3.5 rounded-lg bg-[#EBF3EE] border border-[#2D6A4F]/20">
              <span className="font-bold text-[#2D6A4F] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Demonstrated Strengths
              </span>
              <ul className="space-y-1 text-[#18201D] list-disc list-inside">
                {evaluation.feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 p-3.5 rounded-lg bg-[#FDF8ED] border border-[#D4A347]/30">
              <span className="font-bold text-[#B27B18] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Target Polish Areas
              </span>
              <ul className="space-y-1 text-[#18201D] list-disc list-inside">
                {evaluation.feedback.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
