import BrandLogo from '../common/BrandLogo';
import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  ChevronDown,
  CreditCard,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  History,
  LayoutGrid,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Zap
} from 'lucide-react';

export default function Sidebar({
  role = 'student',
  activeTab,
  setActiveTab,
  isCollapsed = false,
  onToggleCollapse,
  onOpenAdaptiveQuiz,
  onOpenMockExam,
  onOpenAiTutor,
  latestDiagnosticResult,
  mobile = false,
  onNavigate,
  portalMetrics = {}
}) {
  const studentDashboard = portalMetrics.studentDashboard;
  const rawTheta = latestDiagnosticResult?.theta_0 ?? latestDiagnosticResult?.theta0 ?? studentDashboard?.theta0;
  const thetaDisplay =
    rawTheta !== undefined && rawTheta !== null
      ? Number(rawTheta) > 0
        ? `+${Number(rawTheta).toFixed(2)}`
        : `${Number(rawTheta).toFixed(2)}`
      : '0.00';

  const placementCode = latestDiagnosticResult?.placement_class || latestDiagnosticResult?.placementClass || studentDashboard?.placementClass;
  const placementLabel =
    placementCode === 'BREAKTHROUGH'
      ? 'Lớp Bứt Phá (900+)'
      : placementCode === 'FOUNDATION'
        ? 'Lớp Nền Tảng (<750)'
        : placementCode === 'ACCELERATION'
          ? 'Lớp Tăng Tốc (750-900)'
          : 'Chưa xếp lớp (Cần khảo sát)';

  const studentTarget = Number(studentDashboard?.targetScore || 900);
  const studentProgressPct = Math.min(
    100,
    Math.max(0, Math.round(Number(studentDashboard?.roadmapProgress?.progressPercentage || 0)))
  );

  const firstChild = portalMetrics.parentPortalData?.children?.[0] || null;
  const teacherHeatmap = portalMetrics.teacherHeatmapData || null;
  const managerPortal = portalMetrics.managerPortalData || null;


  // Role-specific menu configurations so each role has its own dedicated pages
  const getRoleNavigation = () => {
    switch (role) {
      case 'parent':
        return [
          {
            sectionTitle: 'Không Gian Phụ Huynh',
            items: [
              {
                id: 'dashboard',
                label: 'Tổng quan',
                sublabel: 'Điểm dự kiến & Sẵn sàng thi',
                icon: HeartHandshake,
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'results',
                label: 'Tiến độ & Kết quả của con',
                sublabel: 'Năng lực 4 môn & Lộ trình',
                icon: BarChart3,
                active: activeTab === 'results',
                onClick: () => setActiveTab('results')
              },
              {
                id: 'warnings',
                label: 'Cảnh báo & Trao đổi Giáo viên',
                sublabel: 'Cảnh báo sớm & Họp 3 bên',
                icon: AlertTriangle,
                active: activeTab === 'warnings',
                onClick: () => setActiveTab('warnings')
              }
            ]
          },
          {
            sectionTitle: 'Dịch Vụ & Học Phí',
            items: [
              {
                id: 'tuition',
                label: 'Học phí & Lịch sử giao dịch',
                sublabel: 'VietQR PayOS & Hóa đơn',
                icon: CreditCard,
                active: activeTab === 'tuition',
                onClick: () => setActiveTab('tuition')
              }
            ]
          }
        ];

      case 'teacher':
        return [
          {
            sectionTitle: 'Quản Lý Lớp Học',
            items: [
              {
                id: 'dashboard',
                label: 'Lớp học & Tiến độ',
                sublabel: 'Tiến độ, cảnh báo & thi thử',
                icon: LayoutGrid,
                active: activeTab === 'dashboard' || activeTab === 'teacher_heatmap' || activeTab === 'proctoring' || activeTab === 'analytics',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'roadmap_approval',
                label: 'Duyệt lộ trình học sinh',
                sublabel: 'Rà soát bản nháp & trình Giám đốc',
                icon: ClipboardCheck,
                active: activeTab === 'roadmap_approval',
                onClick: () => setActiveTab('roadmap_approval'),
                badge: 'Duyệt'
              },
              {
                id: 'schedule',
                label: 'Thời khóa biểu & Điểm danh',
                sublabel: 'Lịch dạy, phòng học & điểm danh',
                icon: Calendar,
                active: activeTab === 'schedule',
                onClick: () => setActiveTab('schedule')
              },
              {
                id: 'history',
                label: 'Lịch sử làm bài',
                sublabel: 'Tra cứu bài kiểm tra học viên',
                icon: History,
                active: activeTab === 'history',
                onClick: () => setActiveTab('history')
              }
            ]
          },
          {
            sectionTitle: 'Học Liệu & Đề Thi',
            items: [
              {
                id: 'roadmap',
                label: 'Khung chương trình',
                sublabel: 'Tra cứu cây kiến thức & Bloom',
                icon: Network,
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap'),
                badge: 'Tra cứu'
              },
              {
                id: 'textbook-standard',
                label: 'Sách giáo khoa (SGK)',
                sublabel: 'Tra cứu SGK chuẩn GDPT 2018',
                icon: BookOpen,
                iconColor: 'from-emerald-500 to-teal-700',
                active: activeTab === 'textbook-standard',
                onClick: () => setActiveTab('textbook-standard'),
                badge: 'Chuẩn'
              },
              {
                id: 'exam-bank',
                label: 'Kho đề thi đã xuất bản',
                sublabel: 'Tra cứu & xem đề khảo thí',
                icon: FileSpreadsheet,
                iconColor: 'from-indigo-500 to-blue-700',
                active: activeTab === 'exam-bank',
                onClick: () => setActiveTab('exam-bank'),
                badge: 'Kho Đề'
              }
            ]
          },
          {
            sectionTitle: 'Kiểm Duyệt & AI',
            items: [
              {
                id: 'ai_moderation',
                label: 'Kiểm duyệt gia sư AI',
                sublabel: 'Đề xuất sửa & Bẫy tư duy lớp mình',
                icon: Bot,
                active: activeTab === 'ai_moderation',
                onClick: () => setActiveTab('ai_moderation'),
                badge: 'Đề xuất'
              }
            ]
          }
        ];

      case 'director':
      case 'manager': {
        const currentRoles = Array.isArray(portalMetrics?.currentUser?.roles)
          ? portalMetrics.currentUser.roles.map((r) => String(r).toUpperCase())
          : [];
        const isDirectorRole =
          role === 'director' ||
          currentRoles.some((r) => r.includes('DIRECTOR')) ||
          String(portalMetrics?.currentUser?.email || '').toLowerCase().startsWith('director');

        if (isDirectorRole) {
          return [
            {
              sectionTitle: 'Quản Trị Học Thuật Liên Cơ Sở',
              items: [
                {
                  id: 'dashboard',
                  label: 'Tổng quan Các Cơ sở',
                  sublabel: 'Giám sát chất lượng liên cơ sở',
                  icon: Building2,
                  active: activeTab === 'dashboard',
                  onClick: () => setActiveTab('dashboard')
                },
                {
                  id: 'roadmap_approval',
                  label: 'Phê duyệt Lộ trình HS',
                  sublabel: 'Duyệt cuối & kích hoạt ACTIVE',
                  icon: ClipboardCheck,
                  active: activeTab === 'roadmap_approval',
                  onClick: () => setActiveTab('roadmap_approval'),
                  badge: 'Duyệt'
                },
                {
                  id: 'ai_moderation',
                  label: 'Kiểm duyệt Gia sư AI',
                  sublabel: 'Báo cáo sai lệch & Bẫy tư duy',
                  icon: Bot,
                  active: activeTab === 'ai_moderation',
                  onClick: () => setActiveTab('ai_moderation')
                },
                {
                  id: 'roadmap',
                  label: 'Quản lý Khung Chương trình',
                  sublabel: 'Đồ thị DAG 4 tầng & Học liệu',
                  icon: Network,
                  active: activeTab === 'roadmap',
                  onClick: () => setActiveTab('roadmap')
                },
                {
                  id: 'textbook-group',
                  label: 'Sách giáo khoa (SGK)',
                  sublabel: 'Chuẩn, Nạp & Studio',
                  icon: BookOpen,
                  iconColor: 'from-emerald-500 to-teal-700',
                  children: [
                    {
                      id: 'textbook-standard',
                      label: '1. Sách Giáo Khoa Chuẩn',
                      badge: 'Khung',
                      active: activeTab === 'textbook-standard',
                      onClick: () => setActiveTab('textbook-standard')
                    },
                    {
                      id: 'textbook-ingest',
                      label: '2. Nạp Tài Liệu SGK',
                      badge: '3 Phần',
                      active: activeTab === 'textbook-ingest',
                      onClick: () => setActiveTab('textbook-ingest')
                    },
                    {
                      id: 'textbook-studio',
                      label: '3. Studio Biên Soạn SGK',
                      badge: 'Studio',
                      active: activeTab === 'textbook-studio',
                      onClick: () => setActiveTab('textbook-studio')
                    }
                  ]
                },
                {
                  id: 'exam-group',
                  label: 'Kho Đề Thi',
                  sublabel: 'Kho đề, Phân tích & Studio',
                  icon: FileSpreadsheet,
                  iconColor: 'from-indigo-500 to-blue-700',
                  children: [
                    {
                      id: 'exam-bank',
                      label: '1. Kho Đề',
                      badge: 'Kho Đề',
                      active: activeTab === 'exam-bank',
                      onClick: () => setActiveTab('exam-bank')
                    },
                    {
                      id: 'exam-ingest',
                      label: '2. Phân Tích Đề',
                      active: activeTab === 'exam-ingest',
                      onClick: () => setActiveTab('exam-ingest')
                    },
                    {
                      id: 'exam-studio',
                      label: '3. Studio Biên Soạn',
                      badge: 'Studio',
                      active: activeTab === 'exam-studio',
                      onClick: () => setActiveTab('exam-studio')
                    }
                  ]
                }
              ]
            }
          ];
        }

        return [
          {
            sectionTitle: 'Điều Phối Học Thuật Cơ Sở',
            items: [
              {
                id: 'dashboard',
                label: 'Tổng quan & Đối sánh Cơ sở',
                sublabel: 'Bản đồ nhiệt lớp & Xuất báo cáo',
                icon: Building2,
                active: activeTab === 'dashboard' || activeTab === 'analytics',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'classes_schedule',
                label: 'Lớp học, Lịch học & Phân công GV',
                sublabel: 'Đợt học, Trần 20 HS & Thời khóa biểu',
                icon: Calendar,
                active: activeTab === 'classes_schedule',
                onClick: () => setActiveTab('classes_schedule')
              },
              {
                id: 'roadmap_approval',
                label: 'Duyệt Lộ Trình Cơ Sở',
                sublabel: 'Duyệt lộ trình HS & chuyển ngoại lệ',
                icon: ClipboardCheck,
                active: activeTab === 'roadmap_approval',
                onClick: () => setActiveTab('roadmap_approval'),
                badge: 'Cơ sở'
              },
              {
                id: 'clustering',
                label: 'Xếp lớp Đầu vào & Phân cụm AI',
                sublabel: 'K-Means 4 miền & Gán Giáo viên',
                icon: Sparkles,
                active: activeTab === 'clustering',
                onClick: () => setActiveTab('clustering')
              },
              {
                id: 'escalations',
                label: 'Cảnh báo Cấp 3 & Họp 3 bên',
                sublabel: 'Can thiệp học viên nguy cơ cao',
                icon: Activity,
                active: activeTab === 'escalations',
                onClick: () => setActiveTab('escalations')
              }
            ]
          }
        ];
      }

      case 'admin':
        return [{ sectionTitle: 'Quản trị hệ thống', items: [
          ['dashboard', 'Tổng quan hệ thống', 'Dữ liệu tài khoản & cơ sở', BarChart3, 'from-blue-600 to-indigo-600'],
          ['provision', 'Quản lý tài khoản', 'Cấp tài khoản, bật / tắt truy cập', Users, 'from-emerald-500 to-teal-600'],
          ['user_roles', 'Vai trò & Phân quyền', 'Phạm vi của 6 vai trò', ShieldCheck, 'from-purple-600 to-indigo-700'],
          ['campuses', 'Cơ sở đào tạo', 'Danh mục & thông tin liên hệ', Building2, 'from-amber-500 to-orange-600'],
          ['system_settings', 'Cấu hình hệ thống', 'Thông tin chung & dịch vụ AI', Sparkles, 'from-indigo-500 to-violet-600'],
          ['operations', 'Giám sát & Sao lưu', 'Nhật ký, dịch vụ & dữ liệu', Activity, 'from-rose-500 to-red-600']
        ].map(([id, label, sublabel, icon, iconColor]) => ({ id, label, sublabel, icon, iconColor, active: activeTab === id, onClick: () => setActiveTab(id) })) }];

      case 'student':
      default:
        return [
          {
            sectionTitle: 'Không Gian Học Viên',
            items: [
              {
                id: 'dashboard',
                label: 'Tổng quan Học tập',
                sublabel: 'Tiến độ cá nhân & Lộ trình hôm nay',
                icon: LayoutGrid,
                iconColor: 'from-slate-700 to-slate-900',
                activeGlow: 'shadow-slate-500/30',
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'diagnostic',
                label: 'Khảo thí & Chẩn đoán',
                sublabel: 'Đề chuẩn hóa năng lực & IRT 2PL',
                icon: ClipboardCheck,
                iconColor: 'from-orange-400 to-rose-500',
                activeGlow: 'shadow-rose-500/30',
                active: activeTab === 'diagnostic',
                onClick: () => setActiveTab('diagnostic'),
                badge: 'Khảo thí'
              },
              {
                id: 'history',
                label: 'Lịch sử làm bài',
                sublabel: 'Đáp án chi tiết & Sổ tay lỗi sai',
                icon: History,
                iconColor: 'from-amber-400 to-orange-500',
                activeGlow: 'shadow-amber-500/30',
                active: activeTab === 'history',
                onClick: () => setActiveTab('history')
              },
              {
                id: 'roadmap',
                label: 'Dàn kiến thức & Lộ trình',
                sublabel: 'Cây tri thức DAG & Học liệu',
                icon: Network,
                iconColor: 'from-blue-500 to-indigo-600',
                activeGlow: 'shadow-blue-500/30',
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap')
              },
              {
                id: 'roadmap_approval',
                label: 'Duyệt lộ trình học sinh',
                sublabel: 'Rà soát bản nháp & trình Giám đốc',
                icon: ClipboardCheck,
                active: activeTab === 'roadmap_approval',
                onClick: () => setActiveTab('roadmap_approval'),
                badge: 'Duyệt'
              },
              {
                id: 'schedule',
                label: 'Thời khóa biểu & Điểm danh',
                sublabel: 'Lịch học theo kỳ, khóa & chuyên cần',
                icon: Calendar,
                iconColor: 'from-blue-600 via-indigo-600 to-cyan-500',
                activeGlow: 'shadow-blue-500/30',
                active: activeTab === 'schedule',
                onClick: () => setActiveTab('schedule')
              },
              {
                id: 'analytics',
                label: 'Báo cáo & Dự báo Điểm',
                sublabel: 'Phân tích BKT & Điểm mục tiêu',
                icon: BarChart3,
                iconColor: 'from-emerald-400 to-teal-600',
                activeGlow: 'shadow-emerald-500/30',
                active: activeTab === 'analytics',
                onClick: () => setActiveTab('analytics')
              }
            ]
          },
          {
            sectionTitle: 'Luyện Tập & Gia Sư AI',
            items: [
              {
                id: 'adaptive',
                label: 'Luyện tập Thích ứng ZPD',
                sublabel: 'Sinh câu hỏi sát vùng năng lực',
                icon: Zap,
                iconColor: 'from-yellow-400 to-amber-500',
                activeGlow: 'shadow-yellow-500/30',
                active: activeTab === 'adaptive-practice',
                onClick: onOpenAdaptiveQuiz
              },
              {
                id: 'mock',
                label: 'Phòng Thi thử V-ACT',
                sublabel: 'Luyện làm bài có bấm giờ',
                icon: FileCheck2,
                iconColor: 'from-cyan-400 to-blue-500',
                activeGlow: 'shadow-cyan-500/30',
                active: activeTab === 'mock' || activeTab === 'mock-exam',
                onClick: onOpenMockExam
              },
              {
                id: 'ai',
                label: 'AI Socratic Tutor 24/7',
                sublabel: 'Gợi mở tư duy & Không giải hộ',
                icon: Bot,
                iconColor: 'from-violet-500 to-purple-600',
                activeGlow: 'shadow-purple-500/30',
                active: false,
                onClick: onOpenAiTutor,
                badge: 'AI'
              }
            ]
          },
          {
            sectionTitle: 'Dịch Vụ Học Viên',
            items: [
              {
                id: 'tuition',
                label: 'Học phí & Gói học',
                sublabel: 'Nâng cấp gói luyện thi PayOS',
                icon: CreditCard,
                iconColor: 'from-indigo-400 to-blue-600',
                activeGlow: 'shadow-indigo-500/30',
                active: activeTab === 'tuition',
                onClick: () => setActiveTab('tuition')
              }
            ]
          }
        ];
    }
  };

  const prevTabRef = React.useRef(activeTab);
  const [expandedGroups, setExpandedGroups] = useState({
    exams: activeTab === 'diagnostic' || activeTab === 'mock-exam' || activeTab === 'quiz-practice',
    'roadmap-group': true,
    'textbook-group': activeTab === 'textbook-standard' || activeTab === 'textbook-ingest' || activeTab === 'textbook-studio',
    'exam-group': activeTab === 'exam-bank' || activeTab === 'exam-ingest' || activeTab === 'exam-studio'
  });

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      if (activeTab === 'diagnostic' || activeTab === 'mock-exam' || activeTab === 'quiz-practice') {
        setExpandedGroups(prev => ({ ...prev, exams: true }));
      }
      if (activeTab === 'roadmap' || activeTab === 'adaptive-practice' || activeTab === 'foundation-knowledge' || activeTab === 'mistake-notebook') {
        setExpandedGroups(prev => ({ ...prev, 'roadmap-group': true }));
      }
      if (activeTab === 'textbook-standard' || activeTab === 'textbook-ingest' || activeTab === 'textbook-studio') {
        setExpandedGroups(prev => ({ ...prev, 'textbook-group': true }));
      }
      if (activeTab === 'exam-bank' || activeTab === 'exam-ingest' || activeTab === 'exam-studio') {
        setExpandedGroups(prev => ({ ...prev, 'exam-group': true }));
      }
    }
  }, [activeTab]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  let navSections = getRoleNavigation();
  if (role === 'student') {
    // Phân tách chuẩn Core Flow 2 (Lộ trình cá nhân hóa) & Core Flow 3 (Luyện tập P-L-A-R + Sổ tay lỗi sai SM-2)
    const entries = Object.fromEntries(navSections.flatMap((section) => section.items).map((item) => [item.id, item]));
    navSections = [
      { sectionTitle: 'Tổng quan', items: [entries.dashboard] },
      { sectionTitle: 'Học tập', items: [
        {
          id: 'roadmap-group',
          label: 'Lộ trình của tôi',
          sublabel: 'Lộ trình, P-L-A-R & Sổ tay',
          icon: Network,
          iconColor: 'from-blue-500 to-indigo-600',
          children: [
            {
              id: 'roadmap',
              label: 'Lộ trình cá nhân hóa',
              active: activeTab === 'roadmap',
              onClick: () => setActiveTab('roadmap')
            },
            {
              id: 'adaptive-practice',
              label: 'Luyện tập (P-L-A-R)',
              active: activeTab === 'adaptive-practice',
              onClick: () => setActiveTab('adaptive-practice')
            },
            {
              id: 'foundation-knowledge',
              label: 'Kiến thức nền',
              active: activeTab === 'foundation-knowledge',
              onClick: () => setActiveTab('foundation-knowledge')
            },
            {
              id: 'mistake-notebook',
              label: 'Sổ tay lỗi sai (SM-2)',
              active: activeTab === 'mistake-notebook',
              onClick: () => setActiveTab('mistake-notebook')
            }
          ]
        },
        { ...entries.schedule, label: 'Thời khóa biểu & Điểm danh' },
        { ...entries.adaptive, label: 'Luyện tập' } ,
        { ...entries.ai, label: 'Gia sư AI' }
      ] },
      { sectionTitle: 'Đánh giá', items: [
        { id: 'exams', label: 'Kiểm tra & Thi thử', icon: ClipboardCheck, iconColor: 'from-orange-400 to-rose-500',
          children: [
            { ...entries.diagnostic, label: 'Đánh giá đầu vào' },
            { ...entries.mock, label: 'Thi thử V-ACT' },
            {
              id: 'quiz-practice',
              label: 'Luyện tập Quiz',
              active: activeTab === 'quiz-practice',
              onClick: () => setActiveTab('quiz-practice')
            }
          ] },
        entries.history,
        { ...entries.analytics, label: 'Báo cáo học tập' }
      ] },
      { sectionTitle: 'Dịch vụ học viên', items: [entries.tuition].filter(Boolean) }
    ];
  }

  return (
    <aside className={`${mobile ? 'flex w-full min-h-full p-5' : (isCollapsed ? 'hidden lg:flex w-20 p-3 h-full sticky top-0 overflow-y-auto' : 'hidden lg:flex w-72 p-5 h-full sticky top-0 overflow-y-auto')} flex-col border-r border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white select-none shrink-0 transition-all duration-200`}>
      <div className="space-y-6 shrink-0">
        {/* Brand Identity Header - Synchronized with Home Page (PublicHeader.jsx) */}
        <div className={`flex items-center px-1 ${!isCollapsed ? 'justify-between gap-2' : 'justify-center'}`}>
          {!isCollapsed ? (
            <>
              <BrandLogo className="w-36" />
              {!mobile && onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Thu gọn thanh bên"
                  title="Thu gọn thanh bên"
                  className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                V
              </span>
              {!mobile && onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Mở rộng thanh bên"
                  title="Mở rộng thanh bên"
                  className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Role-Specific Navigation Sections */}
        <nav className="order-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.sectionTitle} className="space-y-1.5">
              {!isCollapsed ? (
                <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="flex-1">{section.sectionTitle}</span>
                  <span className="h-px flex-1 bg-slate-100" />
                </div>
              ) : (
                <div className="h-px w-8 mx-auto bg-slate-200 my-2" />
              )}
              <div className="space-y-1">
                {section.items.filter(Boolean).map((item) => {
                  // Keep navigation renderable if a role-specific config omits an icon.
                  const Icon = item.icon || Activity;
                  const iconGradient = item.iconColor || 'from-slate-400 to-slate-600';
                  const glowClass = item.activeGlow || 'shadow-blue-500/30';
                  if (item.children) {
                    const isExpanded = !!expandedGroups[item.id];
                    const activeGroup = item.children.some((child) => child.active);
                    const isTextbookGroup = item.id === 'textbook-group';
                    const isExamGroup = item.id === 'exam-group';
                    const groupIconGradient =
                      item.iconColor ||
                      (isTextbookGroup
                        ? 'from-emerald-500 to-teal-700'
                        : isExamGroup
                        ? 'from-indigo-500 to-blue-700'
                        : 'from-orange-400 to-rose-500');

                    if (isCollapsed) {
                      return (
                        <div key={item.id} className="relative group/collapsed">
                          <button
                            type="button"
                            title={item.label}
                            onClick={() => {
                              onToggleCollapse?.();
                              toggleGroup(item.id);
                            }}
                            className={`flex w-full items-center justify-center rounded-xl p-2.5 transition-colors cursor-pointer bg-transparent ${
                              activeGroup
                                ? 'text-indigo-600'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`nav-group-${item.id}-${mobile ? 'mobile' : 'desktop'}`}
                          onClick={() => toggleGroup(item.id)}
                          className={`flex w-full items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                            activeGroup
                              ? isTextbookGroup
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-950 font-bold'
                                : isExamGroup
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-950 font-bold'
                                : 'border-indigo-100 bg-indigo-50/70 text-indigo-700'
                              : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-extrabold truncate">{item.label}</span>
                            {item.sublabel && <span className="block text-[10px] text-slate-400 font-medium truncate">{item.sublabel}</span>}
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${activeGroup ? (isTextbookGroup ? 'text-emerald-700' : 'text-indigo-600') : 'text-slate-400'}`} />
                        </button>
                        <div id={`nav-group-${item.id}-${mobile ? 'mobile' : 'desktop'}`} hidden={!isExpanded}>
                          <div className={`mb-2 ml-3.5 mt-1 space-y-1 border-l-2 pl-3 ${isTextbookGroup ? 'border-emerald-200' : isExamGroup ? 'border-indigo-200' : 'border-indigo-100'}`}>
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                type="button"
                                aria-current={child.active ? 'page' : undefined}
                                onClick={() => { child.onClick?.(); onNavigate?.(); }}
                                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                                  child.active
                                    ? isTextbookGroup
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-sm shadow-emerald-500/25'
                                      : isExamGroup
                                      ? 'bg-gradient-to-r from-[#1E3A5F] to-indigo-600 font-bold text-white shadow-sm shadow-indigo-500/25'
                                      : 'bg-gradient-to-r from-orange-500 to-rose-500 font-bold text-white shadow-sm shadow-orange-500/25'
                                    : isTextbookGroup
                                    ? 'font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                                    : isExamGroup
                                    ? 'font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                                    : 'font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                                }`}
                              >
                                <span className="truncate">{child.label}</span>
                                {child.badge && (
                                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                    child.active
                                      ? 'bg-white/20 text-white'
                                      : isTextbookGroup
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isExamGroup
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-orange-50 text-orange-600'
                                  }`}>
                                    {child.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isCollapsed) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.label}
                        aria-current={item.active ? 'page' : undefined}
                        onClick={() => { item.onClick?.(); onNavigate?.(); }}
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer bg-transparent ${
                          item.active
                            ? 'text-indigo-600'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={item.active ? 'page' : undefined}
                      onClick={() => {
                        item.onClick?.();
                        onNavigate?.();
                      }}
                      title={item.sublabel ? `${item.label} (${item.sublabel})` : item.label}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-150 cursor-pointer group border ${
                        item.active
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-transparent text-white shadow-md shadow-blue-500/25 font-bold'
                          : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 hover:border-slate-200/60 font-medium'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span
                          className={`block text-xs sm:text-sm truncate ${
                            item.active
                              ? 'font-black text-white'
                              : 'font-bold text-slate-800 group-hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span
                            className={`block text-[10px] truncate ${
                              item.active ? 'text-blue-100 font-medium' : 'text-slate-400 font-medium'
                            }`}
                          >
                            {item.sublabel}
                          </span>
                        )}
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            item.active
                              ? 'bg-white/20 text-white border border-white/20'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Role-Specific Footer Card (Matches Home Page Deep Royal Blue-Indigo Gradient) */}
      {isCollapsed ? (
        <div
          className="mt-6 shrink-0 flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white shadow-md border border-blue-600/30 cursor-pointer"
          title={`Vai trò: ${role.toUpperCase()}`}
          onClick={onToggleCollapse}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[9px] font-mono font-bold uppercase mt-1 text-cyan-200">{role.slice(0, 3)}</span>
        </div>
      ) : (
      <div className="mt-6 shrink-0 p-4 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white space-y-3 shadow-lg border border-blue-600/30 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#FACC15]/15 blur-xl pointer-events-none"></div>

        {role === 'student' && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 text-[10px] uppercase tracking-wide font-extrabold text-[#FACC15] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Hồ Sơ Năng Lực IRT</span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-[11px] px-2 py-1 rounded-lg bg-white/15 text-cyan-200 font-mono font-bold tabular-nums">
                θ₀ = {thetaDisplay}
              </span>
            </div>
            <div className="text-xs font-semibold text-blue-100">
              Nhóm hiện tại: <strong className="text-white">{placementLabel}</strong>
            </div>
            <div className="w-full bg-slate-950/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FACC15] via-amber-400 to-cyan-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${studentProgressPct}%` }}
              ></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-100">
              <span className="whitespace-nowrap">Mục tiêu: {studentTarget}+ ĐGNL</span>
              <span className="whitespace-nowrap text-[#FACC15] font-black">{studentProgressPct}% lộ trình</span>
            </div>
          </>
        )}

        {role === 'parent' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FACC15] flex items-center gap-1">
                <HeartHandshake className="w-3 h-3" />
                <span>Học Sinh Liên Kết</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                {firstChild ? 'Đã đồng bộ' : 'Chưa liên kết'}
              </span>
            </div>
            <div
              className="text-xs font-extrabold text-white truncate"
              title={
                firstChild
                  ? `${firstChild.studentName}${firstChild.school ? ` • ${firstChild.school}` : (firstChild.grade ? ` • ${firstChild.grade}` : '')}`
                  : undefined
              }
            >
              {firstChild
                ? `${firstChild.studentName}${firstChild.school ? ` • ${firstChild.school}` : (firstChild.grade ? ` • ${firstChild.grade}` : '')}`
                : 'Chưa có học sinh liên kết'}
            </div>
            <div className="text-[11px] text-blue-100 flex items-center justify-between">
              <span>Chỉ số sẵn sàng thi:</span>
              <strong className="text-[#FACC15] font-black">
                {firstChild
                  ? `${Number(firstChild.examReadiness?.readinessIndex ?? 0).toFixed(1)}%`
                  : '--'}
              </strong>
            </div>
          </>
        )}

        {role === 'teacher' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FACC15] flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Trạng Thái Giảng Dạy</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 font-bold">
                Giáo viên
              </span>
            </div>
            <div className="text-xs font-extrabold text-white truncate">
              {teacherHeatmap?.className || 'Không gian giảng dạy của bạn'}
            </div>
            <div className="text-[11px] text-blue-100 flex items-center justify-between">
              <span>{teacherHeatmap ? 'Kỹ năng theo dõi:' : 'Học liệu · Đề thi · Học sinh'}</span>
              <strong className="text-[#FACC15] font-black">
                {teacherHeatmap ? `${teacherHeatmap.columns?.length ?? 0} chuyên đề` : 'Tra cứu'}
              </strong>
            </div>
          </>
        )}

        {(role === 'manager' || role === 'director') && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FACC15] flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{role === 'director' ? 'Hội Đồng Học Thuật' : 'Điều Phối Cơ Sở'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Live API
              </span>
            </div>
            <div className="text-xs font-extrabold text-white truncate">
              {portalMetrics.campusesCount ?? 0} Cơ sở • {managerPortal?.totalClasses ?? 0} Lớp học
            </div>
            <div className="text-[11px] text-blue-100 flex items-center justify-between">
              <span>Giảng viên trực thuộc:</span>
              <strong className="text-[#FACC15] font-black">
                {portalMetrics.teachersCount ?? 0} Giảng viên
              </strong>
            </div>
          </>
        )}

        {role === 'admin' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FACC15] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Bảo Mật IAM & CSDL</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                CH?A GI?M S?T
              </span>
            </div>
            <div className="text-xs font-extrabold text-white">
              Gateway :5212 • PostgreSQL
            </div>
            <div className="text-[11px] text-blue-100 flex items-center justify-between">
              <span>Tài khoản hệ thống:</span>
              <strong className="text-[#FACC15] font-black">
                {portalMetrics.totalUsersCount ?? 0} Users
              </strong>
            </div>
          </>
        )}
      </div>
      )}
    </aside>
  );
}
