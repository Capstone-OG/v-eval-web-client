import React, { useState } from 'react';
import { ShieldCheck, Cpu, Database, CheckCircle2, X, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { architectureAnswers } from '../../data/mockData';

export default function AcademicArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('q1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Giải Đáp Kiến Trúc Nghiệp Vụ & 3 Câu Hỏi Thảo Luận (FA26SE090)
              </h2>
              <p className="text-xs text-blue-300 font-medium">
                Tối ưu hóa hạ tầng 6 luồng cốt lõi trong mốc 15 tuần phát triển
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('q1')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'q1' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>1. Chống Gian Lận (Proctoring)</span>
          </button>

          <button
            onClick={() => setActiveTab('q2')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'q2' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>2. Tối ưu Real-time ZPD/BKT</span>
          </button>

          <button
            onClick={() => setActiveTab('q3')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'q3' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>3. Atomic RAG Update Qdrant</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
          
          {activeTab === 'q1' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <h3 className="font-extrabold text-blue-900 text-sm mb-1">
                  {architectureAnswers.question1.title}
                </h3>
                <p className="text-slate-600 font-medium">
                  <strong>Bối cảnh:</strong> {architectureAnswers.question1.context}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="font-bold text-slate-900 text-sm">Giải pháp chi tiết cho Nhóm Đồ Á:</div>
                {architectureAnswers.question1.solution.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'q2' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                <h3 className="font-extrabold text-indigo-900 text-sm mb-1">
                  {architectureAnswers.question2.title}
                </h3>
                <p className="text-slate-600 font-medium">
                  <strong>Bối cảnh:</strong> {architectureAnswers.question2.context}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="font-bold text-slate-900 text-sm">Mô hình Kiến trúc Khuyên dùng (Async Event Pipeline):</div>
                {architectureAnswers.question2.solution.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'q3' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <h3 className="font-extrabold text-emerald-900 text-sm mb-1">
                  {architectureAnswers.question3.title}
                </h3>
                <p className="text-slate-600 font-medium">
                  <strong>Bối cảnh:</strong> {architectureAnswers.question3.context}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="font-bold text-slate-900 text-sm">Quy trình Đảm bảo Nhất quán Dữ liệu (Atomic Vector Transaction):</div>
                {architectureAnswers.question3.solution.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Hệ thống Khảo thí ĐGNL ĐHQG-HCM • Mã đồ án FA26SE090
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
}
