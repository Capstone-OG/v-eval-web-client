import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { X, Award, GitFork, Sparkles } from 'lucide-react';
import { mockRadarData, mockUser } from '../../data/mockData';

export default function RadarChartModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
                Biểu Đồ Radar Năng Lực & Đồ Thị DAG (Flow 2 & 5)
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Khung ma trận khảo thí 120 câu hỏi ĐGNL ĐHQG TP.HCM
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
            <div className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Biểu đồ Radar Năng lực Đa giác (IRT Theta Normalized)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Minh Hoàng" dataKey="score" stroke="#1E65FF" fill="#1E65FF" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DAG Nodes Summary */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-600" />
              <span>Các mốc chặng tiên quyết DAG (Topological Sorted):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-emerald-900">Chặng 1: Nền tảng Đọc hiểu Ngôn ngữ</span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md">Đã hoàn thành</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-emerald-900">Chặng 2: Quy tắc Mệnh đề kéo theo</span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md">Đã hoàn thành</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-300 rounded-2xl flex items-center justify-between ring-2 ring-blue-500/20">
                <span className="font-bold text-blue-900">Chặng 3: Tối ưu Logic & Ngôn ngữ</span>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md">Đang học (65%)</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between opacity-60">
                <span className="font-bold text-slate-700">Chặng 4: Phân tích Số liệu Bảng biểu</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md">Khóa</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
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
