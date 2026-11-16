import React, { useState, useEffect } from 'react';
import {
  Video,
  Users,
  Bot,
  Play,
  Calendar,
  GraduationCap,
  FileText,
  ArrowRight,
  RefreshCw,
  Building2,
  UserCheck
} from 'lucide-react';
import LiveQnACard from './LiveQnACard';
import { practiceService } from '../../services/practiceService';
import { userService } from '../../services/userService';

export default function LiveClassQnAView({
  currentUser = null,
  studentId = null,
  onOpenPracticeModal,
  onOpenAiTutor,
  onNavigateSchedule,
  onNavigateRoadmap
}) {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLiveClassroomData = async () => {
    setIsLoading(true);
    try {
      const [timetableRes, teachersRes] = await Promise.all([
        practiceService.getStudentTimetable({ studentId }).catch(() => null),
        userService.getUsers({ role: 'TEACHER', page: 1, pageSize: 10 }).catch(() => null)
      ]);

      setEnrolledClasses(
        Array.isArray(timetableRes?.enrolledClasses) ? timetableRes.enrolledClasses : []
      );
      setTeachers(Array.isArray(teachersRes?.items) ? teachersRes.items : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveClassroomData();
  }, [studentId]);

  return (
    <div className="space-y-6 animate-fade pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-blue-800 to-slate-900 border border-indigo-600/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FACC15] border border-white/20 text-xs font-extrabold">
            <Video className="w-3.5 h-3.5" />
            <span>KHÔNG GIAN LỚP HỌC & PHỤ ĐẠO TRỰC TUYẾN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Lớp Học, Nhóm Vi Mô & Phòng Live Q&A
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
            Không gian tương tác trực tuyến với Giảng viên phụ trách, hoạt động nhóm vi mô tại lớp và giải đáp chuyên đề Socratic. Để tra cứu chi tiết lịch học theo kỳ và điểm danh, vui lòng mở trang Thời khóa biểu riêng biệt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onNavigateSchedule && (
            <button
              type="button"
              onClick={onNavigateSchedule}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#FACC15]" />
              <span>Mở Trang Thời Khóa Biểu & Điểm Danh</span>
            </button>
          )}

          {onOpenAiTutor && (
            <button
              type="button"
              onClick={onOpenAiTutor}
              className="px-5 py-3 rounded-2xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-yellow-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Hỏi Đáp Socratic Tutor 24/7</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Enrolled Classes & Micro-Group Workspace */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Danh Sách Lớp Học Phần & Nhóm Vi Mô Đang Tham Gia ({enrolledClasses.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin lớp học, nhóm vi mô tại bàn và phiếu bài tập củng cố từ hệ thống
              </p>
            </div>
            <button
              type="button"
              onClick={loadLiveClassroomData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              title="Làm mới dữ liệu lớp học"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {enrolledClasses.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-black text-slate-800">
                Học viên hiện chưa được ghi danh vào lớp học phần nào
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Khi Học vụ cơ sở xếp lớp và phân nhóm vi mô, thông tin lớp học và phiếu bài tập nhóm sẽ hiển thị trực tiếp tại đây.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {onOpenPracticeModal && (
                  <button
                    type="button"
                    onClick={() => onOpenPracticeModal()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Tự Luyện Tập Thích Ứng ZPD</span>
                  </button>
                )}
                {onNavigateRoadmap && (
                  <button
                    type="button"
                    onClick={onNavigateRoadmap}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Cây Tri Thức Lộ Trình</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.classId}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {cls.termCode && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-black">
                          {cls.termCode}
                        </span>
                      )}
                      {cls.courseCode && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black">
                          {cls.courseCode}
                        </span>
                      )}
                    </div>
                    {cls.academicYear && (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Năm học {cls.academicYear}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-base font-black text-slate-900">
                    {cls.className}
                    {cls.courseName ? ` — ${cls.courseName}` : ''}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Nhóm Vi Mô Tại Lớp:</span>
                      </div>
                      <div className="font-black text-indigo-700">
                        {cls.microGroupName || 'Chưa phân nhóm vi mô'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="text-slate-500 font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Phiếu bài tập nhóm:</span>
                      </div>
                      <div className="font-black text-slate-900">
                        {cls.assignedWorksheetTitle || 'Chưa giao phiếu bài tập'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                    <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>
                        GV phụ trách: <strong>{cls.primaryTeacherName || 'Chưa phân công'}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenPracticeModal && (
                        <button
                          type="button"
                          onClick={() => onOpenPracticeModal()}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Làm Bài Tập Nhóm</span>
                        </button>
                      )}
                      {onNavigateSchedule && (
                        <button
                          type="button"
                          onClick={onNavigateSchedule}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Xem Thời Khóa Biểu Lớp</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Columns: Live Q&A Card & Active Faculty List */}
        <div className="xl:col-span-5 space-y-5">
          <LiveQnACard
            currentUser={currentUser}
            onOpenLiveClass={onOpenAiTutor}
          />

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Đội Ngũ Giảng Viên Hỗ Trợ Trên Hệ Thống ({teachers.length})</span>
            </h3>

            {teachers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-semibold">
                Hiện chưa có danh sách giảng viên được đồng bộ từ User Service.
              </div>
            ) : (
              <div className="space-y-2.5">
                {teachers.slice(0, 5).map((t) => (
                  <div
                    key={t.userId || t.id || t.email}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {t.fullName || t.username || t.email}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.email || 'Giảng viên cơ sở'}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black shrink-0">
                      TEACHER
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

