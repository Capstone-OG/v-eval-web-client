import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Video, 
  CheckCircle, 
  BarChart2, 
  Send, 
  Search, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { mockTeacherHeatmap } from '../../data/mockData';

export default function TeacherDashboardView() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pedagogicalNote, setPedagogicalNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);

  const handleSendNote = (e) => {
    e.preventDefault();
    if (!pedagogicalNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setPedagogicalNote('');
      setSelectedStudent(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white border border-blue-900/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Phân hệ Giáo viên Phụ trách Cơ sở 1 - ĐHQG TP.HCM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard Quản lý Lớp & Bản đồ Nhiệt (Class Heatmap)
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Theo dõi ma trận xác suất làm chủ kiến thức P(Lt) toàn lớp, phát hiện kịp thời các kỹ năng bị hổng diện rộng để tổ chức buổi Live Q&A tập trung.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all shrink-0">
          <Video className="w-4 h-4" />
          <span>Tạo buổi Live Q&A mới</span>
        </button>
      </div>

      {/* Class Overview Alert Widget */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <div className="font-bold text-amber-950">
            Cảnh báo Nghiệp vụ Sư phạm (Flow 5 - Class Heatmap Warning):
          </div>
          <p className="leading-relaxed text-amber-800">
            Phát hiện <strong>60% học sinh trong lớp</strong> có chỉ số P(Lt) dưới 0.50 ở kỹ năng <strong>"Toán logic mệnh đề & suy luận kéo theo"</strong>. Đề xuất Thầy/Cô dành 30 phút trong buổi Live Q&A tối nay để chữa lại chuyên đề này.
          </p>
        </div>
      </div>

      {/* Class Heatmap Matrix Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Bản đồ nhiệt Năng lực Lớp học (Class Heatmap Matrix)
            </h2>
            <p className="text-xs text-slate-500">Cập nhật định kỳ 15 phút hoặc sau mỗi bài thi thử của sinh viên.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> P(Lt) &lt; 0.50 (Yếu)
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 0.50-0.70 (Khá)
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &ge; 0.70 (Tốt)
            </span>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80">
                <th className="p-3 font-bold">Học sinh</th>
                <th className="p-3 font-bold text-center">Logic Mệnh đề</th>
                <th className="p-3 font-bold text-center">Phân tích Bảng</th>
                <th className="p-3 font-bold text-center">Ngôn ngữ Tiếng Việt</th>
                <th className="p-3 font-bold text-center">Toán Định lượng</th>
                <th className="p-3 font-bold text-center">Khoa học Tự nhiên</th>
                <th className="p-3 font-bold text-center">Trạng thái Rủi ro</th>
                <th className="p-3 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTeacherHeatmap.map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50/80 transition-all">
                  
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {row.name.charAt(0)}
                    </div>
                    <span>{row.name}</span>
                  </td>

                  {/* Cell 1: Logic */}
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-xl font-bold ${
                      row.logicProb < 0.5 ? 'bg-red-100 text-red-700 border border-red-200' : row.logicProb < 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {(row.logicProb * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Cell 2: Data */}
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-xl font-bold ${
                      row.dataProb < 0.5 ? 'bg-red-100 text-red-700 border border-red-200' : row.dataProb < 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {(row.dataProb * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Cell 3: Lang */}
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-xl font-bold ${
                      row.langProb < 0.5 ? 'bg-red-100 text-red-700 border border-red-200' : row.langProb < 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {(row.langProb * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Cell 4: Math */}
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-xl font-bold ${
                      row.mathProb < 0.5 ? 'bg-red-100 text-red-700 border border-red-200' : row.mathProb < 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {(row.mathProb * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Cell 5: Science */}
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-xl font-bold ${
                      row.scienceProb < 0.5 ? 'bg-red-100 text-red-700 border border-red-200' : row.scienceProb < 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {(row.scienceProb * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Risk status */}
                  <td className="p-3 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      row.riskLevel === 'Nguy cơ cao' 
                        ? 'bg-red-500 text-white' 
                        : row.riskLevel === 'Cần chú ý' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {row.riskLevel}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => setSelectedStudent(row)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-all"
                    >
                      Gửi Nhận xét
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Send Pedagogical Note Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <h3 className="text-base font-extrabold text-slate-900">
              Gửi Nhận xét Sư phạm đến: <span className="text-blue-600">{selectedStudent.name}</span>
            </h3>
            
            <p className="text-xs text-slate-500">
              Nhận xét sẽ được gửi trực tiếp đến Web Portal của Học sinh & Phụ huynh.
            </p>

            <form onSubmit={handleSendNote} className="space-y-3">
              <textarea
                value={pedagogicalNote}
                onChange={(e) => setPedagogicalNote(e.target.value)}
                placeholder="Ví dụ: Em cần dành thêm thời gian luyện 5 bài tập Remedial Node về Logic mệnh đề trước buổi Live tối nay..."
                rows={4}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                required
              />

              {noteSent && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Đã gửi nhận xét thành công đến học sinh & phụ huynh!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi nhận xét</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
