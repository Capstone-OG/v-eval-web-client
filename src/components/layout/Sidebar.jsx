import BrandLogo from '../common/BrandLogo';
import React from 'react';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  History,
  LayoutGrid,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Video,
  Zap
} from 'lucide-react';

const ROLE_PORTAL_META = {
  student: {
    badge: 'Cổng Học Viên ĐGNL',
    subtitle: 'Adaptive Learning & IRT 2PL',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-[#FACC15]',
    icon: GraduationCap
  },
  parent: {
    badge: 'Cổng Phụ Huynh Đồng Hành',
    subtitle: 'Theo dõi Tiến độ & Cảnh báo Sớm',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-emerald-500',
    icon: HeartHandshake
  },
  teacher: {
    badge: 'Cổng Giảng Viên Sư Phạm',
    subtitle: 'Heatmap 2D & Studio Học Liệu',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-cyan-400',
    icon: BookOpen
  },
  manager: {
    badge: 'Cổng Quản Lý Cơ Sở',
    subtitle: 'Điều Phối Học Thuật & AI Clustering',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    dotClass: 'bg-blue-600',
    icon: Briefcase
  },
  admin: {
    badge: 'Cổng Quản Trị Hệ Thống IAM',
    subtitle: 'Phân Quyền & Vận Hành Liên Cơ Sở',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    icon: ShieldCheck
  }
};

export default function Sidebar({
  role = 'student',
  activeTab,
  setActiveTab,
  onOpenAdaptiveQuiz,
  onOpenMockExam,
  onOpenAiTutor,
  onOpenLiveClass,
  latestDiagnosticResult,
  portalMetrics = {}
}) {
  const studentDashboard = portalMetrics.studentDashboard;
  const rawTheta = latestDiagnosticResult?.theta_0 ?? studentDashboard?.theta0;
  const thetaDisplay =
    rawTheta !== undefined && rawTheta !== null
      ? Number(rawTheta) > 0
        ? `+${Number(rawTheta).toFixed(2)}`
        : `${Number(rawTheta).toFixed(2)}`
      : '0.00';

  const placementCode = latestDiagnosticResult?.placement_class || studentDashboard?.placementClass;
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

  const portalMeta = ROLE_PORTAL_META[role] || ROLE_PORTAL_META.student;
  const PortalIcon = portalMeta.icon;

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
                label: 'Tổng quan Đồng hành',
                sublabel: 'Chỉ số R_exam & Kỷ luật tuần',
                icon: HeartHandshake,
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'analytics',
                label: 'Báo cáo Năng lực 4 Miền',
                sublabel: 'Biểu đồ tiến bộ & Dự báo điểm',
                icon: TrendingUp,
                active: activeTab === 'analytics',
                onClick: () => setActiveTab('analytics')
              },
              {
                id: 'history',
                label: 'Lịch sử Bài thi của Con',
                sublabel: 'Chi tiết điểm & Nhận xét AI',
                icon: History,
                active: activeTab === 'history',
                onClick: () => setActiveTab('history')
              },
              {
                id: 'roadmap',
                label: 'Cây Tri thức & Chuyên đề',
                sublabel: 'Theo dõi lộ trình học của con',
                icon: Network,
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap')
              }
            ]
          },
          {
            sectionTitle: 'Dịch Vụ & Học Phí',
            items: [
              {
                id: 'tuition',
                label: 'Đóng Học phí & Gói học',
                sublabel: 'Cổng VietQR PayOS tức thì',
                icon: CreditCard,
                active: activeTab === 'tuition',
                onClick: () => setActiveTab('tuition'),
                badge: 'PayOS'
              }
            ]
          }
        ];

      case 'teacher':
        return [
          {
            sectionTitle: 'Điều Phối Giảng Dạy',
            items: [
              {
                id: 'dashboard',
                label: 'Ma trận Nhiệt Lớp học 2D',
                sublabel: 'Xếp nhóm vi mô & Giao bài ZPD',
                icon: LayoutGrid,
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'roadmap',
                label: 'Studio Biên soạn Học liệu',
                sublabel: 'Cây chương trình & Câu hỏi LaTeX',
                icon: BookOpen,
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap'),
                badge: 'Studio'
              },
              {
                id: 'diagnostic',
                label: 'Ngân hàng Đề Khảo thí',
                sublabel: 'Kiểm thử đề 30 câu & Ma trận',
                icon: ClipboardCheck,
                active: activeTab === 'diagnostic',
                onClick: () => setActiveTab('diagnostic')
              },
              {
                id: 'history',
                label: 'Nhật ký Bài làm Học viên',
                sublabel: 'Phân tích lỗi sai & Socratic AI',
                icon: History,
                active: activeTab === 'history',
                onClick: () => setActiveTab('history')
              },
              {
                id: 'analytics',
                label: 'Phân tích Tâm trắc học',
                sublabel: 'Thống kê IRT 2PL & BKT lớp',
                icon: BarChart3,
                active: activeTab === 'analytics',
                onClick: () => setActiveTab('analytics')
              }
            ]
          },
          {
            sectionTitle: 'Tương Tác Trực Tuyến',
            items: [
              {
                id: 'live',
                label: 'Phòng Live Q&A Socratic',
                sublabel: 'Giải đáp chuyên đề trực tuyến',
                icon: Video,
                active: false,
                onClick: onOpenLiveClass
              }
            ]
          }
        ];

      case 'manager':
        return [
          {
            sectionTitle: 'Quản Trị Học Thuật Cơ Sở',
            items: [
              {
                id: 'dashboard',
                label: 'Trung tâm Điều phối Cơ sở',
                sublabel: 'AI Clustering & Bản đồ nhiệt',
                icon: Building2,
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'teacher_heatmap',
                label: 'Giám sát Ma trận Lớp học',
                sublabel: 'Theo dõi độ làm chủ từng lớp',
                icon: LayoutGrid,
                active: activeTab === 'teacher_heatmap',
                onClick: () => setActiveTab('teacher_heatmap')
              },
              {
                id: 'roadmap',
                label: 'Quản lý Khung Chương trình',
                sublabel: 'Phê duyệt học liệu & Câu hỏi',
                icon: Network,
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap')
              },
              {
                id: 'analytics',
                label: 'Báo cáo Chất lượng Đào tạo',
                sublabel: 'Dự báo điểm chuẩn ĐGNL cơ sở',
                icon: BarChart3,
                active: activeTab === 'analytics',
                onClick: () => setActiveTab('analytics')
              }
            ]
          },
          {
            sectionTitle: 'Nhân Sự & Tài Khoản Cơ Sở',
            items: [
              {
                id: 'provision',
                label: 'Cấp phát Tài khoản Cơ sở',
                sublabel: 'Giảng viên & Học viên mới',
                icon: UserPlus,
                active: activeTab === 'provision',
                onClick: () => setActiveTab('provision'),
                badge: 'IAM'
              }
            ]
          }
        ];

      case 'admin':
        return [
          {
            sectionTitle: 'Quản Trị Hệ Thống & IAM',
            items: [
              {
                id: 'provision',
                label: 'Quản trị Định danh & IAM',
                sublabel: 'Cấp phát tài khoản đa vai trò',
                icon: ShieldCheck,
                active: activeTab === 'provision',
                onClick: () => setActiveTab('provision'),
                badge: 'Core'
              },
              {
                id: 'dashboard',
                label: 'Giám sát Đa Cơ sở (Multi-Campus)',
                sublabel: 'Bản đồ nhiệt & Phân cụm AI',
                icon: Building2,
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'teacher_heatmap',
                label: 'Ma trận Nhiệt Toàn Hệ thống',
                sublabel: 'Kiểm soát chất lượng giảng dạy',
                icon: LayoutGrid,
                active: activeTab === 'teacher_heatmap',
                onClick: () => setActiveTab('teacher_heatmap')
              },
              {
                id: 'roadmap',
                label: 'Cây Tri thức Quốc gia & Đề thi',
                sublabel: 'Cấu trúc chương trình V-ACT',
                icon: Network,
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap')
              },
              {
                id: 'tuition',
                label: 'Đối soát Cổng Thanh toán PayOS',
                sublabel: 'Quản lý gói học & Giao dịch',
                icon: CreditCard,
                active: activeTab === 'tuition',
                onClick: () => setActiveTab('tuition')
              }
            ]
          }
        ];

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
                active: activeTab === 'dashboard',
                onClick: () => setActiveTab('dashboard')
              },
              {
                id: 'diagnostic',
                label: 'Khảo thí & Chẩn đoán',
                sublabel: 'Đề chuẩn hóa 30 câu & IRT 2PL',
                icon: ClipboardCheck,
                active: activeTab === 'diagnostic',
                onClick: () => setActiveTab('diagnostic'),
                badge: '30 câu'
              },
              {
                id: 'history',
                label: 'Lịch sử làm bài',
                sublabel: 'Đáp án chi tiết & Sổ tay lỗi sai',
                icon: History,
                active: activeTab === 'history',
                onClick: () => setActiveTab('history')
              },
              {
                id: 'roadmap',
                label: 'Dàn kiến thức & Lộ trình',
                sublabel: 'Cây tri thức DAG & Học liệu',
                icon: Network,
                active: activeTab === 'roadmap',
                onClick: () => setActiveTab('roadmap')
              },
              {
                id: 'analytics',
                label: 'Báo cáo & Dự báo Điểm',
                sublabel: 'Phân tích BKT & Điểm mục tiêu',
                icon: BarChart3,
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
                active: false,
                onClick: onOpenAdaptiveQuiz
              },
              {
                id: 'mock',
                label: 'Phòng Thi thử V-ACT',
                sublabel: 'Mô phỏng áp lực thời gian thực',
                icon: FileCheck2,
                active: false,
                onClick: onOpenMockExam
              },
              {
                id: 'ai',
                label: 'AI Socratic Tutor 24/7',
                sublabel: 'Gợi mở tư duy & Không giải hộ',
                icon: Bot,
                active: false,
                onClick: onOpenAiTutor,
                badge: 'AI'
              },
              {
                id: 'live',
                label: 'Lớp học & Live Q&A',
                sublabel: 'Tương tác trực tiếp cùng GV',
                icon: Video,
                active: false,
                onClick: onOpenLiveClass
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
                active: activeTab === 'tuition',
                onClick: () => setActiveTab('tuition')
              }
            ]
          }
        ];
    }
  };

  const navSections = getRoleNavigation();

  return (
    <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-slate-200/80 bg-[#FDFBF7]/95 backdrop-blur-xl p-5 select-none shrink-0">
      <div className="space-y-6">
        {/* Brand Identity Header - Synchronized with Home Page (PublicHeader.jsx) */}
        <div className="space-y-3 px-1">
          <BrandLogo className="w-44" />

          {/* Dedicated Role Portal Badge */}
          <div
            className={`p-3 rounded-2xl border ${portalMeta.badgeClass} flex items-center gap-2.5 shadow-2xs`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
              <PortalIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black tracking-tight truncate flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${portalMeta.dotClass}`}></span>
                <span>{portalMeta.badge}</span>
              </div>
              <div className="text-[10px] font-semibold opacity-80 truncate">
                {portalMeta.subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Role-Specific Navigation Sections */}
        <nav className="space-y-5">
          {navSections.map((section) => (
            <div key={section.sectionTitle} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {section.sectionTitle}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                        item.active
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-700 hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            item.active
                              ? 'bg-white/20 text-[#FACC15]'
                              : 'bg-white border border-slate-200/80 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-extrabold truncate ${
                              item.active ? 'text-white' : 'text-slate-800 group-hover:text-blue-700'
                            }`}
                          >
                            {item.label}
                          </div>
                          {item.sublabel && (
                            <div
                              className={`text-[10px] truncate ${
                                item.active ? 'text-blue-100 font-medium' : 'text-slate-400 font-medium'
                              }`}
                            >
                              {item.sublabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            item.active
                              ? 'bg-[#FACC15] text-slate-950'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
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
      <div className="mt-6 p-4 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white space-y-3 shadow-lg border border-blue-600/30 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#FACC15]/15 blur-xl pointer-events-none"></div>

        {role === 'student' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FACC15] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Hồ Sơ Năng Lực IRT</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-cyan-200 font-mono font-bold">
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
            <div className="flex items-center justify-between text-[11px] text-blue-100">
              <span>Mục tiêu: {studentTarget}+ ĐGNL</span>
              <span className="text-[#FACC15] font-black">{studentProgressPct}% lộ trình</span>
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
            <div className="text-xs font-extrabold text-white truncate">
              {firstChild
                ? `${firstChild.studentName}${firstChild.grade ? ` • ${firstChild.grade}` : ''}`
                : 'Chưa có học sinh liên kết'}
            </div>
            <div className="text-[11px] text-blue-100 flex items-center justify-between">
              <span>Chỉ số sẵn sàng R_exam:</span>
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
                Live BKT
              </span>
            </div>
            <div className="text-xs font-extrabold text-white truncate">
              {teacherHeatmap?.className || 'Lớp phụ trách'} • {teacherHeatmap?.totalStudents ?? 0} Học viên
            </div>
            <div className="text-[11px] text-blue-100 flex items-center justify-between">
              <span>Kỹ năng theo dõi:</span>
              <strong className="text-[#FACC15] font-black">
                {teacherHeatmap?.columns?.length ?? 0} chuyên đề
              </strong>
            </div>
          </>
        )}

        {role === 'manager' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FACC15] flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Điều Phối Cơ Sở</span>
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
                ONLINE
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
    </aside>
  );
}
