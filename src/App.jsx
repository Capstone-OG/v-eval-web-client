import React, { useState, useEffect } from 'react';
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
import { WebLoginPage } from './components/auth';
import { 
  AcademicArchitectureModal, 
  DiagnosticTestModal, 
  AdaptiveQuizModal, 
  RadarChartModal 
} from './components/modals';
import { DiagnosticAssessmentPage } from './components/diagnostic';
import { CheckCircle2, Globe, LogIn, LayoutDashboard, Sparkles, Brain } from 'lucide-react';

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

  const handleLoginSuccess = (role, userData) => {
    const targetRole = role || 'student';
    setActiveRole(targetRole);
    if (userData?.user) {
      setCurrentUser(userData.user);
    }
    setCurrentPage('dashboard');
    const roleName = targetRole === 'student' ? 'Học sinh' : targetRole === 'teacher' ? 'Giáo viên' : targetRole === 'manager' ? 'Quản lý' : 'Phụ huynh';
    const nameDisplay = userData?.user?.fullName ? ` (${userData.user.fullName})` : '';
    showToast(`Đã xác thực thành công với vai trò ${roleName}${nameDisplay}!`);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setCurrentUser(null);
    setCurrentPage('login');
    showToast("Đã đăng xuất khỏi hệ thống.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* PAGE ROUTING */}
      {currentPage === 'landing' && (
        <PublicLandingPage 
          onOpenLogin={() => setCurrentPage('login')}
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
          onLoginSuccess={handleLoginSuccess} 
          onNavigateHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'dashboard' && (
        <div className="flex-1 flex flex-col bg-[#F4F7FC] text-slate-900">
          
          {/* Dashboard Header */}
          <Navbar 
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenAuthModal={() => setCurrentPage('login')}
            onOpenArchModal={() => setIsArchModalOpen(true)}
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
                        onStartTask={handleStartTask}
                        onContinueMilestone={handleContinueMilestone}
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
