import React, { useState } from 'react';
import confetti from 'canvas-confetti';

// Components grouped by module folder
import { Navbar, Sidebar } from './components/layout';
import { 
  HeroBanner, 
  MetricsGrid, 
  MilestoneCard, 
  LiveQnACard, 
  AISocraticTutorWidget, 
  TeacherDashboardView,
  CampusManagerDashboardView,
  ParentDashboardView
} from './components/dashboard';
import { PublicLandingPage } from './components/landing';
import { WebLoginPage } from './components/auth';
import { 
  AcademicArchitectureModal, 
  DiagnosticTestModal, 
  AdaptiveQuizModal, 
  RadarChartModal 
} from './components/modals';
import { DiagnosticAssessmentPage } from './components/diagnostic';
import { AccountProvisioningView } from './components/admin';
import { CheckCircle2, Globe, LogIn, LayoutDashboard, Sparkles, Brain, UserPlus, ShieldCheck } from 'lucide-react';
import authService from './services/authService';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(() => authService.getStoredUser());
  const [activeRole, setActiveRole] = useState(() => authService.getStoredUser()?.role || 'student');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isZpdModalOpen, setIsZpdModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentPage('login');
  };

  const handleLoginSuccess = (role, user) => {
    setActiveRole(role);
    const resolvedUser = user || authService.getStoredUser();
    setCurrentUser(resolvedUser);
    setCurrentPage('dashboard');
    const roleLabel = role === 'student' ? 'Học sinh' : 
                      role === 'parent' ? 'Phụ huynh' : 
                      role === 'teacher' ? 'Giáo viên Cơ sở' : 'Quản lý Học thuật Cơ sở / Admin';
    showToast(`Đã đăng nhập thành công với vai trò ${roleLabel}!`);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setCurrentPage('landing');
    showToast("Đã đăng xuất khỏi hệ thống.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Page Control Bar */}
      <div className="bg-slate-900 text-white px-4 lg:px-8 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold shadow-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-[10px]">
            ĐGNL
          </div>
          <span className="text-white text-sm font-extrabold tracking-tight">ĐGNL AI Portal (FA26SE090)</span>
          <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-[10px] rounded-md border border-cyan-400/30">
            v2.4 Live
          </span>
        </div>

        {/* Page Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentPage === 'landing' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Trang Chủ Công Khai (Landing Page)</span>
          </button>

          <button
            onClick={() => handleOpenAuth('login')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentPage === 'login' && authMode === 'login' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>

          <button
            onClick={() => handleOpenAuth('register')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentPage === 'login' && authMode === 'register' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-300" />
            <span>Đăng Ký Tài Khoản</span>
          </button>

          <button
            onClick={() => setCurrentPage('diagnostic')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentPage === 'diagnostic' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-300" />
            <span>Khảo Sát 30 Câu AI (Core Flow 1)</span>
          </button>

          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentPage === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Trang Chủ Học Viên (Dashboard)</span>
          </button>

          <button
            onClick={() => setCurrentPage('provision')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              currentPage === 'provision' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>Cấp Tài Khoản (IAM)</span>
          </button>
        </div>
      </div>

      {/* PAGE ROUTING */}
      {currentPage === 'landing' && (
        <PublicLandingPage 
          currentUser={currentUser}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenRegister={() => handleOpenAuth('register')}
          onOpenDiagnostic={() => setCurrentPage('diagnostic')}
          onOpenDashboard={() => setCurrentPage('dashboard')}
          onOpenArchModal={() => setIsArchModalOpen(true)}
        />
      )}

      {currentPage === 'diagnostic' && (
        <DiagnosticAssessmentPage 
          onNavigateDashboard={() => setCurrentPage('dashboard')}
          onNavigateHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'login' && (
        <WebLoginPage 
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'dashboard' && (
        <div className="flex-1 flex flex-col bg-[#F4F7FC] text-slate-900">
          
          {/* Dashboard Header */}
          <Navbar 
            currentUser={currentUser}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            onLogout={handleLogout}
            onOpenAuthModal={() => setCurrentPage('login')}
            onOpenArchModal={() => setIsArchModalOpen(true)}
            onOpenProvision={() => setCurrentPage('provision')}
          />

          {/* Main Dashboard Container */}
          <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
            
            {/* Sidebar */}
            <Sidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeRole={activeRole}
              onOpenDiagnostic={() => setCurrentPage('diagnostic')}
              onOpenZPD={() => setIsZpdModalOpen(true)}
              onOpenAiTutor={() => setIsZpdModalOpen(true)}
              onOpenProvision={() => setCurrentPage('provision')}
            />

            {/* Main Content Area */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-full">
              
              {/* Toast Alert */}
              {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-fade">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{toastMsg}</span>
                </div>
              )}

              {/* Student View */}
              {activeRole === 'student' && (
                <div className="space-y-6 animate-fade">
                  
                  {/* Hero Banner with 3D Pop-out Avatar */}
                  <HeroBanner 
                    currentUser={currentUser}
                    onStartMilestone={handleContinueMilestone}
                    onStartMockTest={() => setCurrentPage('diagnostic')}
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 space-y-6">
                      <MilestoneCard 
                        currentUser={currentUser}
                        onStartTask={handleStartTask}
                        onContinueMilestone={handleContinueMilestone}
                        onStartDiagnostic={() => setCurrentPage('diagnostic')}
                      />
                    </div>

                    <div className="space-y-6">
                      <LiveQnACard />
                      <AISocraticTutorWidget 
                        onOpenFullChat={() => setIsZpdModalOpen(true)}
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* Teacher View */}
              {activeRole === 'teacher' && (
                <TeacherDashboardView />
              )}

              {/* Campus Manager / Admin View */}
              {(activeRole === 'manager' || activeRole === 'admin') && (
                <CampusManagerDashboardView onOpenProvisionPage={() => setCurrentPage('provision')} />
              )}

              {/* Parent View */}
              {activeRole === 'parent' && (
                <ParentDashboardView />
              )}

            </main>

          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200/80 px-4 py-3 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between max-w-[1700px] w-full mx-auto">
            <div>
              <strong className="text-slate-700">ĐGNL AI Portal</strong> • Phân hệ v2.4 (Build IRT-Adaptive) • ĐGNL ĐHQG TP.HCM
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
              <span>Ban Học thuật: <strong className="text-blue-600">academic@dgnl.edu.vn</strong></span>
              <span>© 2026 Trung tâm Đào tạo & Khoa học Thi Thích ứng</span>
            </div>
          </footer>

        </div>
      )}

      {/* ACCOUNT PROVISIONING & ROLE MANAGEMENT PAGE (IAM) */}
      {currentPage === 'provision' && (
        <div className="flex-1 flex flex-col bg-[#F4F7FC] text-slate-900 min-h-screen">
          <Navbar 
            currentUser={currentUser}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            onLogout={handleLogout}
            onOpenAuthModal={() => setCurrentPage('login')}
            onOpenArchModal={() => setIsArchModalOpen(true)}
            onOpenProvision={() => setCurrentPage('provision')}
          />
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <AccountProvisioningView onBackToDashboard={() => setCurrentPage('dashboard')} />
          </main>
          <footer className="bg-white border-t border-slate-200/80 px-4 py-3 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between max-w-[1700px] w-full mx-auto">
            <div>
              <strong className="text-slate-700">ĐGNL AI Portal</strong> • Phân Hệ Quản Trị Cán Bộ & Cấp Quyền (IAM)
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
              <span>Ban Quản Trị: <strong className="text-blue-600">admin@veval.edu.vn</strong></span>
              <span>© 2026 Trung tâm Đào tạo & Khoa học Thi Thích ứng</span>
            </div>
          </footer>
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
