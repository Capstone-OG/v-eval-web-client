import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { authService, tokenStorage } from './services';

// Components grouped by module folder
import { Navbar, Sidebar } from './components/layout';
import { 
  HeroBanner, 
  MetricsGrid, 
  MilestoneCard, 
  LiveQnACard, 
  AISocraticTutorWidget, 
  TeacherDashboardView 
} from './components/dashboard';
import { PublicLandingPage } from './components/landing';
import PublicFooter from './components/landing/PublicFooter';
import { WebLoginPage } from './components/auth';
import { 
  AcademicArchitectureModal, 
  DiagnosticTestModal, 
  AdaptiveQuizModal, 
  RadarChartModal 
} from './components/modals';
import { DiagnosticAssessmentPage } from './components/diagnostic';
import { CheckCircle2, Globe, LogIn, LayoutDashboard, Sparkles, Brain, X } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [activeRole, setActiveRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modals
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isZpdModalOpen, setIsZpdModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState(null);

  // Restore authenticated session on page load
  useEffect(() => {
    const savedUser = tokenStorage.getUser();
    const token = tokenStorage.getAccessToken();
    if (savedUser && token) {
      setCurrentUser(savedUser);
      const roles = savedUser.roles || [];
      if (roles.some(r => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('giaovien'))) setActiveRole('teacher');
      else if (roles.some(r => r.toLowerCase().includes('manager') || r.toLowerCase().includes('admin'))) setActiveRole('manager');
      else if (roles.some(r => r.toLowerCase().includes('parent'))) setActiveRole('parent');
      else setActiveRole('student');
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleStartTask = (task) => {
    if (task.type === 'quiz') {
      setIsZpdModalOpen(true);
    } else if (task.type === 'video') {
      showToast(`Đang mở Video bài giảng: "${task.title}"`);
    } else {
      setIsDiagnosticModalOpen(true);
    }
  };

  const handleContinueMilestone = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
    setIsZpdModalOpen(true);
  };

  const handleLoginSuccess = (role, userData) => {
    const targetRole = role || 'student';
    setActiveRole(targetRole);
    if (userData?.user) {
      setCurrentUser(userData.user);
    }
    setCurrentPage('dashboard');
    const roleName = targetRole === 'student' ? 'Học sinh' : targetRole === 'teacher' ? 'Giáo viên' : targetRole === 'manager' ? 'Quản lý' : 'Phụ huynh';
    const nameDisplay = userData?.user?.fullName || userData?.fullName || '';
    const nameStr = nameDisplay ? ` (${nameDisplay})` : '';
    showToast(`🎉 Đăng nhập thành công! Chào mừng ${roleName}${nameStr} vào hệ thống.`);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setCurrentUser(null);
    setCurrentPage('login');
    showToast("👋 Đã đăng xuất thành công khỏi hệ thống!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* GLOBAL FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md text-xs font-bold flex items-center gap-3 max-w-md"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <span className="leading-relaxed flex-1">{toastMsg}</span>
            <button
              onClick={() => setToastMsg(null)}
              className="text-slate-400 hover:text-white p-1 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* PAGE ROUTING */}
      {currentPage === 'landing' && (
        <PublicLandingPage 
          onOpenLogin={() => setCurrentPage('login')}
          onOpenDiagnostic={() => {
            setCurrentPage('dashboard');
            setActiveTab('diagnostic');
          }}
          onOpenDashboard={() => setCurrentPage('dashboard')}
          onOpenArchModal={() => setIsArchModalOpen(true)}
        />
      )}

      {currentPage === 'diagnostic' && (
        <DiagnosticAssessmentPage 
          isEmbedded={false}
          onNavigateDashboard={() => setCurrentPage('dashboard')}
          onNavigateHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'login' && (
        <WebLoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'dashboard' && (
        <div className="min-h-screen flex flex-col bg-[#F4F7FC] text-slate-900">
          
          {/* Top Sticky Header */}
          <Navbar 
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenAuthModal={() => setCurrentPage('login')}
            onOpenArchModal={() => setIsArchModalOpen(true)}
          />

          {/* Main Content Body (Sidebar + Scrollable Main View) */}
          <div className="flex-1 flex w-full">
            
            {/* Left Sticky Sidebar */}
            <Sidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeRole={activeRole}
              onOpenDiagnostic={() => setActiveTab('diagnostic')}
              onOpenZPD={() => setIsZpdModalOpen(true)}
              onOpenAiTutor={() => setIsZpdModalOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 p-4 lg:p-8 pb-16 lg:pb-24 min-w-0 max-w-[1700px] w-full mx-auto">
              
              {/* Toast Alert */}
              {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-fade">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{toastMsg}</span>
                </div>
              )}

              {/* Student Dashboard Overview View */}
              {activeRole === 'student' && activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade">
                  
                  {/* Hero Banner with 3D Pop-out Avatar */}
                  <HeroBanner 
                    currentUser={currentUser}
                    onStartMilestone={handleContinueMilestone}
                    onStartMockTest={() => setActiveTab('diagnostic')}
                    onOpenAiTutor={() => setIsZpdModalOpen(true)}
                  />

                  {/* 4 Core Metrics Cards */}
                  <MetricsGrid 
                    onOpenRadar={() => setIsRadarModalOpen(true)}
                    onOpenDAG={() => setIsRadarModalOpen(true)}
                    onOpenZPD={() => setIsZpdModalOpen(true)}
                    onOpenAnalytics={() => setIsRadarModalOpen(true)}
                  />

                  {/* Bottom 2 Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    <div className="lg:col-span-8 space-y-6">
                      <MilestoneCard 
                        onStartTask={handleStartTask}
                        onContinueMilestone={handleContinueMilestone}
                      />
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                      <LiveQnACard />
                      <AISocraticTutorWidget 
                        onOpenFullChat={() => setIsZpdModalOpen(true)}
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* Student Diagnostic Exam List View (Rendered inside Dashboard shell with Sidebar & Navbar intact) */}
              {activeTab === 'diagnostic' && (
                <DiagnosticAssessmentPage 
                  isEmbedded={true}
                  onNavigateDashboard={() => setActiveTab('dashboard')}
                  onNavigateHome={() => setCurrentPage('landing')}
                />
              )}

              {/* Teacher View */}
              {activeRole === 'teacher' && activeTab === 'dashboard' && (
                <TeacherDashboardView />
              )}

            </main>

          </div>

          {/* Full-Width Footer (Spans 100% horizontal width across bottom) */}
          <PublicFooter 
            onOpenLogin={() => setCurrentPage('login')}
            onOpenDiagnostic={() => setActiveTab('diagnostic')}
          />

        </div>
      )}

      {/* MODALS */}
      <AcademicArchitectureModal 
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <DiagnosticTestModal 
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        onCompleteTest={() => showToast("Đã cập nhật vector Theta 0 và mở khóa lộ trình!")}
      />

      <AdaptiveQuizModal 
        isOpen={isZpdModalOpen}
        onClose={() => setIsZpdModalOpen(false)}
      />

      <RadarChartModal 
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
      />

    </div>
  );
}
