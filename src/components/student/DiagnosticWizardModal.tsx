'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import {
  X,
  Sliders,
  Sparkles,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
  BrainCircuit,
  HelpCircle
} from 'lucide-react';

interface DiagnosticWizardModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const DiagnosticWizardModal: React.FC<DiagnosticWizardModalProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { setRetakeQuizOpen } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              AI Learning Profile Assessment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              15-Question Numerical Feature Assessment
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          EDU-WAVE uses a comprehensive 15-question numerical learning profile assessment to calculate your theory learning requirements, problem batch preferences, focus duration, and study capacity.
        </p>

        <button
          onClick={() => {
            if (onClose) onClose();
            setRetakeQuizOpen(true);
          }}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch 15-Question Learning Profile Quiz</span>
        </button>
      </div>
    </div>
  );
};
