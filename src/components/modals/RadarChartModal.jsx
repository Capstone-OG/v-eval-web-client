import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { X, Award, GitFork, Sparkles, ArrowRight } from 'lucide-react';
import { mockRadarData } from '../../data/mockData';

const SHORT_DOMAIN_LABELS = {
  DOM_LANG: 'Ngôn ngữ',
  DOM_MATH: 'Toán & Logic',
  DOM_NAT_SCI: 'KH Tự nhiên',
  DOM_SOC_SCI: 'KH Xã hội'
};

export default function RadarChartModal({ isOpen, onClose, studentDashboard, onOpenFullAnalytics }) {
  if (!isOpen) return null;

  const radarData =
    studentDashboard?.radarCompetency?.length > 0
      ? studentDashboard.radarCompetency.map((item) => ({
          subject: SHORT_DOMAIN_LABELS[item.domainCode] || item.domainName,
          score: Number(item.studentScore || 0),
          target: Number(item.targetScore || 80)
        }))
      : mockRadarData.map((d) => ({ ...d, target: 85 }));

  const roadmap = studentDashboard?.roadmapProgress || {
    completedMilestones: 7,
    totalMilestones: 12,
    progressPercentage: 58.3,
    currentMilestoneTitle: 'Chặng 08: Toán logic mệnh đề & suy luận kéo theo'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
              <Award className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Biểu Đồ Đa Giác Năng Lực 4 Miền & Tiến Độ DAG (Flow 5)
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Đối sánh năng lực BKT thực tế với chuẩn mục tiêu ĐGNL ĐHQG TP.HCM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Radar Chart Section */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80">
            <div className="text-xs font-extrabold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Biểu đồ Dual Radar 4 Miền Năng Lực (Hiện tại vs Mục tiêu)</span>
              </span>
              {studentDashboard?.currentEstimatedScore && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-extrabold">
                  Ước tính: {studentDashboard.currentEstimatedScore} / {studentDashboard.targetScore}đ
                </span>
              )}
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                  <PolarGrid stroke="#CBD5E1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Năng lực hiện tại (%)"
                    dataKey="score"
                    stroke="#1E65FF"
                    strokeWidth={2.5}
                    fill="#1E65FF"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Chuẩn mục tiêu (%)"
                    dataKey="target"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="#FBBF24"
                    fillOpacity={0.12}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DAG Nodes Summary */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-indigo-600" />
                <span>Tổng hợp tiến độ đồ thị tiên quyết DAG:</span>
              </span>
              <span className="text-indigo-600 font-black">
                {roadmap.completedMilestones}/{roadmap.totalMilestones} chặng ({roadmap.progressPercentage}%)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-indigo-100">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, roadmap.progressPercentage || 0)}%` }}
                />
              </div>
              <div className="text-xs font-bold text-indigo-950">
                Chặng đang mở khóa: <span className="text-blue-700">{roadmap.currentMilestoneTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {onOpenFullAnalytics ? (
            <button
              onClick={() => {
                onClose();
                onOpenFullAnalytics();
              }}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span>Mở Trang Phân Tích Đầy Đủ (Flow 5)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
