import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Components grouped by module folder
import { Navbar, Sidebar } from './components/layout';
import {
  HeroBanner,
  MetricsGrid,
  MilestoneCard,
  LiveQnACard,
  TeacherDashboardView,
  CampusManagerDashboardView,
  ParentDashboardView,
  LearningAnalyticsView,
  ScorePredictionPanel,
  MistakeNotebookSM2View
} from './components/dashboard';
import { PublicLandingPage } from './components/landing';
import { WebLoginPage } from './components/auth';
import {
  AcademicArchitectureModal,
  DiagnosticTestModal,
  AdaptiveQuizModal,
  RadarChartModal,
  AISocraticTutorModal
} from './components/modals';
import { DiagnosticAssessmentPage, SubmissionHistoryView } from './components/diagnostic';
import { AccountProvisioningView } from './components/admin';
import { CurriculumExplorerView } from './components/curriculum';
import { TuitionPaymentView } from './components/payment';
import { CheckCircle2, Bot } from 'lucide-react';
import authService from './services/authService';
import { practiceService } from './services/practiceService';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(() => authService.getStoredUser());
  const [activeRole, setActiveRole] = useState(() => authService.getStoredUser()?.role || 'student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentDashboard, setStudentDashboard] = useState(null);

  // Modals
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isZpdModalOpen, setIsZpdModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isAiTutorModalOpen, setIsAiTutorModalOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState(null);

  const refreshStudentAnalytics = useCallback(async () => {
    try {
      const data = await practiceService.getStudentDashboard(currentUser?.id);
      setStudentDashboard(data);
    } catch {
      // resilient fallback handled inside practiceService
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshStudentAnalytics();
  }, [refreshStudentAnalytics]);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'analytics') {
      refreshStudentAnalytics();
    }
  }, [activeTab, refreshStudentAnalytics]);

  useEffect(() => {
    const handleSubmissionUpdated = () => {
      refreshStudentAnalytics();
    };
    window.addEventListener('veval:submission-updated', handleSubmissionUpdated);
    return () => window.removeEventListener('veval:submission-updated', handleSubmissionUpdated);
  }, [refreshStudentAnalytics]);

  const handleOpenAiTutor = (context = null) => {
    setTutorContext(context);
    setIsAiTutorModalOpen(true);
  };

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
    const roleLabel =
      role === 'student'
        ? 'Học sinh'
        : role === 'parent'
          ? 'Phụ huynh'
          : role === 'teacher'
            ? 'Giáo viên Cơ sở'
            : 'Quản lý Học thuật Cơ sở / Admin';
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
    showToast('Đã đăng xuất khỏi hệ thống.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* PAGE ROUTING */}
      {currentPage === 'landing' && (
        <PublicLandingPage
          currentUser={currentUser}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenRegister={() => handleOpenAuth('register')}
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
          onNavigateDashboard={() => setCurrentPage('dashboard')}
          onNavigateHome={() => setCurrentPage('landing')}
          onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
          onCompleteDiagnostic={() => refreshStudentAnalytics()}
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
            studentDashboard={studentDashboard}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            onLogout={handleLogout}
            onOpenAuthModal={() => setCurrentPage('login')}
            onOpenArchModal={() => setIsArchModalOpen(true)}
            onOpenProvision={() => setCurrentPage('provision')}
            onNavigateAlerts={() =>
              setActiveTab(activeRole === 'student' ? 'analytics' : 'dashboard')
            }
          />

          {/* Main Dashboard Container */}
          <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
            {/* Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeRole={activeRole}
              studentDashboard={studentDashboard}
              onOpenDiagnostic={() => setActiveTab('diagnostic')}
              onOpenZPD={() => setIsZpdModalOpen(true)}
              onOpenAiTutor={() => handleOpenAiTutor(null)}
              onOpenProvision={() => setCurrentPage('provision')}
              onOpenTuition={() => setActiveTab('tuition')}
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

              {/* Tab Dàn Kiến Thức & Lộ Trình (Curriculum Explorer) / Tab Routing */}
              {activeTab === 'roadmap' ? (
                <CurriculumExplorerView
                  onStartQuizModal={() => setIsZpdModalOpen(true)}
                  onNavigateDiagnostic={() => setActiveTab('diagnostic')}
                  onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
                />
              ) : activeTab === 'diagnostic' ? (
                <DiagnosticAssessmentPage
                  embedded={true}
                  onNavigateDashboard={() => setActiveTab('dashboard')}
                  onNavigateHome={() => setActiveTab('dashboard')}
                  onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
                  onCompleteDiagnostic={() => refreshStudentAnalytics()}
                />
              ) : activeTab === 'history' || activeTab === 'question_bank' ? (
                <SubmissionHistoryView
                  onStartNewDiagnostic={() => setActiveTab('diagnostic')}
                  onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
                />
              ) : activeTab === 'mistakes_sm2' ? (
                <MistakeNotebookSM2View
                  currentUser={currentUser}
                  onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
                />
              ) : activeTab === 'analytics' ? (
                <LearningAnalyticsView
                  currentUser={currentUser}
                  activeRole={activeRole}
                  initialData={studentDashboard}
                  onStartDiagnostic={() => setActiveTab('diagnostic')}
                  onOpenRoadmap={() => setActiveTab('roadmap')}
                  onOpenZPD={() => setIsZpdModalOpen(true)}
                  onOpenHistory={() => setActiveTab('history')}
                  onOpenMistakesSM2={() => setActiveTab('mistakes_sm2')}
                  onOpenAiTutor={(ctx) => handleOpenAiTutor(ctx)}
                  onNavigateRoleDashboard={() => setActiveTab('dashboard')}
                />
              ) : activeTab === 'tuition' ? (
                <TuitionPaymentView 
                  currentUser={currentUser}
                  onNavigateRoadmap={() => setActiveTab('roadmap')}
                  showToast={showToast}
                />
              ) : (
                <>
                  {/* Student View */}
                  {activeRole === 'student' && (
                    <div className="space-y-6 animate-fade">
                      {/* Hero Banner with 3D Pop-out Avatar */}
                      <HeroBanner
                        currentUser={currentUser}
                        studentDashboard={studentDashboard}
                        onStartMilestone={handleContinueMilestone}
                        onStartMockTest={() => setActiveTab('diagnostic')}
                        onOpenAiTutor={() => handleOpenAiTutor(null)}
                      />

                      {/* 4 Core Metrics Cards */}
                      <MetricsGrid
                        studentDashboard={studentDashboard}
                        onOpenRadar={() => setIsRadarModalOpen(true)}
                        onOpenDAG={() => setActiveTab('roadmap')}
                        onOpenZPD={() => setIsZpdModalOpen(true)}
                        onOpenAnalytics={() => setActiveTab('analytics')}
                      />

                      {/* Bottom 2 Column Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                          <MilestoneCard
                            currentUser={currentUser}
                            studentDashboard={studentDashboard}
                            onStartTask={handleStartTask}
                            onContinueMilestone={handleContinueMilestone}
                            onStartDiagnostic={() => setActiveTab('diagnostic')}
                          />
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                          <ScorePredictionPanel
                            studentId={currentUser?.id}
                            mode="compact"
                            onOpenFullForecast={() => setActiveTab('analytics')}
                            onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
                          />
                          <LiveQnACard />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher View */}
                  {activeRole === 'teacher' && <TeacherDashboardView currentUser={currentUser} />}

                  {/* Campus Manager / Admin View */}
                  {(activeRole === 'manager' || activeRole === 'admin') && (
                    <CampusManagerDashboardView
                      currentUser={currentUser}
                      onOpenProvisionPage={() => setCurrentPage('provision')}
                    />
                  )}

                  {/* Parent View */}
                  {activeRole === 'parent' && (
                    <ParentDashboardView
                      currentUser={currentUser}
                      onNavigateTuition={() => setActiveTab('tuition')}
                    />
                  )}
                </>
              )}
            </main>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200/80 px-4 py-3 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between max-w-[1700px] w-full mx-auto">
            <div>
              <strong className="text-slate-700">ĐGNL AI Portal</strong> • Hệ thống ôn luyện & dự báo điểm thi ĐGNL ĐHQG TP.HCM
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
              <span>
                Hỗ trợ học tập: <strong className="text-blue-600">academic@dgnl.edu.vn</strong>
              </span>
              <span>© 2026 Trung tâm Luyện thi Đánh giá Năng lực</span>
            </div>
          </footer>
        </div>
      )}

      {/* ACCOUNT PROVISIONING & ROLE MANAGEMENT PAGE (IAM) */}
      {currentPage === 'provision' && (
        <div className="flex-1 flex flex-col bg-[#F4F7FC] text-slate-900 min-h-screen">
          <Navbar
            currentUser={currentUser}
            studentDashboard={studentDashboard}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            onLogout={handleLogout}
            onOpenAuthModal={() => setCurrentPage('login')}
            onOpenArchModal={() => setIsArchModalOpen(true)}
            onOpenProvision={() => setCurrentPage('provision')}
            onNavigateAlerts={() =>
              setActiveTab(activeRole === 'student' ? 'analytics' : 'dashboard')
            }
          />
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <AccountProvisioningView onBackToDashboard={() => setCurrentPage('dashboard')} />
          </main>
          <footer className="bg-white border-t border-slate-200/80 px-4 py-3 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between max-w-[1700px] w-full mx-auto">
            <div>
              <strong className="text-slate-700">ĐGNL AI Portal</strong> • Phân Hệ Quản Trị Cán Bộ & Cấp Quyền (IAM)
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
              <span>
                Ban Quản Trị: <strong className="text-blue-600">admin@veval.edu.vn</strong>
              </span>
              <span>© 2026 Trung tâm Đào tạo & Khoa học Thi Thích ứng</span>
            </div>
          </footer>
        </div>
      )}

      {/* MODALS */}
      <AcademicArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />

      <DiagnosticTestModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        onCompleteTest={() => {
          showToast('Đã lưu kết quả bài kiểm tra và cập nhật lộ trình học!');
          refreshStudentAnalytics();
        }}
      />

      <AdaptiveQuizModal
        isOpen={isZpdModalOpen}
        onClose={() => {
          setIsZpdModalOpen(false);
          refreshStudentAnalytics();
        }}
        onOpenAiTutorWithContext={(ctx) => handleOpenAiTutor(ctx)}
      />

      <RadarChartModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        studentDashboard={studentDashboard}
        onOpenFullAnalytics={() => setActiveTab('analytics')}
      />

      <AISocraticTutorModal
        isOpen={isAiTutorModalOpen}
        onClose={() => {
          setIsAiTutorModalOpen(false);
          setTutorContext(null);
        }}
        initialContext={tutorContext}
      />

      {/* Sleek Floating AI Tutor FAB (Bottom-Right Corner) */}
      {currentPage === 'dashboard' && activeRole === 'student' && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-bold shadow-xl border border-slate-700/80 backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hỏi Gia sư AI</span>
          </div>

          <button
            onClick={() => handleOpenAiTutor(null)}
            className="relative group p-4 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-blue-500/40 hover:shadow-indigo-500/60 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white/20 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-400/40"
            title="Hỏi Gia sư AI giải đáp bài tập 24/7"
            aria-label="Hỏi Gia sư AI"
          >
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-40 blur-sm group-hover:opacity-80 transition duration-300 animate-pulse pointer-events-none" />
            <Bot className="w-7 h-7 relative z-10 text-white group-hover:rotate-6 transition-transform" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-20 shadow-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
