import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  CreditCard,
  Crown,
  GraduationCap,
  HeartHandshake,
  History,
  LayoutGrid,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import MobileSidebar from './components/layout/MobileSidebar';
import { accountGreeting } from './utils/accountPresentation';
import Navbar from './components/layout/Navbar';
import HeroBanner from './components/dashboard/HeroBanner';
import DiagnosticOnboardingCard from './components/dashboard/DiagnosticOnboardingCard';
import MetricsGrid from './components/dashboard/MetricsGrid';
import MilestoneCard from './components/dashboard/MilestoneCard';
import LiveQnACard from './components/dashboard/LiveQnACard';
import StudentParentLinkCard from './components/dashboard/StudentParentLinkCard';
import ParentDashboardView from './components/dashboard/ParentDashboardView';
import TeacherDashboardView from './components/dashboard/TeacherDashboardView';
import TeacherPortalView from './components/dashboard/TeacherPortalView';
import CampusManagerDashboardView from './components/dashboard/CampusManagerDashboardView';
import LearningAnalyticsView from './components/dashboard/LearningAnalyticsView';
import PublicLandingPage from './components/landing/PublicLandingPage';
import WebLoginPage from './components/auth/WebLoginPage';
import AccountProvisioningView from './components/admin/AccountProvisioningView';
import DiagnosticAssessmentPage from './components/diagnostic/DiagnosticAssessmentPage';
import SubmissionHistoryView from './components/diagnostic/SubmissionHistoryView';
import StudentHistoryPage from './components/diagnostic/StudentHistoryPage';
import AccountSettingsPage from './components/settings/AccountSettingsPage';
import CurriculumExplorerView from './components/curriculum/CurriculumExplorerView';
import TuitionPaymentView from './components/payment/TuitionPaymentView';
import {
  AdaptiveQuizModal,
  DiagnosticTestModal,
  RadarChartModal,
  AcademicArchitectureModal,
  AISocraticTutorModal
} from './components/modals';
import { authService } from './services/authService';
import { Bot, CheckCircle2 } from 'lucide-react';
import { ScorePredictionPanel, MistakeNotebookSM2View } from './components/dashboard';
import { practiceService } from './services/practiceService';
import { userService } from './services/userService';
import { tokenStorage } from './services/apiClient';

const ROLE_PORTAL_DEFINITIONS = {
  student: {
    code: 'STUDENT PORTAL',
    title: 'Không Gian Học Viên ĐGNL Cá Nhân Hóa',
    subtitle: 'Đo lường năng lực IRT 2PL, Lộ trình thích ứng ZPD & Gia sư AI Socratic 24/7',
    defaultTab: 'dashboard',
    icon: GraduationCap,
    accentBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan Học tập', icon: LayoutGrid },
      { id: 'diagnostic', label: 'Khảo thí 30 câu', icon: ClipboardCheck },
      { id: 'history', label: 'Lịch sử & Lỗi sai', icon: History },
      { id: 'roadmap', label: 'Cây tri thức & Lộ trình', icon: Network },
      { id: 'analytics', label: 'Báo cáo & Dự báo', icon: BarChart3 },
      { id: 'tuition', label: 'Học phí & Gói học', icon: CreditCard }
    ]
  },
  parent: {
    code: 'PARENT COMPANION PORTAL',
    title: 'Cổng Phụ Huynh Đồng Hành Cùng Con',
    subtitle: 'Theo dõi chỉ số sẵn sàng thi R_exam, kỷ luật tự học 12h/tuần & Thanh toán học phí VietQR',
    defaultTab: 'dashboard',
    icon: HeartHandshake,
    accentBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan Đồng hành', icon: HeartHandshake },
      { id: 'analytics', label: 'Năng lực 4 Miền của Con', icon: TrendingUp },
      { id: 'history', label: 'Lịch sử Bài thi của Con', icon: History },
      { id: 'roadmap', label: 'Tiến độ Chuyên đề', icon: Network },
      { id: 'tuition', label: 'Đóng Học phí PayOS', icon: CreditCard }
    ]
  },
  teacher: {
    code: 'TEACHER PEDAGOGICAL PORTAL',
    title: 'Cổng Giảng Viên & Studio Sư Phạm ĐGNL',
    subtitle: 'Ma trận nhiệt lớp học 2D, Xếp nhóm vi mô BKT & Studio biên soạn câu hỏi LaTeX',
    defaultTab: 'dashboard',
    icon: BookOpen,
    accentBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan giảng dạy', icon: LayoutGrid },
      { id: 'teacher_heatmap', label: 'Lớp học & bản đồ năng lực', icon: Users },
      { id: 'roadmap', label: 'Studio Biên soạn Học liệu', icon: BookOpen },
      { id: 'diagnostic', label: 'Ngân hàng đề thi', icon: ClipboardCheck },
      { id: 'history', label: 'Nhật ký Bài làm Học viên', icon: History },
      { id: 'analytics', label: 'Cảnh báo & hỗ trợ', icon: BarChart3 }
    ]
  },
  manager: {
    code: 'CAMPUS MANAGER PORTAL',
    title: 'Cổng Quản Lý Học Thuật Cơ Sở',
    subtitle: 'Điều phối đào tạo đa lớp, Phân cụm học viên AI Clustering & Cấp phát nhân sự cơ sở',
    defaultTab: 'dashboard',
    icon: Briefcase,
    accentBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    tabs: [
      { id: 'dashboard', label: 'So sánh Cơ sở', icon: Building2 },
      { id: 'teacher_heatmap', label: 'Ma trận Lớp học', icon: LayoutGrid },
      { id: 'roadmap', label: 'Khung Chương trình', icon: Network },
      { id: 'provision', label: 'Cấp phát Tài khoản', icon: UserPlus },
      { id: 'analytics', label: 'Báo cáo Chất lượng', icon: BarChart3 }
    ]
  },
  admin: {
    code: 'SYSTEM IAM ADMIN PORTAL',
    title: 'Cổng Quản Trị Viên Hệ Thống & Định Danh IAM',
    subtitle: 'Quản trị tài khoản đa vai trò PostgreSQL Direct, Giám sát liên cơ sở & Đối soát PayOS',
    defaultTab: 'provision',
    icon: ShieldCheck,
    accentBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    tabs: [
      { id: 'provision', label: 'Quản trị Định danh IAM', icon: ShieldCheck },
      { id: 'dashboard', label: 'Giám sát Đa Cơ sở', icon: Building2 },
      { id: 'teacher_heatmap', label: 'Ma trận Nhiệt Hệ thống', icon: LayoutGrid },
      { id: 'roadmap', label: 'Cây Tri thức Quốc gia', icon: Network },
      { id: 'tuition', label: 'Đối soát Cổng PayOS', icon: CreditCard }
    ]
  }
};

export default function App() {
  // Check existing token in localStorage to restore session
  const [mobileNavigation, setMobileNavigation] = useState(false);
  const closeNavigation = useCallback(() => setMobileNavigation(false), []);
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // View State: 'landing' (Public Home), 'login' (Web Auth), 'dashboard' (Dedicated Role Portal)
  const [appView, setAppView] = useState(() =>
    authService.isAuthenticated() ? 'dashboard' : 'landing'
  );
  const [authInitialMode, setAuthInitialMode] = useState('login');

  // Role State ('student' | 'parent' | 'teacher' | 'manager' | 'admin')
  const [role, setRole] = useState(() => {
    const savedUser = authService.getCurrentUser();
    return authService.resolveAppRole(savedUser);
  });

  // Active Tab inside the current role's portal
  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = authService.getCurrentUser();
    const initialRole = authService.resolveAppRole(savedUser);
    return ROLE_PORTAL_DEFINITIONS[initialRole]?.defaultTab || 'dashboard';
  });

  // Latest diagnostic assessment result
  const [latestDiagnosticResult, setLatestDiagnosticResult] = useState(null);

  // Interactive Modal States: 'adaptive' | 'mock' | 'ai' | 'radar' | null
  const [activeModal, setActiveModal] = useState(null);
  const [aiTutorInitialContext, setAiTutorInitialContext] = useState(null);

  // Real Backend Portal Metrics State
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [parentPortalData, setParentPortalData] = useState(null);
  const [teacherHeatmapData, setTeacherHeatmapData] = useState(null);
  const [managerPortalData, setManagerPortalData] = useState(null);
  const [campusesCount, setCampusesCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const loadRolePortalBackendMetrics = useCallback(async (activeRole, userObj) => {
    if (!authService.isAuthenticated()) return;
    const uid = userObj?.id || userObj?.userId;

    try {
      if (activeRole === 'student') {
        const dash = await practiceService.getStudentDashboard(uid);
        setStudentDashboard(dash);
      } else if (activeRole === 'parent') {
        const pData = await practiceService.getParentDashboard(uid);
        setParentPortalData(pData);
      } else if (activeRole === 'teacher') {
        // TeacherPortalView loads scoped live data; do not substitute a default class.
        setTeacherHeatmapData(null);
      } else if (activeRole === 'manager' || activeRole === 'admin') {
        const [campusesRes, campusHm, usersRes] = await Promise.all([
          userService.getCampuses().catch(() => []),
          practiceService.getCampusComparativeHeatmap(userObj?.campusId).catch(() => null),
          userService.getUsers({ page: 1, pageSize: 50 }).catch(() => ({ items: [], totalCount: 0 }))
        ]);
        const cList = Array.isArray(campusesRes) ? campusesRes : [];
        const uList = Array.isArray(usersRes?.items) ? usersRes.items : [];
        setCampusesCount(cList.length);
        setManagerPortalData(campusHm);
        setTotalUsersCount(Number(usersRes?.totalCount ?? uList.length));
        setTeachersCount(
          uList.filter((u) => (u.roles || []).some((r) => String(r).toUpperCase().includes('TEACHER'))).length
        );
      }
    } catch (err) {
      console.warn('[App] Could not fetch role portal metrics:', err?.message);
    }
  }, []);

  // Sync authenticated user profile and real Backend metrics on mount & submission updates
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    let isMounted = true;
    authService
      .fetchCurrentUserProfile()
      .then((me) => {
        if (!isMounted || !me) return;
        const resolvedRole = authService.resolveAppRole(me);
        const enriched = {
          ...authService.getCurrentUser(),
          ...me,
          id: me.userId || me.id || authService.getCurrentUser()?.id,
          userId: me.userId || me.id || authService.getCurrentUser()?.userId,
          role: resolvedRole
        };
        tokenStorage.setTokens(
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
          enriched
        );
        setCurrentUser(enriched);
        setRole(resolvedRole);
        loadRolePortalBackendMetrics(resolvedRole, enriched);
      })
      .catch(() => {
        const saved = authService.getCurrentUser();
        const resolvedRole = authService.resolveAppRole(saved);
        setRole(resolvedRole);
        loadRolePortalBackendMetrics(resolvedRole, saved);
      });

    return () => {
      isMounted = false;
    };
  }, [loadRolePortalBackendMetrics]);

  useEffect(() => {
    const handleSubUpdated = () => {
      if (authService.isAuthenticated()) {
        loadRolePortalBackendMetrics(role, currentUser);
      }
    };
    window.addEventListener('veval:submission-updated', handleSubUpdated);
    return () => window.removeEventListener('veval:submission-updated', handleSubUpdated);
  }, [role, currentUser, loadRolePortalBackendMetrics]);

  const handleOpenAdaptiveQuiz = () => {
    setActiveModal('adaptive');
  };

  const handleOpenMockExam = () => {
    setActiveModal('mock');
  };

  const handleOpenAiTutorWithQuestion = (questionContext) => {
    if (typeof questionContext === 'string') {
      setAiTutorInitialContext({
        skill: 'Giải đáp Tư duy ĐGNL',
        question: questionContext
      });
    } else {
      setAiTutorInitialContext(questionContext || null);
    }
    setActiveModal('ai');
  };

  // Login Handler: Route each authenticated user directly into their Backend role's Portal & Default Page
  const handleLoginSuccess = (targetRole, loggedUser) => {
    const resolvedRole =
      authService.resolveAppRole(loggedUser) || targetRole || 'student';
    const validRole = ROLE_PORTAL_DEFINITIONS[resolvedRole] ? resolvedRole : 'student';

    const finalUser = loggedUser || authService.getCurrentUser();
    setRole(validRole);
    setLatestDiagnosticResult(null);
    setCurrentUser(finalUser);
    setActiveTab(ROLE_PORTAL_DEFINITIONS[validRole].defaultTab);
    setAppView('dashboard');
    loadRolePortalBackendMetrics(validRole, finalUser);
  };

  // Logout Handler
  const handleLogout = async () => {
    await authService.logout();
    setLatestDiagnosticResult(null);
    closeNavigation();
    setCurrentUser(null);
    setStudentDashboard(null);
    setParentPortalData(null);
    setTeacherHeatmapData(null);
    setManagerPortalData(null);
    setRole('student');
    setActiveTab('dashboard');
    setAppView('landing');
  };

  // 1. PUBLIC LANDING PAGE (Reference Home Template)
  if (appView === 'landing') {
    return (
      <>
        <PublicLandingPage
          currentUser={currentUser}
          onOpenLogin={(mode) => {
            setAuthInitialMode(mode === 'register' ? 'register' : 'login');
            setAppView('login');
          }}
          onOpenRegister={() => {
            setAuthInitialMode('register');
            setAppView('login');
          }}
          onOpenDashboard={() => {
            if (authService.isAuthenticated()) {
              const authUser = authService.getCurrentUser();
              const authRole = authService.resolveAppRole(authUser);
              setRole(authRole);
              setActiveTab(ROLE_PORTAL_DEFINITIONS[authRole]?.defaultTab || 'dashboard');
              setAppView('dashboard');
            } else {
              setAuthInitialMode('login');
              setAppView('login');
            }
          }}
          onOpenDiagnostic={() => {
            if (authService.isAuthenticated()) {
              const authUser = authService.getCurrentUser();
              const authRole = authService.resolveAppRole(authUser);
              setRole(authRole);
              setActiveTab('diagnostic');
              setAppView('dashboard');
            } else {
              setAuthInitialMode('login');
              setAppView('login');
            }
          }}
          onOpenArchModal={() => setActiveModal('arch')}
        />
        <AcademicArchitectureModal
          isOpen={activeModal === 'arch'}
          onClose={() => setActiveModal(null)}
        />
      </>
    );
  }

  // 2. WEB LOGIN / REGISTER PAGE (or unauthenticated guard)
  if (appView === 'login' || !authService.isAuthenticated()) {
    return (
      <WebLoginPage
        initialMode={authInitialMode}
        onNavigateHome={() => setAppView('landing')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 3. DEDICATED ROLE PORTALS (Synchronized with Home Page Color Palette #FDFBF7)
  const isDirector = (currentUser?.roles || []).some(
    (r) => String(r).toUpperCase().includes('DIRECTOR')
  );
  const basePortal = ROLE_PORTAL_DEFINITIONS[role] || ROLE_PORTAL_DEFINITIONS.student;
  const currentPortal =
    role === 'manager' && isDirector
      ? {
          ...basePortal,
          code: 'ACADEMIC DIRECTOR PORTAL',
          title: 'Cổng Giám Đốc Học Thuật Toàn Trường',
          subtitle:
            'Toàn quyền học thuật liên cơ sở, Giám sát chất lượng & Khung chương trình chuẩn V-ACT 2026',
          icon: Crown,
          accentBadge: 'bg-purple-50 text-purple-700 border-purple-200'
        }
      : basePortal;
  const pageTitle = activeTab === 'settings' ? 'Cài đặt tài khoản'
    : currentPortal.tabs.find((tab) => tab.id === activeTab)?.label || 'Tổng quan';

  const renderRolePortalContent = () => {
    if (activeTab === 'settings') {
      return <AccountSettingsPage currentUser={currentUser} onUpdateUser={setCurrentUser}
        activeRole={role} onNavigateTab={setActiveTab} onLogout={handleLogout} />;
    }
    if (role === 'teacher' && activeTab !== 'roadmap') {
      return <TeacherPortalView key={`${currentUser?.userId || currentUser?.id}:${currentUser?.classId || ''}:${activeTab}`}
        currentUser={currentUser} section={activeTab} onNavigate={setActiveTab} />;
    }
    if (activeTab === 'diagnostic' && role !== 'student') {
      return <CurriculumExplorerView role={role} onStartTopicQuiz={handleOpenAdaptiveQuiz} />;
    }
    if (activeTab === 'diagnostic') {
      return (
        <DiagnosticAssessmentPage
          key={currentUser?.userId || currentUser?.id || 'guest'}
          currentUser={currentUser}
          isEmbedded={true}
          onNavigateDashboard={() => setActiveTab('dashboard')}
          onNavigateHistory={() => setActiveTab('history')}
          onNavigateRoadmap={() => setActiveTab('roadmap')}
          onNavigateTuition={() => setActiveTab('tuition')}
          onCompleteDiagnostic={(res) => {
            setLatestDiagnosticResult(res);
          }}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'history' && role === 'student') {
      return <StudentHistoryPage key={currentUser?.userId || currentUser?.id || 'guest'}
        currentUser={currentUser} onOpenDiagnostic={() => setActiveTab('diagnostic')} />;
    }
    if (activeTab === 'history') {
      return (
        <SubmissionHistoryView
          onStartNewDiagnostic={() => setActiveTab('diagnostic')}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'roadmap') {
      return (
        <CurriculumExplorerView
          role={role === 'parent' ? 'student' : role}
          currentUser={currentUser}
          latestDiagnosticResult={latestDiagnosticResult}
          onNavigateTuition={() => setActiveTab('tuition')}
          onNavigateDiagnostic={() => setActiveTab('diagnostic')}
          onStartTopicQuiz={handleOpenAdaptiveQuiz}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'tuition') {
      return (
        <TuitionPaymentView
          currentUser={currentUser}
          onBackToDashboard={() => setActiveTab('dashboard')}
          onNavigateRoadmap={() => setActiveTab('roadmap')}
        />
      );
    }

    if (activeTab === 'analytics') {
      return (
        <LearningAnalyticsView
          currentUser={currentUser}
          onStartDiagnostic={() => setActiveTab('diagnostic')}
          onStartAdaptiveQuiz={handleOpenAdaptiveQuiz}
          onOpenAiTutor={() => {
            setAiTutorInitialContext(null);
            setActiveModal('ai');
          }}
        />
      );
    }

    if (activeTab === 'provision') {
      return (
        <AccountProvisioningView
          onBackToDashboard={() => setActiveTab('dashboard')}
        />
      );
    }

    if (activeTab === 'teacher_heatmap') {
      return (
        <TeacherDashboardView
          onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
        />
      );
    }

    // Default 'dashboard' tab per role -> Each role has its own dedicated flagship home page
    switch (role) {
      case 'parent':
        return (
          <ParentDashboardView
            currentUser={currentUser}
            onNavigateTuition={() => setActiveTab('tuition')}
          />
        );

      case 'teacher':
        return (
          <TeacherDashboardView
            onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
          />
        );

      case 'manager':
        return (
          <CampusManagerDashboardView
            onOpenProvisioning={() => setActiveTab('provision')}
          />
        );

      case 'admin':
        return (
          <CampusManagerDashboardView
            onOpenProvisioning={() => setActiveTab('provision')}
          />
        );

      case 'student':
      default:
        return (
          <div className="space-y-6 animate-fade">
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
              <DiagnosticOnboardingCard key={currentUser?.userId || currentUser?.id || currentUser?.studentId}
                currentUser={currentUser} onOpenDiagnostic={() => setActiveTab('diagnostic')}
                onOpenRoadmap={() => setActiveTab('roadmap')} />
              <StudentParentLinkCard currentUser={currentUser} />
            </div>
            <HeroBanner
              currentUser={currentUser}
              studentDashboard={studentDashboard}
              onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
              onOpenDiagnostic={() => setActiveTab('diagnostic')}
              onOpenAiTutor={() => {
                setAiTutorInitialContext(null);
                setActiveModal('ai');
              }}
              latestDiagnosticResult={latestDiagnosticResult}
            />
            <MetricsGrid
              studentDashboard={studentDashboard}
              onOpenRadar={() => setActiveModal('radar')}
              onOpenDAG={() => setActiveTab('roadmap')}
              onOpenZPD={handleOpenAdaptiveQuiz}
              onOpenAnalytics={() => setActiveTab('analytics')}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MilestoneCard
                  currentUser={currentUser}
                  studentDashboard={studentDashboard}
                  onStartTask={handleOpenAdaptiveQuiz}
                  onContinueMilestone={handleOpenAdaptiveQuiz}
                  onStartDiagnostic={() => setActiveTab('diagnostic')}
                />
              </div>
              <div className="lg:col-span-1">
                <LiveQnACard currentUser={currentUser} />
              </div>
            </div>
          </div>
        );
    }
  };

  const portalMetrics = {
    studentDashboard,
    parentPortalData,
    teacherHeatmapData,
    managerPortalData,
    campusesCount,
    teachersCount,
    totalUsersCount
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-[#FACC15] selection:text-slate-950 relative overflow-x-hidden">
      {/* Ambient Home-Style Background Glows */}
      <div className="fixed -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-blue-500/8 blur-[130px] pointer-events-none z-0"></div>
      <div className="fixed top-1/3 -right-24 w-[420px] h-[420px] rounded-full bg-[#FACC15]/10 blur-[130px] pointer-events-none z-0"></div>

      <div className="flex flex-1 relative z-10">
        {/* Left Role-Dedicated Sidebar */}
        <Sidebar
          role={role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
          onOpenMockExam={handleOpenMockExam}
          onOpenAiTutor={() => {
            setAiTutorInitialContext(null);
            setActiveModal('ai');
          }}
          onOpenLiveClass={() => setActiveTab('dashboard')}
          latestDiagnosticResult={latestDiagnosticResult}
          portalMetrics={portalMetrics}
        />

        {mobileNavigation && <MobileSidebar role={role} activeTab={activeTab}
          onClose={closeNavigation} setActiveTab={setActiveTab}
          onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz} onOpenMockExam={handleOpenMockExam}
          onOpenAiTutor={() => { setAiTutorInitialContext(null); setActiveModal('ai'); }}
          onOpenLiveClass={() => setActiveTab('dashboard')}
          latestDiagnosticResult={latestDiagnosticResult} portalMetrics={portalMetrics} />}

        {/* Main Role Portal Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Role-Aware Navbar */}
          <Navbar
            role={role}
            activeTab={activeTab}
            pageTitle={pageTitle}
            onOpenNavigation={() => setMobileNavigation(true)}
            currentUser={currentUser}
            portalMetrics={portalMetrics}
            onLogout={handleLogout}
            onOpenLandingPage={() => setAppView('landing')}
              onOpenSettings={() => setActiveTab('settings')}
          />

          {/* Main Workspace Container */}
          <main className="min-w-0 flex-1 p-4 sm:p-6 w-full max-w-full">
            {role !== 'student' && role !== 'parent' && activeTab === currentPortal.defaultTab && (
              <h1 className="mb-5 text-xl font-bold tracking-tight text-slate-900">{accountGreeting(role, currentUser)}</h1>
            )}
            {renderRolePortalContent()}
          </main>

          {/* Unified Home-Style Footer Strip */}
          <footer className="border-t border-slate-200/80 bg-white/90 px-4 sm:px-6 py-4 mt-auto">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
                <span className="font-extrabold text-slate-800">ĐGNL AI Platform</span>
                <span>• Hệ sinh thái Khảo thí & Học tập Thích ứng ĐHQG TP.HCM</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Vai trò hiện tại: <strong className="text-blue-700 uppercase">{role}</strong></span>
                <button
                  type="button"
                  onClick={() => setAppView('landing')}
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Về Trang Chủ
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Interactive Modals */}
      <AdaptiveQuizModal
        isOpen={activeModal === 'adaptive'}
        onClose={() => setActiveModal(null)}
        onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
      />

      <DiagnosticTestModal
        isOpen={activeModal === 'mock'}
        onClose={() => setActiveModal(null)}
      />

      <RadarChartModal
        isOpen={activeModal === 'radar'}
        onClose={() => setActiveModal(null)}
        studentDashboard={studentDashboard}
        onOpenFullAnalytics={() => setActiveTab('analytics')}
      />

      <AISocraticTutorModal
        isOpen={activeModal === 'ai'}
        onClose={() => setActiveModal(null)}
        initialContext={aiTutorInitialContext}
      />

      <AcademicArchitectureModal
        isOpen={activeModal === 'arch'}
        onClose={() => setActiveModal(null)}
      />

      {/* Sleek Floating AI Tutor FAB (Bottom-Right Corner) */}
      {role === 'student' && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-bold shadow-xl border border-slate-700/80 backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hỏi Gia sư AI</span>
          </div>

          <button
            onClick={() => setActiveModal('ai')}
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
