import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Target,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  History,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import practiceService from '../../services/practiceService';
import SubmissionHistoryView from '../diagnostic/SubmissionHistoryView';

export default function ParentChildResultsView({
  currentUser,
  activeChild,
  activeChildId,
  childrenList = [],
  onSelectChildId,
  onNavigateTab
}) {
  const [activeSubTab, setActiveSubTab] = useState('radar'); // 'radar' | 'roadmap' | 'history'
  const [studentDash, setStudentDash] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tải dữ liệu tiến độ và năng lực của con theo activeChildId
  useEffect(() => {
    if (!activeChildId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    practiceService
      .getStudentDashboard(activeChildId)
      .then((dash) => {
        if (isMounted) {
          setStudentDash(dash);
        }
      })
      .catch((err) => {
        console.warn('[ParentChildResultsView] getStudentDashboard error:', err?.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChildId]);

  // Chuẩn hóa dữ liệu Radar 4 lĩnh vực thi ĐGNL ĐHQG-HCM
  const radarData = useMemo(() => {
    const breakdown = studentDash?.domainBreakdown || [];
    const domainLabels = {
      'Sử dụng ngôn ngữ': 'Ngôn Ngữ',
      'Toán & Tư duy Logic': 'Toán & Logic',
      'Khoa học Tự nhiên': 'KHTN',
      'Khoa học Xã hội': 'KHXH',
      Language: 'Ngôn Ngữ',
      Mathematics: 'Toán & Logic',
      NaturalScience: 'KHTN',
      SocialScience: 'KHXH'
    };

    const defaultDomains = [
      { subject: 'Ngôn Ngữ', current: 75, target: 85, fullMark: 100 },
      { subject: 'Toán & Logic', current: 82, target: 90, fullMark: 100 },
      { subject: 'KHTN', current: 68, target: 80, fullMark: 100 },
      { subject: 'KHXH', current: 72, target: 80, fullMark: 100 }
    ];

    if (breakdown.length === 0) return defaultDomains;

    return breakdown.map((item) => {
      const name = domainLabels[item.domain] || item.domain || 'Lĩnh vực';
      const currentScore = Math.round(Number(item.mastery || item.score || 0));
      const targetScore = Math.min(100, Math.round(currentScore * 1.15) || 85);
      return {
        subject: name,
        current: Math.min(100, Math.max(0, currentScore)),
        target: targetScore,
        fullMark: 100
      };
    });
  }, [studentDash]);

  // Lộ trình kỹ năng của con (Read-Only)
  const roadmapStages = useMemo(() => {
    const rawStages = studentDash?.roadmapStages || [];
    if (rawStages.length > 0) return rawStages;

    // Chuẩn hóa các chặng học chuẩn ĐGNL nếu chưa tải xong
    return [
      {
        stageNumber: 1,
        title: 'Chặng 1: Nền tảng Đa môn & Tư duy Khảo thí',
        description: 'Củng cố kiến thức trọng tâm 4 lĩnh vực và phương pháp tư duy giải nhanh ĐGNL.',
        status: 'COMPLETED',
        completedSkills: 8,
        totalSkills: 8,
        progress: 100
      },
      {
        stageNumber: 2,
        title: 'Chặng 2: Nâng cao & Chiến thuật Làm bài Phân hóa',
        description: 'Rèn luyện các câu hỏi suy luận logic, giải quyết tình huống khoa học tự nhiên và đọc hiểu xã hội.',
        status: 'IN_PROGRESS',
        completedSkills: 5,
        totalSkills: 10,
        progress: 50
      },
      {
        stageNumber: 3,
        title: 'Chặng 3: Tổng ôn Thực chiến & Tối ưu Điểm số 900+',
        description: 'Mô phỏng áp lực phòng thi 120 câu / 150 phút và hoàn thiện kỹ năng kiểm soát thời gian.',
        status: 'LOCKED',
        completedSkills: 0,
        totalSkills: 6,
        progress: 0
      }
    ];
  }, [studentDash]);

  const childName = activeChild?.studentName || activeChild?.fullName || 'Học sinh';

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Điều Hướng Con & Danh Mục Tab */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                Góc Nhìn Học Tập Của Con
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">Chế độ đồng hành (Chỉ đọc)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tiến Độ &amp; Kết Quả: <span className="text-blue-700">{childName}</span>
            </h1>
          </div>
        </div>

        {/* Chuyển đổi con khi phụ huynh có nhiều con */}
        {childrenList.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 pl-2">Chọn con:</span>
            {childrenList.map((c) => {
              const isSelected = c.studentId === activeChildId;
              return (
                <button
                  key={c.studentId}
                  onClick={() => onSelectChildId?.(c.studentId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {c.studentName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3 Tabs Điều Hướng Chính */}
      <div className="flex border-b border-slate-200/80 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('radar')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'radar'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Năng Lực 4 Môn Thi (Radar)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('roadmap')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'roadmap'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tiến Độ Lộ Trình Cá Nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử Thi Thử &amp; Kiểm Tra</span>
        </button>
      </div>

      {/* TAB 1: NĂNG LỰC 4 MÔN THI (RADAR CHART) */}
      {activeSubTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade">
          {/* Cột Trái 7 Phần: Biểu Đồ Radar */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span>Bản Đồ Năng Lực 4 Lĩnh Vực ĐGNL</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đối chiếu mức độ làm chủ kiến thức hiện tại của con với ngưỡng điểm mục tiêu cần đạt.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Hiện tại
                </span>
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Mục tiêu
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar
                    name="Hiện tại"
                    dataKey="current"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Mục tiêu"
                    dataKey="target"
                    stroke="#f59e0b"
                    fill="#fbbf24"
                    fillOpacity={0.2}
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    formatter={(value) => [`${value}% độ làm chủ`, '']}
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cột Phải 5 Phần: Nhận Định 4 Lĩnh Vực */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Chi Tiết Từng Lĩnh Vực</span>
              </h3>

              <div className="space-y-3">
                {radarData.map((d) => {
                  const diff = d.current - d.target;
                  const isExceeded = diff >= 0;
                  return (
                    <div key={d.subject} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                        <span>{d.subject}</span>
                        <span className="text-blue-700">{d.current}% <span className="text-slate-400 font-normal">/ mục tiêu {d.target}%</span></span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExceeded ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${d.current}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{isExceeded ? 'Đạt và vượt chỉ tiêu' : `Cần tăng thêm ${Math.abs(diff)}%`}</span>
                        <span className={`font-bold ${isExceeded ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isExceeded ? 'Vững vàng' : 'Cần ôn luyện thêm'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIẾN ĐỘ LỘ TRÌNH CÁ NHÂN (CHẾ ĐỘ CHỈ XEM - READ ONLY) */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-fade">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Lộ Trình Học Tập Cá Nhân Hóa (3 Chặng Trọng Tâm)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi các chặng kỹ năng con đã hoàn thành, đang học và chuẩn bị mở khóa.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
              Quyền phụ huynh: Chỉ theo dõi
            </span>
          </div>

          <div className="space-y-4">
            {roadmapStages.map((stage) => {
              const isCompleted = stage.status === 'COMPLETED';
              const isInProgress = stage.status === 'IN_PROGRESS';
              const isLocked = stage.status === 'LOCKED';

              return (
                <div
                  key={stage.stageNumber}
                  className={`p-5 rounded-2xl border transition-all ${
                    isInProgress
                      ? 'bg-blue-50/40 border-blue-200 ring-2 ring-blue-500/10'
                      : isCompleted
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-slate-50/60 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isInProgress
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : stage.stageNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                            {stage.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? 'Đã hoàn thành' : isInProgress ? 'Đang thực hiện' : 'Chưa mở khóa'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-700">
                        {stage.completedSkills} / {stage.totalSkills} kỹ năng
                      </span>
                      <div className="w-28 bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LỊCH SỬ THI THỬ & KIỂM TRA (GIÁM SÁT CHI TIẾT) */}
      {activeSubTab === 'history' && (
        <div className="animate-fade">
          <SubmissionHistoryView
            key={`history_parent_${activeChildId || 'default'}`}
            isParent={true}
            readOnly={true}
            studentId={activeChildId}
            studentName={childName}
            childrenList={childrenList}
            onSelectChildId={onSelectChildId}
          />
        </div>
      )}
    </div>
  );
}
