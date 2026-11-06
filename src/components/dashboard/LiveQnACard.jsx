import React, { useState, useEffect } from 'react';
import { Calendar, Users, ChevronRight, Check, GraduationCap } from 'lucide-react';
import { userService } from '../../services/userService';

export default function LiveQnACard({ currentUser }) {
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    userService
      .getUsers({ role: 'TEACHER', page: 1, pageSize: 5 })
      .then((res) => {
        if (!isMounted) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        if (items.length > 0) {
          setTeacherInfo(items[0]);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const teacherName = teacherInfo?.fullName || 'Giảng viên phụ trách cơ sở';
  const teacherSpecialty =
    teacherInfo?.specialty ||
    teacherInfo?.campusName ||
    currentUser?.campusName ||
    'Hệ thống Đào tạo ĐGNL V-Eval';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
      {/* Live Badge & Time Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>Lịch Phụ Đạo Trực Tuyến</span>
        </div>
        <span className="text-xs font-bold text-slate-400">Hàng tuần</span>
      </div>

      {/* Main Title & Description */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1.5">
          Phòng Giải Đáp Chuyên Đề ĐGNL & Sửa Bài Socratic
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Giải đáp trực tiếp các câu hỏi khó từ Ngân hàng Đề Khảo sát 30 câu và hướng dẫn phương pháp loại trừ nhiễu 4 miền V-ACT.
        </p>
      </div>

      {/* Teacher Profile Box from Backend */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <GraduationCap className="w-5 h-5 text-[#FACC15]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-extrabold text-slate-900 truncate">
            {teacherName}
          </div>
          <div className="text-[11px] text-slate-500 truncate font-medium">
            {teacherSpecialty}
          </div>
        </div>
        {teacherInfo?.email && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-xl shrink-0">
            <Users className="w-3 h-3 text-blue-600" />
            <span>GV Cơ sở</span>
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
        <button
          onClick={() => setIsReminderSet(!isReminderSet)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            isReminderSet
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          {isReminderSet ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã đăng ký nhận thông báo</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Đặt lịch nhắc buổi học</span>
            </>
          )}
        </button>

        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
          <span>Trực tuyến</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
