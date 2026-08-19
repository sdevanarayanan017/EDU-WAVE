'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface StudySessionTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudySessionTimerModal: React.FC<StudySessionTimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { assignments, logStudySession, currentUser } = useApp();

  const [mode, setMode] = useState<'timer' | 'manual'>('timer');
  const [selectedSubject, setSelectedSubject] = useState(assignments[0]?.subject_name || 'Database Management Systems');
  const [taskTitle, setTaskTitle] = useState('');
  
  // Timer state
  const [seconds, setSeconds] = useState(25 * 60); // default 25 min Pomodoro
  const [isActive, setIsActive] = useState(false);
  const [initialDurationMins, setInitialDurationMins] = useState(25);

  // Manual log state
  const [manualMinutes, setManualMinutes] = useState(45);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      // Auto-log completed session
      logStudySession({
        student_id: currentUser?.id || 'usr-stu-1',
        subject_name: selectedSubject,
        task_title: taskTitle || 'Focused Pomodoro Block',
        duration_minutes: initialDurationMins,
        date: new Date().toISOString().split('T')[0],
        mode: 'timer',
      });
      alert(`🎉 Study session complete! ${initialDurationMins} minutes logged for ${selectedSubject}.`);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, initialDurationMins, selectedSubject, taskTitle, currentUser, logStudySession]);

  if (!isOpen) return null;

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (mins = 25) => {
    setIsActive(false);
    setInitialDurationMins(mins);
    setSeconds(mins * 60);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logStudySession({
      student_id: currentUser?.id || 'usr-stu-1',
      subject_name: selectedSubject,
      task_title: taskTitle || 'Self Study Session',
      duration_minutes: Number(manualMinutes),
      date: new Date().toISOString().split('T')[0],
      mode: 'manual',
    });
    setTaskTitle('');
    onClose();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
              <Timer className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Study Hour Tracker & Timer
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMode('timer')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === 'timer'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Live Timer
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Manual Log
            </button>
          </div>
        </div>

        {/* Subject & Task Selection */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            >
              <option value="Database Management Systems">Database Management Systems</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Discrete Mathematics">Discrete Mathematics</option>
              <option value="General Academic Study">General Academic Study</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Task / Topic
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. 3NF Decomposition Practice"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* MODE 1: LIVE POMODORO TIMER */}
        {mode === 'timer' && (
          <div className="space-y-6 text-center animate-in fade-in">
            
            {/* Countdown Display */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="text-5xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                {formatTime(seconds)}
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                {isActive ? '⚡ Focus in progress...' : 'Paused / Ready'}
              </p>

              {/* Interval Preset Pills */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => resetTimer(15)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-colors"
                >
                  15 min
                </button>
                <button
                  onClick={() => resetTimer(25)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-colors"
                >
                  25 min
                </button>
                <button
                  onClick={() => resetTimer(45)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-colors"
                >
                  45 min
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/25'
                }`}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? 'Pause Timer' : 'Start Focus Session'}</span>
              </button>

              <button
                onClick={() => resetTimer(initialDurationMins)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: MANUAL LOG */}
        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Study Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/25 transition-all"
            >
              Log Study Hours
            </button>
          </form>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
