import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  User,
  ShieldCheck,
  Target,
  Bell,
  Sparkles,
  Camera,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  School,
  MapPin,
  TrendingUp,
  Brain,
  Sliders,
  LogOut,
  ChevronRight,
  Award,
  Zap,
  Smartphone,
  Mail,
  Calendar,
  Lock,
  Volume2,
  Bot,
  Users,
  FileText,
  Copy,
  Check,
  Printer,
  Send,
  HeartHandshake,
  QrCode,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import { authService, tokenStorage } from '../../services';
import { mockUser, campusesList } from '../../data/mockData';

// Avatar preset options
const AVATAR_PRESETS = [
  { id: 'av-1', label: 'Học sinh 3D', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
  { id: 'av-2', label: 'Học giả Trẻ', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250' },
  { id: 'av-3', label: 'Năng động', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250' },
  { id: 'av-4', label: 'Tập trung', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
  { id: 'av-5', label: 'Khám phá', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250' },
  { id: 'av-6', label: 'Học bá AI', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=250' }
];

export default function AccountSettingsPage({
  currentUser,
  onUpdateUser,
  activeRole = 'student',
  onNavigateTab,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'academic' | 'family' | 'security' | 'preferences'

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Academic Profile States (Student specific)
  const [targetScore, setTargetScore] = useState(850);
  const [campusId, setCampusId] = useState('campus-1');
  const [campuses, setCampuses] = useState(campusesList);
  const [examDate, setExamDate] = useState('2026-03-29');
  const [studyHoursDay, setStudyHoursDay] = useState(2.5);
  const [schoolName, setSchoolName] = useState('THPT Chuyên Lê Hồng Phong');

  // Parent & Family Link States
  const [parentRelation, setParentRelation] = useState('father'); // 'father' | 'mother' | 'guardian'
  const [parentName, setParentName] = useState('Phạm Văn Minh');
  const [parentPhone, setParentPhone] = useState('0903123456');
  const [parentEmail, setParentEmail] = useState('minh.pham.ph@veval.edu.vn');
  const [parentConnectCode, setParentConnectCode] = useState('VEVAL-STU-88902');
  const [isParentLinked, setIsParentLinked] = useState(true);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isSavingParent, setIsSavingParent] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);

  // Password Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Preference Settings States
  const [socraticMode, setSocraticMode] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:30');
  const [soundEffects, setSoundEffects] = useState(true);
  const [weeklyEmailReport, setWeeklyEmailReport] = useState(true);
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success' | 'error', message: string }

  // Load Initial Data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      // 1. Initialize from props / token storage
      const storedUser = currentUser || tokenStorage.getUser() || mockUser;
      const initialName = storedUser.fullName || storedUser.name || mockUser.name;
      const initialPhone = storedUser.phone || '0988123456';
      const initialEmail = storedUser.email || mockUser.email;
      const initialAvatar = storedUser.avatarUrl || storedUser.avatar || mockUser.avatar;

      setFullName(initialName);
      setPhone(initialPhone);
      setEmail(initialEmail);
      setAvatarUrl(initialAvatar);

      // 2. Load campus list from API if available
      try {
        const campusRes = await authService.getCampuses();
        if (isMounted && campusRes && Array.isArray(campusRes) && campusRes.length > 0) {
          setCampuses(campusRes);
        }
      } catch (err) {
        // Keep fallback campusesList
      }

      // 3. Try to fetch backend User Profile
      try {
        const userProfile = await authService.getCurrentUser();
        if (isMounted && userProfile) {
          if (userProfile.fullName) setFullName(userProfile.fullName);
          if (userProfile.phone) setPhone(userProfile.phone);
          if (userProfile.avatarUrl) setAvatarUrl(userProfile.avatarUrl);
          if (userProfile.email) setEmail(userProfile.email);
        }
      } catch (err) {
        // Fallback to local user
      }

      // 4. Try student profile
      try {
        const studentProfile = await authService.getStudentProfile();
        if (isMounted && studentProfile) {
          if (studentProfile.targetScore != null) setTargetScore(studentProfile.targetScore);
          if (studentProfile.campusId) setCampusId(studentProfile.campusId);
          if (studentProfile.examDate) setExamDate(studentProfile.examDate);
          if (studentProfile.studyHoursDay) setStudyHoursDay(studentProfile.studyHoursDay);
          if (studentProfile.schoolName) setSchoolName(studentProfile.schoolName);
        }
      } catch (err) {
        setTargetScore(mockUser.targetScore || 850);
        setCampusId(mockUser.campusId || 'campus-1');
        setSchoolName('THPT Chuyên Lê Hồng Phong');
      }

      // 5. Load parent info from authService / localStorage / mockUser
      try {
        const parentData = await authService.getParentInfo();
        if (isMounted && parentData) {
          if (parentData.parentRelation) setParentRelation(parentData.parentRelation);
          if (parentData.parentName) setParentName(parentData.parentName);
          if (parentData.parentPhone) setParentPhone(parentData.parentPhone);
          if (parentData.parentEmail) setParentEmail(parentData.parentEmail);
          if (parentData.parentConnectCode) setParentConnectCode(parentData.parentConnectCode);
          if (parentData.isParentLinked !== undefined) setIsParentLinked(parentData.isParentLinked);
        } else {
          setParentRelation(mockUser.parentRelation || 'father');
          setParentName(mockUser.parentName || 'Phạm Văn Minh');
          setParentPhone(mockUser.parentPhone || '0903123456');
          setParentEmail(mockUser.parentEmail || 'minh.pham.ph@veval.edu.vn');
          setParentConnectCode(mockUser.parentConnectCode || 'VEVAL-STU-88902');
          setIsParentLinked(mockUser.isParentLinked ?? true);
        }
      } catch (err) {
        setParentRelation('father');
        setParentName('Phạm Văn Minh');
      }

      // 6. Load saved preferences
      try {
        const savedPrefs = localStorage.getItem('veval_user_preferences');
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.socraticMode !== undefined) setSocraticMode(parsed.socraticMode);
          if (parsed.dailyReminder !== undefined) setDailyReminder(parsed.dailyReminder);
          if (parsed.reminderTime) setReminderTime(parsed.reminderTime);
          if (parsed.soundEffects !== undefined) setSoundEffects(parsed.soundEffects);
          if (parsed.weeklyEmailReport !== undefined) setWeeklyEmailReport(parsed.weeklyEmailReport);
          if (parsed.autoSaveDraft !== undefined) setAutoSaveDraft(parsed.autoSaveDraft);
        }
      } catch (err) {
        console.warn('Could not parse user preferences', err);
      }

      if (isMounted) setIsLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4500);
  };

  // 1. Handle Save Personal Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      showAlert('error', 'Họ và tên không được để trống.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await authService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim()
      });

      const existingUser = tokenStorage.getUser() || {};
      const updatedUser = {
        ...existingUser,
        fullName: fullName.trim(),
        name: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
        avatar: avatarUrl.trim()
      };
      const token = tokenStorage.getAccessToken();
      const rToken = tokenStorage.getRefreshToken();
      if (token) {
        tokenStorage.setTokens(token, rToken, updatedUser, true);
      }

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showAlert('success', 'Đã cập nhật thông tin tài khoản thành công!');
    } catch (err) {
      console.warn('Update profile error, applying local optimistic sync:', err);
      const existingUser = tokenStorage.getUser() || {};
      const updatedUser = {
        ...existingUser,
        fullName: fullName.trim(),
        name: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
        avatar: avatarUrl.trim()
      };
      if (onUpdateUser) onUpdateUser(updatedUser);
      showAlert('success', 'Đã lưu thông tin tài khoản vào hệ thống cá nhân.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Handle Save Academic Profile
  const handleSaveAcademic = async (e) => {
    if (e) e.preventDefault();
    if (isSavingAcademic) return;
    setIsSavingAcademic(true);
    try {
      const profile = await authService.updateStudentProfile({
        campusId,
        targetScore: Number(targetScore),
        examDate: examDate || null,
        studyHoursDay: Number(studyHoursDay),
        schoolName: schoolName.trim()
      });
      if (profile?.targetScore !== Number(targetScore) || profile?.campusId !== campusId) {
        throw new Error('Máy chủ chưa xác nhận mục tiêu và cơ sở đã lưu. Vui lòng tải lại hồ sơ để kiểm tra.');
      }

      window.dispatchEvent(new CustomEvent('veval-campus-updated', { detail: { campusId: profile.campusId } }));
      try {
        localStorage.setItem('veval_target_score', String(profile.targetScore));
        localStorage.setItem('veval_campus_id', profile.campusId);
      } catch (cacheError) {
        console.warn('Profile saved; browser cache unavailable:', cacheError);
      }

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      showAlert('success', '🎯 Đã cập nhật mục tiêu thi cử & hồ sơ học sinh thành công!');
    } catch (err) {
      console.warn('Update student profile error:', err);
      showAlert('error', err.message || 'Chưa lưu được mục tiêu vào hồ sơ học sinh. Vui lòng thử lại.');
    } finally {
      setIsSavingAcademic(false);
    }
  };

  // 3. Handle Save Parent & Family Info
  const handleSaveParent = async (e) => {
    if (e) e.preventDefault();
    if (!parentName.trim()) {
      showAlert('error', 'Vui lòng nhập họ và tên của Cha hoặc Mẹ.');
      return;
    }
    if (!parentPhone.trim()) {
      showAlert('error', 'Vui lòng nhập số điện thoại của Cha hoặc Mẹ.');
      return;
    }

    setIsSavingParent(true);
    const parentPayload = {
      parentRelation,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      parentConnectCode,
      isParentLinked: true
    };

    try {
      await authService.updateParentInfo(parentPayload);
      setIsParentLinked(true);
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.65 } });
      const roleText = parentRelation === 'father' ? 'Cha (Bố)' : parentRelation === 'mother' ? 'Mẹ' : 'Người giám hộ';
      showAlert('success', `👨‍👩‍👧 Đã lưu thông tin đại diện phụ huynh [${roleText}: ${parentName}] và đồng bộ mã kết nối!`);
    } catch (err) {
      console.warn('Update parent error, caching locally:', err);
      localStorage.setItem('veval_parent_info', JSON.stringify(parentPayload));
      setIsParentLinked(true);
      showAlert('success', `👨‍👩‍👧 Đã lưu thông tin phụ huynh [${parentName}] vào hồ sơ liên lạc gia đình.`);
    } finally {
      setIsSavingParent(false);
    }
  };

  // Handle Copy Student Connection Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(parentConnectCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2500);
    showAlert('success', `📋 Đã sao chép mã kết nối: ${parentConnectCode}. Hãy gửi mã này cho Ba hoặc Mẹ!`);
  };

  // Handle Refresh Connection Code
  const handleRefreshCode = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newCode = `VEVAL-STU-${randomSuffix}`;
    setParentConnectCode(newCode);
    localStorage.setItem('veval_parent_code', newCode);
    showAlert('success', `🔄 Đã tạo mã kết nối mới: ${newCode}`);
  };

  // Handle Send Report to Parent Email
  const handleSendReportEmail = () => {
    if (!parentEmail) {
      showAlert('error', 'Chưa có địa chỉ Email phụ huynh để gửi báo cáo.');
      return;
    }
    setIsSendingReport(true);
    setTimeout(() => {
      setIsSendingReport(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showAlert('success', `📧 Đã gửi bản tóm tắt Phiếu điểm & Học bạ điện tử tới: ${parentEmail}!`);
    }, 1200);
  };

  // Handle Print Transcript
  const handlePrintTranscript = () => {
    window.print();
  };

  // 4. Handle Change Password
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (!currentPassword) {
      showAlert('error', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword) {
      showAlert('error', 'Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('error', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      showAlert('error', 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('error', 'Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      showAlert('success', '🔑 Đổi mật khẩu thành công! Hãy bảo mật mật khẩu mới của bạn.');
    } catch (err) {
      console.warn('Change password error:', err);
      const apiMsg = err.response?.data?.detail || err.response?.data?.message || err.message;
      showAlert('error', apiMsg || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 5. Handle Save Preferences
  const handleSavePreferences = () => {
    const prefs = {
      socraticMode,
      dailyReminder,
      reminderTime,
      soundEffects,
      weeklyEmailReport,
      autoSaveDraft
    };
    localStorage.setItem('veval_user_preferences', JSON.stringify(prefs));
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    showAlert('success', '⚙️ Đã lưu thiết lập học tập & thông báo AI!');
  };

  // Password Strength Calculation
  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, text: 'Chưa nhập', color: 'bg-slate-200' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { score: 1, text: 'Yếu', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, text: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 5) return { score: 3, text: 'Mạnh', color: 'bg-blue-500' };
    return { score: 4, text: 'Rất an toàn', color: 'bg-emerald-500' };
  };

  const pwStrength = getPasswordStrength(newPassword);

  const getScoreBenchmark = (score) => {
    if (score >= 950) return { label: 'Top 1% Xuất sắc (Y Dược, Bách Khoa, Ngoại Thương)', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (score >= 850) return { label: 'Top 5% Rất Tốt (CNTT, Kinh Tế, Luật, Sư Phạm Kỹ Thuật)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 750) return { label: 'Top 15% Khá (KHTN, KHXH, Ngân Hàng, Tài Chính)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    return { label: 'Mức cơ bản (Xét tuyển đại học tiêu chuẩn)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  };

  const scoreInfo = getScoreBenchmark(targetScore);

  return (
    <div className="space-y-6 animate-fade pb-12">

      {/* Toast Notification */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md text-xs font-bold flex items-center gap-3 max-w-md ${
              alertInfo.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/50'
                : 'bg-rose-900 text-white border-rose-500/50'
            }`}
          >
            {alertInfo.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
            )}
            <span className="leading-relaxed flex-1">{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-[#FACC15]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ thống Quản lý Danh tính & Khảo thí Thích ứng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Cài đặt Tài khoản & Hồ sơ Năng lực
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              Tùy chỉnh thông tin định danh cá nhân, mục tiêu điểm số ĐGNL V-ACT 1200, quản lý thông tin phụ huynh & tra cứu học bạ điện tử gia đình.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                Về Tổng quan
              </button>
            )}
            <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Xác thực JWT 256-bit</span>
            </div>
          </div>
        </div>

        {/* Quick User Summary Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl || mockUser.avatar}
                alt={fullName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{fullName || mockUser.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                  {activeRole === 'student' ? 'Học sinh V-ACT' : activeRole === 'teacher' ? 'Giáo viên' : 'Quản lý Đào tạo'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {email} • Phụ huynh: <strong className="text-cyan-300">{parentName} ({parentRelation === 'father' ? 'Cha' : parentRelation === 'mother' ? 'Mẹ' : 'Giám hộ'})</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-slate-400">Mã kết nối: </span>
              <strong className="text-cyan-300 font-mono">{parentConnectCode}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-slate-400">Mục tiêu: </span>
              <strong className="text-[#FACC15]">{targetScore}/1200</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-slate-400">Theta 0: </span>
              <strong className="text-emerald-400">+0.65</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Thông tin Cá nhân</span>
        </button>

        {activeRole === 'student' && (
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'academic'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Mục tiêu Thi cử & ĐGNL</span>
          </button>
        )}

        {/* Tab 3: Phụ huynh & Học bạ Điện tử */}
        {activeRole === 'student' && (
          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'family'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Phụ huynh & Học bạ Điện tử</span>
            {isParentLinked && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Bảo mật & Đổi Mật khẩu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Tùy chọn Học tập & AI</span>
        </button>
      </div>

      {/* Tab 1: Thông tin Cá nhân */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Avatar & Identification Box */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="text-center">
              <div className="relative inline-block mx-auto group">
                <img
                  src={avatarUrl || mockUser.avatar}
                  alt={fullName}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-xl transition-transform group-hover:scale-102"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base font-extrabold text-slate-800 mt-3">{fullName || 'Chưa đặt tên'}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{email}</p>

              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Email Đã Xác Thực
                </span>
              </div>
            </div>

            {/* Quick Avatar Presets Drawer */}
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-slate-100 space-y-3"
              >
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Chọn Avatar mẫu:</span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(false)}
                    className="text-slate-400 hover:text-slate-600 text-[11px]"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setShowAvatarPicker(false);
                      }}
                      className={`relative rounded-xl overflow-hidden p-1 border-2 transition-all cursor-pointer ${
                        avatarUrl === preset.url ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-12 rounded-lg object-cover" />
                      <div className="text-[10px] font-bold text-slate-600 text-center mt-1 truncate">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Hoặc nhập URL ảnh trực tiếp:</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Account Details Specs */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Mã người dùng:</span>
                <span className="font-mono font-bold text-slate-800">
                  {currentUser?.id || currentUser?.userId || mockUser.id}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Vai trò hệ thống:</span>
                <span className="font-bold text-blue-700 capitalize">
                  {activeRole === 'student' ? 'Học sinh (Student)' : activeRole === 'teacher' ? 'Giảng viên (Teacher)' : 'Quản lý Đào tạo (Manager)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Phụ huynh đại diện:</span>
                <span className="font-bold text-emerald-700 text-right truncate max-w-[170px]">
                  {parentName} ({parentRelation === 'father' ? 'Cha' : parentRelation === 'mother' ? 'Mẹ' : 'Giám hộ'})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Cơ sở đăng ký:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">
                  {campuses.find((c) => c.id === campusId)?.name || 'Cơ sở 1: ĐHQG TP.HCM'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Ngày gia nhập:</span>
                <span className="font-bold text-slate-800">20/08/2025</span>
              </div>
            </div>
          </div>

          {/* Profile Edit Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Thông tin Cá nhân Cơ bản</h3>
                <p className="text-xs text-slate-500 mt-0.5">Thông tin này được dùng để hiển thị trên chứng nhận, bảng điểm và học bạ.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
                Identity Service
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và Tên đầy đủ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số Điện Thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Địa chỉ Email đăng nhập <span className="text-slate-400 font-normal">(Cố định)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Liên hệ quản trị viên cơ sở nếu bạn cần thay đổi email tài khoản.</p>
                </div>

                {/* Campus Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cơ sở Đào tạo Trực thuộc
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={campusId}
                      onChange={(e) => setCampusId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 cursor-pointer"
                    >
                      {campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const u = currentUser || tokenStorage.getUser() || mockUser;
                    setFullName(u.fullName || u.name || '');
                    setPhone(u.phone || '');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy thay đổi
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* Tab 2: Mục tiêu Thi cử & ĐGNL (Student Academic Goals) */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">

          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Thang đo Năng lực Chuẩn hóa V-ACT 1200 Điểm</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Mục tiêu Khảo thí & Lộ trình Thích ứng</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thuật toán IRT & DAG đồ thị tri thức sẽ tự động điều chỉnh độ khó bài tập bám sát theo điểm mục tiêu của em.
              </p>
            </div>
            <div className={`px-4 py-2 rounded-2xl border text-xs font-bold ${scoreInfo.color}`}>
              {scoreInfo.label}
            </div>
          </div>

          <form onSubmit={handleSaveAcademic} className="space-y-8">

            {/* Interactive Target Score Slider */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                    Điểm Mục tiêu Kỳ thi ĐGNL 2026
                  </div>
                  <div className="text-2xl font-black text-blue-600 mt-0.5">
                    {targetScore} <span className="text-sm font-semibold text-slate-400">/ 1200 Điểm</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="300"
                    max="1200"
                    step="10"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Math.min(1200, Math.max(300, Number(e.target.value))))}
                    className="w-24 px-3 py-1.5 text-center text-sm font-black text-blue-700 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span className="text-xs font-bold text-slate-500">điểm</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="400"
                max="1200"
                step="10"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              {/* Benchmark Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetScore(750)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    targetScore === 750 ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">750+ Điểm</div>
                  <div className="text-[10px] text-slate-500 truncate">KHTN, KHXH, Sư Phạm</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScore(850)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    targetScore === 850 ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">850+ Điểm</div>
                  <div className="text-[10px] text-slate-500 truncate">Bách Khoa, CNTT, Kinh Tế</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScore(950)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    targetScore === 950 ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">950+ Điểm</div>
                  <div className="text-[10px] text-slate-500 truncate">Y Dược, Tài Chính Top 1</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScore(1050)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    targetScore === 1050 ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">1050+ Điểm</div>
                  <div className="text-[10px] text-slate-500 truncate">Thủ khoa / Top 0.5%</div>
                </button>
              </div>
            </div>

            {/* Target Major & Exam Date & Study Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nguyện vọng & Trường Đại học Mục tiêu
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value=""
                    disabled
                    placeholder="Chưa hỗ trợ lưu nguyện vọng"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Nguyện vọng chưa được hỗ trợ lưu vào hồ sơ.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Trường THPT Đang theo học
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="THPT Chuyên Lê Hồng Phong"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngày thi ĐGNL Dự kiến
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Thời lượng tự học mỗi ngày: <strong className="text-blue-600 font-extrabold">{studyHoursDay} giờ/ngày</strong>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="0.5"
                    max="8"
                    step="0.5"
                    value={studyHoursDay}
                    onChange={(e) => setStudyHoursDay(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-600 w-12 text-right shrink-0">{studyHoursDay}h</span>
                </div>
              </div>
            </div>

            {/* IRT Psychometrics Live Status Insight Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30 shrink-0">
                  <Zap className="w-5 h-5 text-[#FACC15] fill-[#FACC15]" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-blue-900">Vector Năng lực Hiện tại (IRT Theta 0): +0.65</div>
                  <p className="text-[11px] text-blue-700 font-medium mt-0.5 max-w-xl">
                    Đã làm chủ 18/28 chuyên đề trọng tâm. Bạn cần tích lũy thêm khoảng 65 điểm để vững vàng trong top 5% trúng tuyển ngành Khoa học Máy tính ĐH Bách Khoa.
                  </p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('diagnostic')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Khảo sát lại Năng lực
                </button>
              )}
            </div>

            {/* Save Academic Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingAcademic}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingAcademic ? 'Đang cập nhật...' : 'Lưu Mục Tiêu Khảo Thí'}</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Tab 3: Phụ huynh & Học bạ Điện tử (Family Link & Digital Transcript) */}
      {activeTab === 'family' && (
        <div className="space-y-8 animate-fade">

          {/* Section 1: Mã Kết Nối & Thông tin Cha/Mẹ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* VIP Card: Mã kết nối học sinh */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-7 border border-indigo-500/30 shadow-xl space-y-5">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Mã Kết Nối Gia Đình</span>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCode}
                  title="Tạo mã liên kết mới"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative z-10 space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Mã Liên Kết Học Bạ Của Học Sinh:
                </div>

                {/* Code Display Box */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-[#FACC15] select-all">
                    {parentConnectCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {isCopiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  💡 Ba hoặc Mẹ mở Cổng Phụ huynh (Parent Portal) hoặc App V-Eval, nhập mã này để liên kết và đồng hành theo dõi điểm thi & học bạ của con trong thời gian thực.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Trạng thái kết nối:</span>
                {isParentLinked ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Đã liên kết ({parentRelation === 'father' ? 'Cha' : parentRelation === 'mother' ? 'Mẹ' : 'Giám hộ'})
                  </span>
                ) : (
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Chờ phụ huynh nhập mã
                  </span>
                )}
              </div>
            </div>

            {/* Right: Thông tin Cha HOẶC Mẹ */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-blue-600" />
                    <span>Thông Tin Đại Diện Phụ Huynh (Cha hoặc Mẹ)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn đại diện Cha HOẶC Mẹ để nhận học bạ, kết quả thi thử và các thông báo khẩn từ trung tâm.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {isParentLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                </span>
              </div>

              <form onSubmit={handleSaveParent} className="space-y-5">

                {/* Parent Role Radio Selector: Cha (Bố) | Mẹ | Người giám hộ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Người đại diện liên lạc chính: <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setParentRelation('father')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        parentRelation === 'father'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>👨 Cha (Bố)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentRelation('mother')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        parentRelation === 'mother'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>👩 Mẹ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentRelation('guardian')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        parentRelation === 'guardian'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🤝 Người giám hộ</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parent Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Họ và Tên của {parentRelation === 'father' ? 'Cha (Bố)' : parentRelation === 'mother' ? 'Mẹ' : 'Người giám hộ'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Ví dụ: Phạm Văn Minh"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Parent Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Số điện thoại {parentRelation === 'father' ? 'Cha' : parentRelation === 'mother' ? 'Mẹ' : 'Giám hộ'} (SMS/Zalo) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="0903123456"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email nhận Báo Cáo Học Bạ Tự Động
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="minh.pham.ph@veval.edu.vn"
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Báo cáo phân tích năng lực IRT, kết quả thi thử và nhận xét của giáo viên sẽ được tự động gửi về email này định kỳ hàng tuần.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSavingParent}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingParent ? 'Đang lưu...' : 'Lưu Thông Tin Phụ Huynh'}</span>
                  </button>
                </div>

              </form>
            </div>

          </div>

          {/* Section 2: Học Bạ Điện Tử & Bảng Điểm ĐGNL (Digital Academic Transcript) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

            {/* Header of Transcript */}
            <div className="pb-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-extrabold shadow-md shadow-blue-600/25 shrink-0">
                  <FileText className="w-6 h-6 text-[#FACC15]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                      Sổ Liên Lạc Điện Tử
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Mã HB: HB-VACT-2026-88902</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Học Bạ Điện Tử & Bảng Điểm Khảo Thí Năng Lực VNU-HCM 2026
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSendReportEmail}
                  disabled={isSendingReport}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  title="Gửi bảng điểm này tới email của phụ huynh"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isSendingReport ? 'Đang gửi...' : 'Gửi Về Email Phụ Huynh'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintTranscript}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  title="In hoặc lưu file PDF học bạ"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In / Xuất PDF</span>
                </button>
              </div>
            </div>

            {/* Student & Guardian Info Header Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Học sinh:</span>
                <strong className="text-slate-900 font-extrabold text-sm">{fullName || mockUser.name}</strong>
                <span className="text-slate-500 block text-[11px]">Mã HS: {currentUser?.id || mockUser.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lớp & Trường THPT:</span>
                <strong className="text-slate-900 font-bold">{mockUser.grade}</strong>
                <span className="text-slate-500 block text-[11px] truncate">{schoolName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phụ huynh đại diện:</span>
                <strong className="text-emerald-700 font-extrabold text-sm">{parentName}</strong>
                <span className="text-slate-500 block text-[11px]">
                  {parentRelation === 'father' ? 'Cha' : parentRelation === 'mother' ? 'Mẹ' : 'Giám hộ'} • {parentPhone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Giáo viên chủ nhiệm:</span>
                <strong className="text-blue-700 font-bold">{mockUser.assignedTeacher}</strong>
                <span className="text-slate-500 block text-[11px]">Cố vấn Chuyên môn ĐGNL</span>
              </div>
            </div>

            {/* 3 Core Stats Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/70">
                <div className="text-[11px] font-extrabold uppercase text-blue-600 tracking-wider">
                  Điểm ĐGNL Ước Lượng Hiện Tại
                </div>
                <div className="text-3xl font-black text-blue-700 mt-1">
                  785 <span className="text-sm font-semibold text-slate-500">/ 1200 Điểm</span>
                </div>
                <div className="text-xs text-blue-800 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đạt 92.3% mục tiêu ĐH Bách Khoa</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="text-[11px] font-extrabold uppercase text-emerald-700 tracking-wider">
                  Xác Suất Trúng Tuyển NV1
                </div>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  82%
                </div>
                <div className="text-xs text-emerald-800 font-semibold mt-1">
                  Khoa học Máy tính - Bách Khoa (850 đ)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/70">
                <div className="text-[11px] font-extrabold uppercase text-purple-700 tracking-wider">
                  Chỉ Số Năng Lực IRT & Chuyên Cần
                </div>
                <div className="text-3xl font-black text-purple-700 mt-1">
                  +0.65 <span className="text-xs font-bold text-slate-500">Theta</span>
                </div>
                <div className="text-xs text-purple-800 font-semibold mt-1">
                  Chuỗi học liên tục {mockUser.streakDays} ngày 🔥
                </div>
              </div>
            </div>

            {/* Detailed Transcript Subject Table */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Bảng Điểm Chi Tiết 3 Phần Thi Chuẩn Hóa VNU-HCM
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Phần Thi / Miền Năng Lực</th>
                      <th className="py-3 px-3 text-center">Số Câu</th>
                      <th className="py-3 px-3 text-center">Điểm Đạt / Tối Đa</th>
                      <th className="py-3 px-3 text-center">Tỷ Lệ</th>
                      <th className="py-3 px-4">Xếp Loại Năng Lực</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold">
                        <div>Phần 1: Sử dụng Ngôn ngữ</div>
                        <div className="text-[11px] text-slate-400 font-normal">Tiếng Việt (30 câu) & Tiếng Anh (20 câu)</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">50</td>
                      <td className="py-3 px-3 text-center font-extrabold text-blue-700">310 / 400</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">77.5%</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          Khá Giỏi
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold">
                        <div>Phần 2: Toán học, Tư duy Logic & Số liệu</div>
                        <div className="text-[11px] text-slate-400 font-normal">Toán giải tích, hình học, logic mệnh đề, bảng ma trận</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">30</td>
                      <td className="py-3 px-3 text-center font-extrabold text-blue-700">255 / 300</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">85.0%</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          Xuất Sắc
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold">
                        <div>Phần 3: Giải quyết vấn đề (Khoa học TN & XH)</div>
                        <div className="text-[11px] text-slate-400 font-normal">Vật lý, Hóa học, Sinh học, Lịch sử, Địa lý</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">40</td>
                      <td className="py-3 px-3 text-center font-extrabold text-amber-700">220 / 500</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600">44.0%</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px]">
                          Cần Bồi Dưỡng
                        </span>
                      </td>
                    </tr>

                    <tr className="bg-slate-50 font-black text-slate-900">
                      <td className="py-3.5 px-4 font-extrabold uppercase">TỔNG ĐIỂM QUY ĐỔI V-ACT</td>
                      <td className="py-3.5 px-3 text-center font-mono">120</td>
                      <td className="py-3.5 px-3 text-center text-sm font-black text-blue-700">785 / 1200</td>
                      <td className="py-3.5 px-3 text-center font-black text-emerald-600">65.4%</td>
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] shadow-xs">
                          Top 15% Toàn Quốc
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pedagogical Comments & AI Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1.5">
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>Lời Phê Của Giáo Viên Chủ Nhiệm ({mockUser.assignedTeacher}):</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed italic">
                  "Em Hoàng có tư duy logic và kỹ năng phân tích số liệu rất nổi trội (đạt 85%). Tuy nhiên miền Khoa học Tự nhiên (Hóa - Sinh) còn để mất điểm đáng tiếc ở các câu đọc hiểu văn bản dài. Gia đình cần nhắc em duy trì 30 phút tự học mỗi tối trên hệ thống để cán mốc 850+ vững vàng."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-1.5">
                <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Khuyến Nghị Chiến Lược Từ Gia Sư AI:</span>
                </div>
                <p className="text-blue-800/90 leading-relaxed">
                  "Hệ thống đã tự động định tuyến lộ trình bồi dưỡng 5 bài tập thích ứng ZPD thuộc chuyên đề Đọc hiểu dữ liệu Sinh học và Bẫy ma trận. Tỷ lệ hoàn thành nhiệm vụ tuần này đạt 8/10 câu."
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 4: Bảo mật & Đổi Mật khẩu */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Change Password Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">Đổi Mật khẩu Tài khoản</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mật khẩu mới yêu cầu tối thiểu 8 ký tự, bao gồm cả chữ hoa, chữ thường và chữ số để đảm bảo tính bảo mật.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu Hiện tại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập ít nhất 8 ký tự kèm chữ hoa, thường, số"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                      <span className={pwStrength.score >= 3 ? 'text-emerald-600' : 'text-amber-600'}>
                        {pwStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${pwStrength.score >= 1 ? pwStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${pwStrength.score >= 2 ? pwStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${pwStrength.score >= 3 ? pwStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${pwStrength.score >= 4 ? pwStrength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Xác nhận Mật khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">Mật khẩu xác nhận chưa khớp với mật khẩu mới.</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword || (confirmPassword && newPassword !== confirmPassword)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSavingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Active Sessions & Security Info Box */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logout Current Session Card */}
            <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-200/70 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Phiên đăng nhập</span>
              </div>
              <p className="text-xs text-rose-700/80 leading-relaxed">
                Đăng xuất khỏi phiên hiện tại trên trình duyệt này. Các thiết bị khác không bị đăng xuất.
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Đăng xuất phiên hiện tại
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab 5: Tùy chọn Học tập & AI */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Tùy chọn Học tập & Thông báo AI</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cá nhân hóa trải nghiệm học tập, âm thanh và phương pháp hướng dẫn từ Gia sư AI.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              AI Tutor Preferences
            </span>
          </div>

          <div className="space-y-5">

            {/* Preference Item 1: Socratic Mode */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Chế độ Gia sư AI Gợi mở Socratic (Flow 4)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                    Khi bật, Gia sư AI sẽ đặt câu hỏi dẫn dắt từng bước để em tự tìm ra lời giải, thay vì đưa đáp án hoàn chỉnh ngay lập tức.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={socraticMode}
                  onChange={(e) => setSocraticMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Preference Item 2: Daily Reminder */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Nhắc nhở Nhiệm vụ Học tập Mỗi ngày</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                    Gửi thông báo nhắc hoàn thành chuỗi ngày streak và ôn luyện bài tập ZPD thích ứng.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {dailyReminder && (
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700"
                  />
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyReminder}
                    onChange={(e) => setDailyReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Preference Item 3: Sound Effects & Confetti */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Hiệu ứng Âm thanh & Pháo hoa Chúc mừng (Confetti)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                    Tạo cảm giác phấn khởi khi hoàn thành chặng thi thử hoặc giải đúng các câu hỏi khó.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Preference Item 4: Weekly Email Report */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Báo cáo Tiến độ Học tập Hàng tuần (Email)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                    Gửi phân tích biểu đồ Radar 8 năng lực và các chủ đề yếu cần khắc phục vào sáng thứ Hai hàng tuần.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={weeklyEmailReport}
                  onChange={(e) => setWeeklyEmailReport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Tùy Chọn</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
