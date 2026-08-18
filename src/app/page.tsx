'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Navbar } from '@/components/navbar/Navbar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { HackathonDemoRunner } from '@/components/navbar/HackathonDemoRunner';
import { StudentView } from '@/components/views/StudentView';
import { TeacherView } from '@/components/views/TeacherView';
import { HODView } from '@/components/views/HODView';
import { AdminView } from '@/components/views/AdminView';
import { FirstLoginSetupModal } from '@/components/auth/FirstLoginSetupModal';
import { LearningProfileQuizModal } from '@/components/student/LearningProfileQuizModal';
import { SocraticChatbotDrawer } from '@/components/ai/SocraticChatbotDrawer';

export default function Home() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync dark theme
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Reset active tab when user changes
  useEffect(() => {
    setActiveTab('overview');
  }, [currentUser?.role]);

  // If not logged in, render Login Page directly
  if (!currentUser) {
    return <LoginPage />;
  }

  const role = currentUser.role || 'student';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans transition-colors">
      
      {/* Interactive Hackathon Live Simulator Banner */}
      <HackathonDemoRunner />

      {/* Top Sticky Navbar */}
      <Navbar toggleTheme={toggleTheme} isDark={isDark} />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Role Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Dynamic Center Dashboard View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {role === 'student' && (
            <StudentView activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {role === 'teacher' && (
            <TeacherView activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {role === 'hod' && (
            <HODView activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {role === 'admin' && (
            <AdminView activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>

      {/* Mandatory First-Login Password Change & Profile Setup Modal */}
      <FirstLoginSetupModal />

      {/* 15-Question AI Learning Profile Assessment Modal */}
      <LearningProfileQuizModal
        isOpen={currentUser?.role === 'student' && !currentUser.quiz_completed}
      />

      {/* Persistent Floating Socratic AI Tutor Drawer */}
      <SocraticChatbotDrawer />

    </div>
  );
}
