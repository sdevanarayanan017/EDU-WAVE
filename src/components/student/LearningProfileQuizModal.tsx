'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LEARNING_PROFILE_QUESTIONS } from '@/lib/seedData';
import {
  BrainCircuit,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Clock,
  BookOpen,
  Activity,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearningProfileQuizModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LearningProfileQuizModal: React.FC<LearningProfileQuizModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, submitLearningProfile, studentLearningProfile } = useApp();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    return {
      weekdayAvailabilityScore: studentLearningProfile.weekdayAvailabilityScore || 3,
      weekendAvailabilityScore: studentLearningProfile.weekendAvailabilityScore || 3,
      theoryLearningRequirement: studentLearningProfile.theoryLearningRequirement || 3,
      preferredTheoryMethod: studentLearningProfile.preferredTheoryMethod || 'examples',
      problemUnderstandingScore: studentLearningProfile.problemUnderstandingScore || 2,
      problemBatchPreference: studentLearningProfile.problemBatchPreference || '5-10',
      focusDurationScore: studentLearningProfile.focusDurationScore || 3,
      longSessionToleranceScore: studentLearningProfile.longSessionToleranceScore || 2,
      longestTaskType: studentLearningProfile.longestTaskType || 'solving_problems',
      taskOrderingPreference: studentLearningProfile.taskOrderingPreference || 'closest_deadline',
      revisionNeedScore: studentLearningProfile.revisionNeedScore || 3,
      revisionTimingPreference: studentLearningProfile.revisionTimingPreference || 'few_days',
      stressSensitivityScore: studentLearningProfile.stressSensitivityScore || 4,
      deadlineDifficultyType: studentLearningProfile.deadlineDifficultyType || 'underestimate_time',
      assignmentSplittingPreference: studentLearningProfile.assignmentSplittingPreference || 'small_daily',
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // If student and !quiz_completed, force modal open
  const isMandatory = currentUser?.role === 'student' && !currentUser.quiz_completed;
  if (!isOpen && !isMandatory) return null;

  const currentQ = LEARNING_PROFILE_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / LEARNING_PROFILE_QUESTIONS.length) * 100);

  const handleSelectOption = (value: number, metaKey?: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.field]: metaKey || value,
      [`${currentQ.field}Score`]: value,
    }));
  };

  const handleNext = () => {
    if (currentIdx < LEARNING_PROFILE_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Finish Quiz
      setIsSubmitting(true);
      setTimeout(() => {
        submitLearningProfile(answers);
        setIsSubmitting(false);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        if (onClose) onClose();
      }, 500);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const selectedValue = answers[currentQ.field];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
        
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              15-Question AI Learning Assessment
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            Question {currentIdx + 1} of {LEARNING_PROFILE_QUESTIONS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Section Badge & Question Content */}
        <div className="space-y-3">
          <span className="inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {currentQ.section}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {currentQ.question}
          </h2>

          {currentQ.helpText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>{currentQ.helpText}</span>
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, i) => {
            const isSelected =
              opt.metaKey ? selectedValue === opt.metaKey : selectedValue === opt.value;

            return (
              <div
                key={i}
                onClick={() => handleSelectOption(opt.value, opt.metaKey)}
                className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 dark:border-sky-500 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? 'bg-sky-500 text-white'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span>{opt.text}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {currentIdx === LEARNING_PROFILE_QUESTIONS.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Calibrating Schedule...' : 'Complete & Generate Schedule'}</span>
              </>
            ) : (
              <>
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
