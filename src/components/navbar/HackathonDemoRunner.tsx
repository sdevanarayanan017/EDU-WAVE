'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Play, CheckCircle2, Activity, MessageSquare } from 'lucide-react';

export const HackathonDemoRunner: React.FC = () => {
  const { isDemoRunning, demoStep, demoMessage, runHackathonDemoSimulation } = useApp();

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-500/30 text-white px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2.5">
          <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <strong className="text-white font-bold">EDU-WAVE Hackathon Live Simulator:</strong>{' '}
            <span className="text-slate-300">
              {isDemoRunning
                ? demoMessage
                : 'Experience the complete end-to-end Teacher Assignment → AI Split → WhatsApp Queue → Student Completion pipeline.'}
            </span>
          </div>
        </div>

        <button
          onClick={runHackathonDemoSimulation}
          disabled={isDemoRunning}
          className="shrink-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
        >
          {isDemoRunning ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating Step {demoStep}/8...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Live Hackathon Pipeline</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
