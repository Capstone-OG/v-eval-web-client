import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  GitBranch, 
  AlertTriangle, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { mockUser, mockWeakSkills } from '../../data/mockData';

export default function MetricsGrid({ onOpenRadar, onOpenDAG, onOpenZPD, onOpenAnalytics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 my-6">
      
      {/* CARD 1: IRT Score Estimation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-blue-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Năng lực ước tính</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              +25đ
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{mockUser.currentScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 1200 điểm</span>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
            <span>Dải dự báo tự tin:</span>
            <strong className="text-blue-700 font-bold">{mockUser.scoreRange}</strong>
          </div>
        </div>

        <button 
          onClick={onOpenRadar}
          className="w-full flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700 pt-2 border-t border-slate-100"
        >
          <span>Xem biểu đồ Radar & Lịch sử</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* CARD 2: BKT Admission Probability */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-emerald-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Xác suất trúng tuyển BKT</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Đã tin cậy cao
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{mockUser.admissionProb}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">An toàn</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60 mb-4">
            Khoa học Máy tính • ĐH Bách Khoa (Điểm chuẩn 2025: 850đ)
          </p>
        </div>

        <button 
          onClick={onOpenAnalytics}
          className="w-full flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700 pt-2 border-t border-slate-100"
        >
          <span>Xem phân tích tuyển sinh</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* CARD 3: Adaptive DAG Roadmap */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-indigo-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Lộ trình học thích ứng (DAG)</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Chặng 3/8
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{mockUser.roadmapProgress}%</span>
            <span className="text-xs font-semibold text-slate-500">hoàn thành</span>
          </div>

          <div className="space-y-1.5 mb-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${mockUser.roadmapProgress}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex justify-between">
              <span>Kỹ năng đã làm chủ:</span>
              <strong className="text-slate-800">{mockUser.masteredSkillsCount}/{mockUser.totalSkillsCount} mốc</strong>
            </div>
          </div>
        </div>

        <button 
          onClick={onOpenDAG}
          className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700 pt-2 border-t border-slate-100"
        >
          <span>Xem toàn bộ Lộ trình DAG</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* CARD 4: Knowledge Gap Early Warning */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-amber-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Cảnh báo hổng kiến thức</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Cần tối ưu
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">02</span>
            <span className="text-xs font-semibold text-slate-500">kỹ năng yếu cần củng cố</span>
          </div>

          <div className="space-y-1 mb-4 text-xs font-semibold text-slate-700">
            {mockWeakSkills.map((sk) => (
              <div key={sk.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50/60 border border-amber-100 text-[11px] truncate">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span className="truncate">{sk.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={onOpenZPD}
          className="w-full flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700 pt-2 border-t border-slate-100"
        >
          <span>Xem chi tiết & Luyện tập</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

    </div>
  );
}
