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
  TeacherDashboardView,
  DiagnosticExamModal
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
import { RoadmapLearningPage } from './components/roadmap';
import { 
  CheckCircle2, 
  Globe, 
  LogIn, 
  LayoutDashboard, 
  Sparkles, 
  Brain, 
  X, 
  Target, 
  ArrowRight,
  Zap
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [activeRole, setActiveRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [isExamActive, setIsExamActive] = useState(false);
  
  // Direct exam launch & Auth navigation states
  const [diagnosticAutoStart, setDiagnosticAutoStart] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState('login');
  const [loginRedirectNotice, setLoginRedirectNotice] = useState(null);
  const [pendingExamPrompt, setPendingExamPrompt] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isZpdModalOpen, setIsZpdModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isExamPasscodeModalOpen, setIsExamPasscodeModalOpen] = useState(false);
  const [diagnosticExamCode, setDiagnosticExamCode] = useState('VACT2026');

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

      // Check if there is an unfinished exam intent in session
      try {
        const rawIntent = sessionStorage.getItem('veval_pending_exam_intent');
        if (rawIntent) {
          setPendingExamPrompt(JSON.parse(rawIntent));
        }
      } catch (err) {
        console.warn('Error reading exam intent from session', err);
      }
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleStartTask = (task) => {
    if (task.type === 'quiz' || task.type === 'video') {
      setActiveTab('roadmap');
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
    setActiveTab('roadmap');
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

    // 1. Check if user completed an exam as guest and just logged in
    try {
      const rawResult = sessionStorage.getItem('veval_pending_exam_result');
      if (rawResult) {
        const parsed = JSON.parse(rawResult);
        sessionStorage.removeItem('veval_pending_exam_result');
        sessionStorage.removeItem('veval_pending_exam_intent');
        const thetaStr = parsed.theta0 != null ? ` (Theta = ${parsed.theta0 > 0 ? '+' : ''}${Number(parsed.theta0).toFixed(2)})` : '';
        showToast(`🎉 Đã liên kết kết quả bài khảo sát${thetaStr} vào học bạ cá nhân của bạn!`);
        return;
      }
    } catch (err) {
      console.warn('Error reading exam result from session', err);
    }

    // 2. Check if user came from Exam entry popup intent (has not taken exam yet)
    try {
      const rawIntent = sessionStorage.getItem('veval_pending_exam_intent');
      if (rawIntent) {
        setPendingExamPrompt(JSON.parse(rawIntent));
      }
    } catch (err) {
      console.warn('Error reading exam intent from session', err);
    }
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

  const handleOpenDashboard = () => {
    const savedUser = tokenStorage.getUser();
    const token = tokenStorage.getAccessToken();
    if (!savedUser && !token && !currentUser) {
      setLoginInitialMode('login');
      setLoginRedirectNotice('🔒 Khách chưa đăng nhập. Vui lòng đăng nhập hoặc tạo tài khoản để truy cập Bảng điều khiển (Dashboard) và Lộ trình học!');
      setCurrentPage('login');
      showToast("🔒 Bạn cần đăng nhập để truy cập Dashboard!");
      return;
    }
    setCurrentPage('dashboard');
  };

  // Route Guard: Prevent unauthenticated guests from entering dashboard
  useEffect(() => {
    if (currentPage === 'dashboard') {
      const savedUser = tokenStorage.getUser();
      const token = tokenStorage.getAccessToken();
      if (!savedUser && !token && !currentUser) {
        setLoginInitialMode('login');
        setLoginRedirectNotice('🔒 Khách chưa đăng nhập. Vui lòng đăng nhập để truy cập Dashboard cá nhân hóa!');
        setCurrentPage('login');
        showToast("🔒 Khách không thể vào Dashboard. Vui lòng đăng nhập trước!");
      }
    }
  }, [currentPage, currentUser]);

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
          onOpenLogin={({ mode, notice } = {}) => {
            setLoginInitialMode(mode || 'login');
            setLoginRedirectNotice(notice || null);
            setCurrentPage('login');
          }}
          onOpenDiagnostic={() => {
            setDiagnosticAutoStart(true);
            setCurrentPage('diagnostic');
          }}
          onStartGuestExam={({ examCode, autoStart } = {}) => {
            setDiagnosticAutoStart(true);
            setCurrentPage('diagnostic');
          }}
          onOpenDashboard={handleOpenDashboard}
          onOpenArchModal={() => setIsArchModalOpen(true)}
          currentUser={currentUser}
        />
      )}

      {currentPage === 'diagnostic' && (
        <DiagnosticAssessmentPage 
          isEmbedded={false}
          autoStart={diagnosticAutoStart}
          currentUser={currentUser}
          onNavigateLogin={() => {
            setLoginInitialMode('login');
            setLoginRedirectNotice('🎯 Đăng nhập hoặc tạo tài khoản để lưu kết quả bài khảo sát năng lực 30 câu!');
            setCurrentPage('login');
          }}
          onNavigateDashboard={() => {
            setCurrentPage('dashboard');
            setActiveTab('roadmap');
            showToast("🎉 Đã lưu kết quả bài kiểm tra năng lực và kích hoạt Lộ trình học thích ứng (DAG)!");
          }}
          onNavigateHome={() => {
            setDiagnosticAutoStart(false);
            setCurrentPage('landing');
          }}
        />
      )}

      {currentPage === 'login' && (
        <WebLoginPage 
          initialMode={loginInitialMode}
          redirectNotice={loginRedirectNotice}
          onLoginSuccess={handleLoginSuccess} 
          onNavigateHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'dashboard' && (
        <div className="min-h-screen flex flex-col bg-[#F4F7FC] text-slate-900">
          
          {/* Top Sticky Header */}
          {!isExamActive && (
            <Navbar 
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenAuthModal={() => setCurrentPage('login')}
              onOpenArchModal={() => setIsArchModalOpen(true)}
              onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onOpenDiagnostic={() => setIsExamPasscodeModalOpen(true)}
            />
          )}

          {/* Main Content Body (Sidebar + Scrollable Main View) */}
          <div className="flex-1 flex w-full">
            
            {/* Left Sticky Sidebar (Desktop + Mobile Slide-over Drawer) */}
            {!isExamActive && (
              <Sidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeRole={activeRole}
                onOpenDiagnostic={() => setActiveTab('diagnostic')}
                onOpenZPD={() => setIsZpdModalOpen(true)}
                onOpenAiTutor={() => setIsZpdModalOpen(true)}
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            )}

            {/* Main Content Area */}
            <main className={`flex-1 min-w-0 w-full ${isExamActive ? 'p-0 max-w-none' : activeTab === 'diagnostic' ? 'px-4 lg:px-8 pt-2 sm:pt-3 pb-16 lg:pb-24 max-w-[1700px] mx-auto' : 'p-4 lg:p-8 pb-16 lg:pb-24 max-w-[1700px] mx-auto'}`}>
              
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

              {/* Student Diagnostic Exam List View (Rendered full-screen during exam, or inside lobby) */}
              {activeTab === 'diagnostic' && (
                <DiagnosticAssessmentPage 
                  isEmbedded={!isExamActive}
                  autoStart={diagnosticAutoStart}
                  examCode={diagnosticExamCode}
                  currentUser={currentUser}
                  onExamStateChange={setIsExamActive}
                  onNavigateDashboard={() => {
                    setIsExamActive(false);
                    setDiagnosticAutoStart(false);
                    setActiveTab('roadmap');
                    showToast("🎉 Chúc mừng bạn đã hoàn thành bài kiểm tra đầu vào! Lộ trình học thích ứng đã sẵn sàng.");
                  }}
                  onNavigateHome={() => {
                    setIsExamActive(false);
                    setDiagnosticAutoStart(false);
                    setCurrentPage('landing');
                  }}
                />
              )}

              {/* Student Personalized Roadmap Learning View (Flow 2: DAG & Topological Milestones) */}
              {activeTab === 'roadmap' && (
                <RoadmapLearningPage 
                  onNavigateDiagnostic={() => setActiveTab('diagnostic')}
                  onNavigateDashboard={() => setActiveTab('dashboard')}
                />
              )}

              {/* Teacher View */}
              {activeRole === 'teacher' && activeTab === 'dashboard' && (
                <TeacherDashboardView />
              )}

            </main>

          </div>

          {/* Full-Width Footer (Spans 100% horizontal width across bottom) */}
          {!isExamActive && (
            <PublicFooter 
              onOpenLogin={() => setCurrentPage('login')}
              onOpenDiagnostic={() => setActiveTab('diagnostic')}
            />
          )}

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

      {/* DIRECT 30-QUESTION DIAGNOSTIC EXAM ENTRY MODAL */}
      <DiagnosticExamModal 
        isOpen={isExamPasscodeModalOpen}
        onClose={() => setIsExamPasscodeModalOpen(false)}
        currentUser={currentUser}
        isLoggedIn={true}
        cancelLabel="Hủy / Ở Lại Dashboard"
        onStartExam={(code) => {
          setIsExamPasscodeModalOpen(false);
          setDiagnosticExamCode(code);
          setDiagnosticAutoStart(true);
          setIsExamActive(true);
          setActiveTab('diagnostic');
        }}
      />

      {/* PENDING EXAM RESUME ACTION PROMPT MODAL */}
      <AnimatePresence>
        {pendingExamPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
            >
              {/* Top Banner */}
              <div className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-black text-[#FACC15] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Nhắc Nhở Khảo Thí</span>
                    </div>
                    <h3 className="text-xl font-black text-white leading-snug">
                      Sẵn Sàng Làm Bài Khảo Sát Đầu Vào?
                    </h3>
                    <p className="text-xs text-blue-100 font-medium">
                      Chào mừng {currentUser?.fullName || 'bạn'}! Bạn đã đăng nhập thành công. Hãy tiếp tục làm bài thi để lưu kết quả vào học bạ.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('veval_pending_exam_intent');
                      setPendingExamPrompt(null);
                    }}
                    className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>{pendingExamPrompt.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu)'}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Hoàn thành 30 câu khảo sát để động cơ <strong className="text-blue-700">IRT 2PL</strong> tính toán tham số năng lực khởi điểm <strong className="text-blue-700">$\theta_0$</strong>, xếp lớp và tự động kích hoạt <strong className="text-indigo-700">Lộ Trình Học Thích Ứng (Flow 2 - DAG)</strong> cá nhân hóa cho bạn!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('veval_pending_exam_intent');
                      setPendingExamPrompt(null);
                      setDiagnosticAutoStart(true);
                      setCurrentPage('diagnostic');
                    }}
                    className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>🚀 Vào Làm Bài Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('veval_pending_exam_intent');
                      setPendingExamPrompt(null);
                    }}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    <span>Để Sau</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
