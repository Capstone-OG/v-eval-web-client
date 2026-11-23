import AdminWorkspace from './components/admin/AdminWorkspace';
import { toast } from './context/ToastContext';
import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  CreditCard,
  Crown,
  FileSpreadsheet,
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
import StudentParentLinkCard from './components/dashboard/StudentParentLinkCard';
import ParentDashboardView from './components/dashboard/ParentDashboardView';
import ParentChildResultsView from './components/dashboard/ParentChildResultsView';
import ParentEarlyWarningsAndTeacherView from './components/dashboard/ParentEarlyWarningsAndTeacherView';
import TeacherDashboardView from './components/dashboard/TeacherDashboardView';
import TeacherPortalView from './components/dashboard/TeacherPortalView';
import TeacherSubmissionHistoryView from './components/dashboard/TeacherSubmissionHistoryView';
import CampusManagerDashboardView from './components/dashboard/CampusManagerDashboardView';
import AcademicManagerDashboardView from './components/dashboard/AcademicManagerDashboardView';
import AiTutorModerationView from './components/dashboard/AiTutorModerationView';
import LearningAnalyticsView from './components/dashboard/LearningAnalyticsView';
import StudentScheduleView from './components/dashboard/StudentScheduleView';
import TeacherScheduleView from './components/dashboard/TeacherScheduleView';
import PublicLandingPage from './components/landing/PublicLandingPage';
import WebLoginPage from './components/auth/WebLoginPage';
import AccountProvisioningView from './components/admin/AccountProvisioningView';
import DiagnosticAssessmentPage from './components/diagnostic/DiagnosticAssessmentPage';
import SubmissionHistoryView from './components/diagnostic/SubmissionHistoryView';
import StudentHistoryPage from './components/diagnostic/StudentHistoryPage';
import AccountSettingsPage from './components/settings/AccountSettingsPage';
import CurriculumExplorerView from './components/curriculum/CurriculumExplorerView';
import TextbookStandardView from './components/curriculum/TextbookStandardView';
import TextbookIngestView from './components/curriculum/TextbookIngestView';
import TextbookStudioView from './components/curriculum/TextbookStudioView';
import ExamBankView from './components/curriculum/ExamBankView';
import ExamIngestView from './components/curriculum/ExamIngestView';
import ExamStudioView from './components/curriculum/ExamStudioView';
import StudentRoadmapWorkspace from './components/roadmap/StudentRoadmapWorkspace';
import StudentMockExamPage from './components/mock/StudentMockExamPage';
import StudentFoundationKnowledgeView from './components/curriculum/StudentFoundationKnowledgeView';
import StudentBookmarkDrawer from './components/common/StudentBookmarkDrawer';
import TuitionPaymentView from './components/payment/TuitionPaymentView';
import useStudentActivation from './hooks/useStudentActivation';
import StudentActivationGuide, { ActivationChecklist } from './components/activation/StudentActivationGuide';
import {
  AdaptiveQuizModal,
  RadarChartModal,
  AcademicArchitectureModal,
  AISocraticTutorModal
} from './components/modals';
import MockAssessmentPage from './components/diagnostic/MockAssessmentPage';
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
      { id: 'diagnostic', label: 'Khảo thí & Chẩn đoán', icon: ClipboardCheck },
      { id: 'history', label: 'Lịch sử & Lỗi sai', icon: History },
      { id: 'roadmap', label: 'Cây tri thức & Lộ trình', icon: Network },
      { id: 'schedule', label: 'Thời khóa biểu & Điểm danh', icon: Calendar },
      { id: 'analytics', label: 'Báo cáo & Dự báo', icon: BarChart3 },
      { id: 'tuition', label: 'Học phí & Gói học', icon: CreditCard }
    ]
  },
  parent: {
    code: 'KHÔNG GIAN PHỤ HUYNH',
    title: 'Cổng Phụ Huynh Đồng Hành Cùng Con',
    subtitle: 'Theo dõi mức độ sẵn sàng thi, thời lượng tự học thực tế & Học phí trực tuyến',
    defaultTab: 'dashboard',
    icon: HeartHandshake,
    accentBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan đồng hành', icon: HeartHandshake },
      { id: 'results', label: 'Tiến độ & Kết quả của con', icon: BarChart3 },
      { id: 'warnings', label: 'Cảnh báo & Trao đổi Giáo viên', icon: AlertTriangle },
      { id: 'tuition', label: 'Học phí & Lịch sử giao dịch', icon: CreditCard }
    ]
  },
  teacher: {
    code: 'TEACHER PEDAGOGICAL PORTAL',
    title: 'Cổng Giảng Viên & Sư Phạm ĐGNL',
    subtitle: 'Theo dõi tiến độ học tập của lớp, xếp nhóm hỗ trợ và biên soạn câu hỏi ôn luyện',
    defaultTab: 'dashboard',
    icon: BookOpen,
    accentBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tabs: [
      { id: 'dashboard', label: 'Lớp học & Tiến độ', icon: LayoutGrid },
      { id: 'schedule', label: 'Thời khóa biểu & Điểm danh', icon: Calendar },
      { id: 'history', label: 'Lịch sử làm bài', icon: History },
      { id: 'roadmap', label: 'Khung chương trình', icon: BookOpen },
      { id: 'textbook-standard', label: 'Sách giáo khoa (SGK)', icon: BookOpen },
      { id: 'exam-bank', label: 'Kho đề thi đã xuất bản', icon: FileSpreadsheet },
      { id: 'ai_moderation', label: 'Kiểm duyệt gia sư AI', icon: Bot }
    ]
  },
  manager: {
    code: 'CAMPUS MANAGER PORTAL',
    title: 'Cổng Quản Lý Học Thuật Cơ Sở',
    subtitle: 'Điều phối đào tạo đa lớp, Phân cụm học viên AI Clustering & Lịch học Offline',
    defaultTab: 'dashboard',
    icon: Briefcase,
    accentBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan & Đối sánh Cơ sở', icon: Building2 },
      { id: 'classes_schedule', label: 'Lớp học, Lịch học & Phân công GV', icon: Calendar },
      { id: 'clustering', label: 'Xếp lớp Đầu vào & Phân cụm AI', icon: Sparkles },
      { id: 'escalations', label: 'Cảnh báo Cấp 3 & Họp 3 bên', icon: BarChart3 },
      { id: 'analytics', label: 'Báo cáo Chất lượng', icon: BarChart3 }
    ]
  },
  director: {
    code: 'ACADEMIC DIRECTOR PORTAL',
    title: 'Cổng Giám Đốc Học Thuật Liên Cơ Sở',
    subtitle: 'Quản trị Đồ thị Tri thức DAG 4 tầng, Ngân hàng Câu hỏi IRT 2PL, Kiểm duyệt AI & Kho học liệu RAG',
    defaultTab: 'dashboard',
    icon: Crown,
    accentBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan & Báo cáo Liên Cơ sở', icon: Building2 },
      { id: 'roadmap', label: 'Đồ thị Tri thức DAG 4 Tầng', icon: Network },
      { id: 'textbook-standard', label: '1. Sách Giáo Khoa Chuẩn', icon: BookOpen },
      { id: 'textbook-ingest', label: '2. Nạp Tài Liệu SGK', icon: BookOpenCheck },
      { id: 'textbook-studio', label: '3. Studio Biên Soạn SGK', icon: BookOpenCheck },
      { id: 'exam-bank', label: '1. Kho Đề & Xem Đề Thi', icon: FileSpreadsheet },
      { id: 'exam-ingest', label: '2. Parse PDF & AI Bloom', icon: Sparkles },
      { id: 'exam-studio', label: '3. Studio Biên Soạn Đề', icon: FileSpreadsheet },
      { id: 'ai_moderation', label: 'Kiểm duyệt Câu hỏi & Gia sư AI', icon: Bot },
      { id: 'teacher_heatmap', label: 'Giám sát Ma trận Lớp học', icon: LayoutGrid },
      { id: 'provision', label: 'Cấp phát Tài khoản', icon: UserPlus },
      { id: 'analytics', label: 'Báo cáo Học thuật Toàn trường', icon: BarChart3 }
    ]
  },
  admin: {
    code: 'SYSTEM ADMIN PORTAL',
    title: 'Quản trị hệ thống V-Eval',
    subtitle: 'Tài khoản, phân quyền, cơ sở đào tạo & cấu hình vận hành',
    defaultTab: 'dashboard',
    icon: ShieldCheck,
    accentBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    tabs: [
      { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
      { id: 'provision', label: 'Tài khoản', icon: Users },
      { id: 'user_roles', label: 'Vai trò & Phân quyền', icon: ShieldCheck },
      { id: 'campuses', label: 'Cơ sở đào tạo', icon: Building2 },
      { id: 'system_settings', label: 'Cấu hình hệ thống', icon: Sparkles },
      { id: 'operations', label: 'Giám sát & Sao lưu', icon: LayoutGrid }
    ]
  }
};

export default function App() {
  // Check existing token in localStorage to restore session
  const [mobileNavigation, setMobileNavigation] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const closeNavigation = useCallback(() => setMobileNavigation(false), []);
  const [currentUser, setCurrentUser] = useState(() =>
    authService.isAuthenticated() ? authService.getCurrentUser() : null
  );

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
  const activation = useStudentActivation(currentUser, role === 'student' && appView === 'dashboard');
  const [showActivationGuide, setShowActivationGuide] = useState(false);
  const [guideProfile, setGuideProfile] = useState(false);
  const [pendingProfileCheck, setPendingProfileCheck] = useState(null);
  const activationUserId = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  useEffect(() => {
    if (!pendingProfileCheck) return;
    if (pendingProfileCheck !== activationUserId || role !== 'student') {
      setPendingProfileCheck(null);
      return;
    }
    if (activation.step === 'loading') return;
    setPendingProfileCheck(null);
    if (activation.step === 'payment' || activation.step === 'ready') {
      setGuideProfile(false);
      setActiveTab(activation.step === 'ready' ? 'roadmap' : 'tuition');
      toast.success(activation.step === 'ready' ? 'Hồ sơ đã đầy đủ. Bạn có thể bắt đầu học.' : 'Hồ sơ đã đầy đủ. Tiếp theo, hãy chọn gói học và thanh toán.');
    } else if (activation.step === 'profile') {
      toast.warning(`Đã lưu hồ sơ. Bạn cần bổ sung: ${activation.missing.join(', ')}.`);
    } else if (activation.step === 'error') {
      toast.warning('Hồ sơ đã lưu thành công nhưng chưa kiểm tra được bước tiếp theo. Bạn có thể mở Học phí & Gói học để tiếp tục.');
    }
  }, [pendingProfileCheck, activationUserId, role, activation.step, activation.missing]);
  const openRoadmap = () => {
    if (role === 'student' && activation.step !== 'ready') setShowActivationGuide(true);
    else setActiveTab('roadmap');
  };
  const continueActivation = () => {
    if (activation.step === 'error') { activation.refresh(); return; }
    setShowActivationGuide(false);
    if (activation.step === 'profile') { setGuideProfile(true); setActiveTab('settings'); }
    else if (activation.step === 'payment') setActiveTab('tuition');
    else if (activation.step === 'diagnostic') setActiveTab('diagnostic');
    else if (activation.step === 'ready') setActiveTab('roadmap');
  };

  // Interactive Modal States: 'adaptive' | 'mock' | 'ai' | 'radar' | null
  const [activeModal, setActiveModal] = useState(null);
  const [aiTutorInitialContext, setAiTutorInitialContext] = useState(null);
  const [selectedPlarNodeId, setSelectedPlarNodeId] = useState(null);

  // Real Backend Portal Metrics State
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [parentPortalData, setParentPortalData] = useState(null);
  const [parentActiveChildId, setParentActiveChildId] = useState(null);
  const [teacherHeatmapData, setTeacherHeatmapData] = useState(null);
  const [managerPortalData, setManagerPortalData] = useState(null);
  const [campusesCount, setCampusesCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const loadRolePortalBackendMetrics = useCallback(async (activeRole, userObj) => {
    if (!authService.isAuthenticated()) return;
    const uid = userObj?.userId || userObj?.id || userObj?.studentId;

    try {
      if (activeRole === 'student') {
        const [dashboard, history] = await Promise.allSettled([
          practiceService.getStudentDashboard(uid),
          practiceService.getDiagnosticHistory(uid)
        ]);
        const signedInUser = authService.getCurrentUser();
        if (!uid || (signedInUser?.userId || signedInUser?.id || signedInUser?.studentId) !== uid) return;
        if (dashboard.status === 'fulfilled') setStudentDashboard(dashboard.value);
        if (history.status === 'fulfilled' && Array.isArray(history.value)) {
          const latest = history.value
            .filter((item) => item.studentId === uid && item.status === 'COMPLETED'
              && item.examType === 'DIAGNOSTIC' && Number.isFinite(item.theta0))
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
          setLatestDiagnosticResult(latest || null);
        }
      } else if (activeRole === 'parent') {
        const pData = await practiceService.getParentDashboard(uid);
        setParentPortalData(pData);
        if (pData?.children?.length > 0) {
          setParentActiveChildId((prev) => prev || pData.children[0].studentId);
        }
      } else if (activeRole === 'teacher') {
        // TeacherPortalView loads scoped live data; do not substitute a default class.
        setTeacherHeatmapData(null);
      } else if (activeRole === 'manager' || activeRole === 'director' || activeRole === 'admin') {
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
    const reqSession = tokenStorage.getSessionVersion();
    authService
      .fetchCurrentUserProfile()
      .then((me) => {
        // Chặn Race Condition: nếu người dùng đã bấm Logout trong lúc request /users/me đang chạy -> hủy ngay
        if (
          !isMounted ||
          !me ||
          !authService.isAuthenticated() ||
          tokenStorage.getSessionVersion() !== reqSession
        ) {
          return;
        }
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
        if (!isMounted || !authService.isAuthenticated() || tokenStorage.getSessionVersion() !== reqSession) {
          return;
        }
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
    setActiveTab('adaptive-practice');
  };

  const handleOpenMockExam = () => {
    setActiveModal(null);
    setActiveTab('mock');
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
    setShowActivationGuide(false);
    setGuideProfile(false);
    setCurrentUser(finalUser);
    setActiveTab(ROLE_PORTAL_DEFINITIONS[validRole].defaultTab);
    setAppView('dashboard');
    toast.success('Đăng nhập thành công.');
    loadRolePortalBackendMetrics(validRole, finalUser);
  };

  // Logout Handler (Optimistic clear: xóa token & state ngay lập tức, thu hồi refresh token ở nền)
  const handleLogout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clearTokens();
    setLatestDiagnosticResult(null);
    setShowActivationGuide(false);
    setGuideProfile(false);
    closeNavigation();
    setCurrentUser(null);
    setStudentDashboard(null);
    setParentPortalData(null);
    setTeacherHeatmapData(null);
    setManagerPortalData(null);
    setRole('student');
    setActiveTab('dashboard');
    setAppView('landing');
    toast.success('Đã đăng xuất khỏi tài khoản.');

    if (refreshToken) {
      authService.logout(refreshToken).catch(() => {});
    }
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
          title: 'Cổng Giám Đốc Học Thuật Liên Cơ Sở',
          subtitle:
            'Toàn quyền học thuật liên cơ sở, Giám sát chất lượng & Khung chương trình chuẩn V-ACT 2026',
          icon: Crown,
          accentBadge: 'bg-purple-50 text-purple-700 border-purple-200'
        }
      : basePortal;
  const pageTitle = activeTab === 'settings' ? 'Cài đặt tài khoản'
    : activeTab === 'mock' ? 'Thi thử V-ACT'
    : currentPortal.tabs.find((tab) => tab.id === activeTab)?.label || 'Tổng quan';

  const parentChildren = parentPortalData?.children || [];
  const activeChild =
    parentChildren.find((c) => c.studentId === parentActiveChildId) ||
    parentChildren[0] ||
    null;
  const activeChildId = activeChild?.studentId || null;

  const renderRolePortalContent = () => {
    if (role === 'admin' && activeTab !== 'settings') return <AdminWorkspace activeTab={activeTab} currentUser={currentUser} onNavigate={setActiveTab} />;
    if (activeTab === 'mock') return <MockAssessmentPage currentUser={currentUser} onClose={() => setActiveTab('dashboard')} />;
    if (activeTab === 'settings') {
      return <AccountSettingsPage currentUser={currentUser} onUpdateUser={setCurrentUser}
        activationGuidance={(guideProfile || pendingProfileCheck === activationUserId) && role === 'student'}
        activationChecking={pendingProfileCheck === activationUserId}
        onProfileSaved={() => {
          if (role === 'student') {
            setShowActivationGuide(false);
            setPendingProfileCheck(activationUserId);
            activation.refresh();
          }
        }}
        activeRole={role} onNavigateTab={setActiveTab} onLogout={handleLogout} />;
    }
    if (role === 'parent' && activeTab === 'results') {
      return (
        <ParentChildResultsView
          currentUser={currentUser}
          activeChild={activeChild}
          activeChildId={activeChildId}
          childrenList={parentChildren}
          onSelectChildId={setParentActiveChildId}
          onNavigateTab={setActiveTab}
        />
      );
    }
    if (role === 'parent' && activeTab === 'warnings') {
      return (
        <ParentEarlyWarningsAndTeacherView
          currentUser={currentUser}
          activeChild={activeChild}
          activeChildId={activeChildId}
          childrenList={parentChildren}
          onSelectChildId={setParentActiveChildId}
          onNavigateTab={setActiveTab}
        />
      );
    }
    if (role === 'teacher') {
      if (activeTab === 'dashboard' || activeTab === 'teacher_heatmap' || activeTab === 'proctoring' || activeTab === 'analytics') {
        const viewMode = activeTab === 'proctoring' ? 'proctoring' : activeTab === 'analytics' ? 'warnings' : 'heatmap';
        return (
          <TeacherDashboardView
            currentUser={currentUser}
            onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
            initialView={viewMode}
          />
        );
      }
      if (activeTab === 'schedule') {
        return (
          <TeacherScheduleView currentUser={currentUser} />
        );
      }
      if (activeTab === 'ai_moderation') {
        return (
          <AiTutorModerationView
            currentUser={currentUser}
            role={role}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        );
      }
      if (activeTab === 'history') {
        return (
          <TeacherSubmissionHistoryView
            key={`${currentUser?.userId || currentUser?.id}:${activeTab}`}
            currentUser={currentUser}
            onNavigate={setActiveTab}
          />
        );
      }
    }
    if (activeTab === 'adaptive-practice') {
      return (
        <StudentRoadmapWorkspace
          viewMode="study"
          initialNodeId={selectedPlarNodeId}
          onBackToRoadmap={() => setActiveTab('roadmap')}
          onNavigateDiagnostic={() => setActiveTab('diagnostic')}
          onNavigateDashboard={() => setActiveTab('dashboard')}
          onNavigateTuition={() => setActiveTab('tuition')}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'foundation-knowledge') {
      return (
        <StudentFoundationKnowledgeView
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'mistake-notebook') {
      return (
        <MistakeNotebookSM2View
          currentUser={currentUser}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'quiz-practice') {
      return (
        <AdaptiveQuizModal
          isOpen={true}
          isEmbedded={true}
          onClose={() => setActiveTab('dashboard')}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'mock-exam') {
      return (
        <StudentMockExamPage
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
          onNavigateHistory={() => setActiveTab('history')}
        />
      );
    }

    if (activeTab === 'diagnostic') {
      return (
        <DiagnosticAssessmentPage
          key={currentUser?.userId || currentUser?.id || 'guest'}
          currentUser={currentUser}
          isEmbedded={true}
          onNavigateDashboard={() => setActiveTab('dashboard')}
          onNavigateHistory={() => setActiveTab('history')}
          onNavigateRoadmap={openRoadmap}
          onNavigateTuition={() => setActiveTab('tuition')}
          onCompleteDiagnostic={(res) => {
            setLatestDiagnosticResult(res);
            activation.refresh();
            setShowActivationGuide(true);
          }}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'history' && role === 'student') {
      return (
        <StudentHistoryPage
          key={currentUser?.userId || currentUser?.id || 'guest'}
          currentUser={currentUser}
          onOpenDiagnostic={() => setActiveTab('diagnostic')}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }
    if (activeTab === 'history') {
      const parentChildren = parentPortalData?.children || [];
      const defaultChild = parentChildren[0] || null;
      return (
        <SubmissionHistoryView
          key={`history_${role}_${defaultChild?.studentId || 'default'}`}
          isParent={role === 'parent'}
          studentId={role === 'parent' ? (defaultChild?.studentId || null) : (currentUser?.id || currentUser?.userId)}
          studentName={role === 'parent' ? (defaultChild?.studentName || null) : (currentUser?.fullName || null)}
          childrenList={role === 'parent' ? parentChildren : []}
          onStartNewDiagnostic={() => setActiveTab('diagnostic')}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    // Guard: Giảng viên chỉ có quyền tra cứu SGK chuẩn và Kho đề đã xuất bản; ẩn & chặn các trang Ingest & Studio
    if (role === 'teacher' && (activeTab === 'textbook-ingest' || activeTab === 'textbook-studio')) {
      return (
        <TextbookStandardView
          role={role}
          onNavigateTab={setActiveTab}
          onBack={() => setActiveTab('roadmap')}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      );
    }
    if (role === 'teacher' && (activeTab === 'exam-ingest' || activeTab === 'exam-studio')) {
      return <ExamBankView role={role} onNavigateTab={setActiveTab} />;
    }

    if (activeTab === 'textbook-standard') {
      return (
        <TextbookStandardView
          role={role}
          onNavigateTab={setActiveTab}
          onBack={() => setActiveTab('roadmap')}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      );
    }
    if (activeTab === 'textbook-ingest') {
      return <TextbookIngestView role={role} onNavigateTab={setActiveTab} onBack={() => setActiveTab('roadmap')} />;
    }
    if (activeTab === 'textbook-studio') {
      return <TextbookStudioView role={role} onNavigateTab={setActiveTab} onBack={() => setActiveTab('textbook-standard')} />;
    }
    if (activeTab === 'exam-bank') {
      return <ExamBankView role={role} onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'exam-ingest') {
      return <ExamIngestView role={role} onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'exam-studio') {
      return <ExamStudioView role={role} onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'roadmap' && role !== 'parent') {
      if (role === 'student' && activation.step !== 'ready') {
        return <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"><ActivationChecklist activation={activation} onAction={continueActivation} /></div>;
      }
      if (role === 'student') {
        return (
          <StudentRoadmapWorkspace
            viewMode="map"
            onOpenPlarNode={(nodeId) => {
              setSelectedPlarNodeId(nodeId);
              setActiveTab('adaptive-practice');
            }}
            onNavigateDiagnostic={() => setActiveTab('diagnostic')}
            onNavigateDashboard={() => setActiveTab('dashboard')}
            onNavigateTuition={() => setActiveTab('tuition')}
            onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
          />
        );
      }
      return (
        <CurriculumExplorerView
          role={role === 'parent' ? 'student' : role}
          tuitionPaid={role === 'student' ? activation.paid : undefined}
          currentUser={currentUser}
          latestDiagnosticResult={latestDiagnosticResult}
          onNavigateTuition={() => setActiveTab('tuition')}
          onNavigateDiagnostic={() => setActiveTab('diagnostic')}
          onStartTopicQuiz={handleOpenAdaptiveQuiz}
          onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
        />
      );
    }

    if (activeTab === 'schedule') {
      return (
        <StudentScheduleView
          studentId={currentUser?.userId || currentUser?.id || currentUser?.studentId}
          onOpenPracticeModal={handleOpenAdaptiveQuiz}
          onOpenAiTutor={() => {
            setAiTutorInitialContext(null);
            setActiveModal('ai');
          }}
          onNavigateRoadmap={openRoadmap}
        />
      );
    }

    if (activeTab === 'tuition') {
      return (
        <TuitionPaymentView
          currentUser={currentUser}
          isParent={role === 'parent'}
          activeChild={activeChild}
          childrenList={parentChildren}
          onSelectChildId={setParentActiveChildId}
          onBeforePayment={() => {
            if (role === 'student' && !['payment', 'ready'].includes(activation.step)) {
              setShowActivationGuide(true);
              return false;
            }
            return true;
          }}
          onBackToDashboard={() => setActiveTab('dashboard')}
          onNavigateRoadmap={role === 'parent' ? undefined : openRoadmap}
          onNavigateAdaptive={role === 'parent' ? undefined : () => setActiveTab('roadmap')}
          onNavigateSchedule={role === 'parent' ? undefined : () => setActiveTab('schedule')}
          onNavigateAiTutor={role === 'parent' ? undefined : () => {
            setAiTutorInitialContext(null);
            setActiveModal('ai');
          }}
        />
      );
    }

    const isDirectorUser =
      role === 'director' ||
      (Array.isArray(currentUser?.roles) &&
        currentUser.roles.some((r) => String(r).toUpperCase().includes('DIRECTOR'))) ||
      String(currentUser?.email || '').toLowerCase().startsWith('director');

    if (isDirectorUser && ['dashboard', 'analytics', 'teacher_heatmap', 'provision'].includes(activeTab)) {
      return (
        <CampusManagerDashboardView
          currentUser={currentUser}
          mode="director"
          onNavigateTab={setActiveTab}
        />
      );
    }

    if (
      role === 'manager' &&
      !isDirectorUser &&
      ['dashboard', 'classes_schedule', 'clustering', 'escalations', 'analytics'].includes(activeTab)
    ) {
      return (
        <AcademicManagerDashboardView
          currentUser={currentUser}
          activeSection={activeTab === 'analytics' ? 'dashboard' : activeTab}
          onNavigateSection={setActiveTab}
        />
      );
    }

    if (activeTab === 'analytics' && role !== 'parent') {
      return (
        <LearningAnalyticsView
          currentUser={currentUser}
          onStartDiagnostic={() => setActiveTab('diagnostic')}
          onStartAdaptiveQuiz={handleOpenAdaptiveQuiz}
          onOpenZPD={handleOpenAdaptiveQuiz}
          onOpenRoadmap={() => setActiveTab('roadmap')}
          onOpenHistory={() => setActiveTab('history')}
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

    if (activeTab === 'ai_moderation') {
      return (
        <AiTutorModerationView
          currentUser={currentUser}
          role={role}
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
            activeChild={activeChild}
            activeChildId={activeChildId}
            childrenList={parentChildren}
            onSelectChildId={setParentActiveChildId}
            onNavigateTuition={() => setActiveTab('tuition')}
            onNavigateWarnings={() => setActiveTab('warnings')}
            onNavigateResults={() => setActiveTab('results')}
          />
        );

      case 'teacher':
        return (
          <TeacherDashboardView
            onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
          />
        );

      case 'director':
        return (
          <CampusManagerDashboardView
            currentUser={currentUser}
            mode="director"
            onNavigateTab={setActiveTab}
          />
        );

      case 'manager':
        return (
          <AcademicManagerDashboardView
            currentUser={currentUser}
            activeSection="dashboard"
            onNavigateSection={setActiveTab}
          />
        );

      case 'admin':
        return (
          <CampusManagerDashboardView
            currentUser={currentUser}
            onOpenProvisioning={() => setActiveTab('provision')}
          />
        );

      case 'student':
      default:
        return (
          <div className="space-y-6 animate-fade">
            <HeroBanner
              currentUser={currentUser}
              studentDashboard={studentDashboard}
              onOpenAdaptiveQuiz={openRoadmap}
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
              onOpenDAG={openRoadmap}
              onOpenZPD={handleOpenAdaptiveQuiz}
              onOpenAnalytics={() => setActiveTab('analytics')}
            />
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
              <DiagnosticOnboardingCard activation={activation} key={currentUser?.userId || currentUser?.id || currentUser?.studentId}
                currentUser={currentUser} onOpenDiagnostic={() => setActiveTab('diagnostic')}
                onOpenRoadmap={openRoadmap} />
              <StudentParentLinkCard currentUser={currentUser} />
            </div>
          </div>
        );
    }
  };

  const portalMetrics = {
    currentUser,
    studentDashboard,
    parentPortalData,
    parentActiveChildId,
    setParentActiveChildId,
    activeChild,
    teacherHeatmapData,
    managerPortalData,
    campusesCount,
    teachersCount,
    totalUsersCount
  };

  return (
      <div className="h-screen w-full bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-[#FACC15] selection:text-slate-950 relative overflow-hidden">
        {/* Ambient Home-Style Background Glows */}
        <div className="fixed -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-blue-500/8 blur-[130px] pointer-events-none z-0"></div>
        <div className="fixed top-1/3 -right-24 w-[420px] h-[420px] rounded-full bg-[#FACC15]/10 blur-[130px] pointer-events-none z-0"></div>

          <div className="flex flex-1 relative z-10 min-h-0 overflow-hidden">
            {/* Left Role-Dedicated Sidebar */}
            <Sidebar
              role={role}
              activeTab={activeTab}
              setActiveTab={(tab) => tab === 'roadmap' ? openRoadmap() : setActiveTab(tab)}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
              onOpenLiveClass={() => setActiveTab('live')}
              onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz}
              onOpenMockExam={handleOpenMockExam}
              onOpenAiTutor={() => {
                setAiTutorInitialContext(null);
                setActiveModal('ai');
              }}
              latestDiagnosticResult={latestDiagnosticResult}
              portalMetrics={portalMetrics}
            />

            {mobileNavigation && <MobileSidebar role={role} activeTab={activeTab}
              onClose={closeNavigation} setActiveTab={(tab) => tab === 'roadmap' ? openRoadmap() : setActiveTab(tab)}
              onOpenAdaptiveQuiz={handleOpenAdaptiveQuiz} onOpenMockExam={handleOpenMockExam}
              onOpenAiTutor={() => { setAiTutorInitialContext(null); setActiveModal('ai'); }}
              latestDiagnosticResult={latestDiagnosticResult} portalMetrics={portalMetrics} />}

            {/* Main Role Portal Content Column */}
              <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
                {/* Top Role-Aware Navbar */}
                <Navbar
                  role={role}
                  activeTab={activeTab}
                  pageTitle={pageTitle}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
                  onSelectChildId={setParentActiveChildId}
                  pageSubtitle={activeTab === 'schedule' && role === 'student' ? 'Theo dõi lịch tuần và chọn từng buổi học để xem chi tiết.' : undefined}
                  onOpenNavigation={() => setMobileNavigation(true)}
                  currentUser={currentUser}
                  portalMetrics={portalMetrics}
                  onLogout={handleLogout}
                  onOpenLandingPage={() => setAppView('landing')}
                  onOpenSettings={() => setActiveTab('settings')}
                />

                {/* Main Workspace Container */}
                <main className="min-w-0 flex-1 p-4 sm:p-6 w-full max-w-full">
                  {role !== 'student' && role !== 'parent' && role !== 'manager' && role !== 'admin' && activeTab === currentPortal.defaultTab && (
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
            <StudentActivationGuide open={showActivationGuide && role === 'student'} onClose={() => setShowActivationGuide(false)} activation={activation} onAction={continueActivation} />
            <AdaptiveQuizModal
              isOpen={activeModal === 'adaptive'}
              onClose={() => setActiveModal(null)}
              onOpenAiTutorWithContext={handleOpenAiTutorWithQuestion}
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

            {role === 'student' && ['roadmap', 'adaptive-practice', 'foundation-knowledge', 'mistake-notebook', 'quiz-practice'].includes(activeTab) && <StudentBookmarkDrawer />}
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
