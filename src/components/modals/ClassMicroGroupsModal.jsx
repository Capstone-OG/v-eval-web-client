import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Printer, 
  RotateCw, 
  Layers, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Target,
  ArrowRight
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { contentService } from '../../services/contentService';
import { toast } from '../../context/ToastContext';

export default function ClassMicroGroupsModal({ isOpen, onClose, classData }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preferredGroupSize, setPreferredGroupSize] = useState(4);
  const [successNotice, setSuccessNotice] = useState('');
  const [assigningGroupId, setAssigningGroupId] = useState(null);

  // Từ điển ánh xạ dữ liệu thật từ Backend (Không hardcode)
  const [skillNameMap, setSkillNameMap] = useState(new Map());
  const [studentInfoMap, setStudentInfoMap] = useState(new Map());
  const [nameFrequencyMap, setNameFrequencyMap] = useState(new Map());

  // Nạp danh sách nhóm và ma trận năng lực thực tế từ Backend khi mở modal
  useEffect(() => {
    if (!isOpen || !classData) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        // Tải đồng thời: nhóm vi mô, ma trận nhiệt của lớp và cây kỹ năng từ Backend
        const [groupsRes, heatmapRes, skillsTreeRes] = await Promise.allSettled([
          practiceService.getClassMicroGroups(classData.id),
          practiceService.getClassHeatmap(classData.id),
          contentService.getSkillsTree().catch(() => null)
        ]);

        if (!isMounted) return;

        // 1. Xử lý nhóm vi mô
        let loadedGroups = [];
        if (groupsRes.status === 'fulfilled' && groupsRes.value) {
          const val = groupsRes.value;
          loadedGroups = Array.isArray(val) ? val : (Array.isArray(val?.groups) ? val.groups : []);
        }
        setGroups(loadedGroups);

        // 2. Xây dựng bản đồ tên kỹ năng từ heatmap và cây kỹ năng Content Service
        const nextSkillMap = new Map();

        // Từ cây kỹ năng
        if (skillsTreeRes.status === 'fulfilled' && skillsTreeRes.value) {
          const tree = Array.isArray(skillsTreeRes.value) ? skillsTreeRes.value : [];
          tree.forEach((node) => {
            const id = node.skillId || node.SkillId || node.id;
            const name = node.name || node.Name || node.skillName;
            if (id && name) {
              nextSkillMap.set(String(id).toLowerCase(), name);
            }
          });
        }

        // Từ cột Heatmap của lớp
        let heatmapData = null;
        if (heatmapRes.status === 'fulfilled' && heatmapRes.value) {
          heatmapData = heatmapRes.value;
          const cols = heatmapData?.columns || heatmapData?.Columns || [];
          cols.forEach((col) => {
            const id = col.skillId || col.SkillId || col.id;
            const name = col.skillName || col.SkillName || col.name;
            if (id && name) {
              nextSkillMap.set(String(id).toLowerCase(), name);
            }
          });
        }

        setSkillNameMap(nextSkillMap);

        // 3. Xây dựng bản đồ học sinh (họ tên, điểm mastery) từ Heatmap rows
        const nextStudentMap = new Map();
        const nextFreqMap = new Map();

        const rows = heatmapData?.rows || heatmapData?.Rows || [];
        rows.forEach((r) => {
          const sId = r.studentId || r.StudentId || r.id;
          const sName = r.studentName || r.StudentName || r.name;
          const mastery = r.thetaScore ?? r.ThetaScore ?? r.overallMastery ?? r.OverallMastery;
          if (sId) {
            nextStudentMap.set(String(sId).toLowerCase(), {
              name: sName || '',
              mastery: typeof mastery === 'number' ? mastery : null
            });
          }
          if (sName) {
            const trimmedName = sName.trim();
            nextFreqMap.set(trimmedName, (nextFreqMap.get(trimmedName) || 0) + 1);
          }
        });

        setStudentInfoMap(nextStudentMap);
        setNameFrequencyMap(nextFreqMap);
      } catch (err) {
        console.warn('[ClassMicroGroupsModal] Error fetching data:', err.message);
        if (isMounted) setGroups([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, classData]);

  // Kiểm tra chuỗi có phải là raw UUID không để loại bỏ rò rỉ mã GUID lên UI
  const isRawGuid = (str) => {
    if (typeof str !== 'string') return false;
    const clean = str.trim().replace(/^\{|\}$/g, '');
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
  };

  // Định dạng tên học sinh kèm định danh phân biệt khi lớp có trùng họ tên (ví dụ: 2 bạn cùng tên Phạm Tấn Lộc)
  const getDisplayStudentName = (member) => {
    const sId = member.studentId || member.StudentId || member.id;
    const lookup = sId ? studentInfoMap.get(String(sId).toLowerCase()) : null;
    const baseName = member.name || member.Name || lookup?.name || '';

    if (!baseName) {
      return sId ? `Học sinh #${String(sId).slice(-4).toUpperCase()}` : 'Học sinh';
    }

    // Nếu trong lớp có từ 2 học sinh trở lên trùng đúng họ tên này -> gắn hậu tố mã định danh ngắn gọn
    const freq = nameFrequencyMap.get(baseName.trim()) || 0;
    if (freq > 1 && sId) {
      return `${baseName} (#${String(sId).slice(-4).toUpperCase()})`;
    }

    return baseName;
  };

  // Lấy độ làm chủ thực tế của học sinh từ CSDL
  const getDisplayMastery = (member) => {
    if (typeof member.mastery === 'number') return member.mastery;
    const sId = member.studentId || member.StudentId || member.id;
    if (sId) {
      const lookup = studentInfoMap.get(String(sId).toLowerCase());
      if (typeof lookup?.mastery === 'number') return lookup.mastery;
    }
    return null;
  };

  // Ánh xạ danh sách điểm yếu sang tên chuyên đề tiếng Việt chuẩn, tuyệt đối không lộ raw UUID
  const getResolvedWeakSkills = (grp) => {
    // 1. Ưu tiên danh sách tên chuyên đề đã được Backend xử lý
    if (Array.isArray(grp.commonWeakSkillNames) && grp.commonWeakSkillNames.length > 0) {
      const validNames = grp.commonWeakSkillNames.filter((n) => n && !isRawGuid(n));
      if (validNames.length > 0) return Array.from(new Set(validNames));
    }

    // 2. Tra cứu từ CommonWeakSkillIds
    const rawIds = Array.isArray(grp.commonWeakSkillIds) ? grp.commonWeakSkillIds : [];
    const resolved = [];

    for (const item of rawIds) {
      if (!item) continue;
      const str = String(item).trim();
      const lower = str.toLowerCase();
      if (skillNameMap.has(lower)) {
        resolved.push(skillNameMap.get(lower));
      } else if (!isRawGuid(str)) {
        // Bản thân chuỗi đã là tên kỹ năng (không phải UUID)
        resolved.push(str);
      }
    }

    // 3. Fallback an toàn: Nếu không tìm thấy tên trong từ điển, dùng FocusArea của nhóm
    if (resolved.length === 0 && grp.focusArea && !isRawGuid(grp.focusArea)) {
      resolved.push(grp.focusArea);
    }

    return Array.from(new Set(resolved));
  };

  // Xử lý tự động chia nhóm vi mô trên Backend
  const handleAutoPartition = async () => {
    if (!classData) return;
    try {
      setLoading(true);
      const res = await practiceService.autoPartitionMicroGroups(classData.id, preferredGroupSize);
      const nextGroups = Array.isArray(res?.groups) ? res.groups : (Array.isArray(res) ? res : []);
      setGroups(nextGroups);
      setSuccessNotice(
        `Đã xếp thành công ${res?.totalGroups ?? nextGroups.length} nhóm học tập (${preferredGroupSize} bạn/nhóm) theo chuyên đề cần củng cố!`
      );
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err) {
      toast.error('Không thể phân nhóm vi mô: ' + (err?.message || 'Lỗi kết nối Backend'));
    } finally {
      setLoading(false);
    }
  };

  // Xử lý phân phối đề luyện tập thích ứng cho nhóm bàn
  const handleAssignWorksheet = async (group) => {
    try {
      setAssigningGroupId(group.groupId);
      // Backend tự động đóng gói bộ 5 câu hỏi thích ứng theo CommonWeakSkillIds của nhóm khi worksheetId để trống
      const res = await practiceService.assignGroupWorksheet(classData.id, group.groupId, null, group.recommendedWorksheetTitle || null);
      const resData = res?.value || res?.data || res;
      const assignedId = resData?.assignedWorksheetId || `WS-${String(group.groupId).slice(0, 8)}`;
      const assignedTitle = resData?.assignedWorksheetTitle || group.recommendedWorksheetTitle || `Phiếu bài tập củng cố: ${group.focusArea || 'Chuyên đề trọng tâm'}`;

      // Cập nhật state nhóm
      setGroups(prev => prev.map(g => {
        if (g.groupId === group.groupId) {
          return {
            ...g,
            assignedWorksheetId: assignedId,
            assignedWorksheetTitle: assignedTitle,
            worksheetAssignedAt: new Date().toISOString()
          };
        }
        return g;
      }));

      setSuccessNotice(`Đã phân phối thành công "${assignedTitle}" trực tiếp tới ${group.groupName}!`);
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      console.warn('Assign worksheet error:', err.message);
      toast.error('Không thể phát phiếu bài tập lúc này: ' + (err?.message || 'Lỗi kết nối'));
    } finally {
      setAssigningGroupId(null);
    }
  };

  if (!isOpen || !classData) return null;

  const totalStudents = groups.reduce((acc, g) => acc + (g.memberCount || (g.members ? g.members.length : 0)), 0) || (classData.totalStudents || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Sơ Đồ Chia Nhóm Học Tập (3 – 5 Học Sinh / Bàn)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                  Sĩ số: {totalStudents} Học sinh
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-bold">
                  Học trên lớp
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-1">
                Lớp: <strong className="text-white">{classData.name}</strong> • Giảng viên phụ trách: <strong className="text-cyan-300">{classData.assignedTeacher || 'Thầy/Cô phụ trách'}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Strategy Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-slate-500 font-bold">Quy mô mỗi bàn học:</span>
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => setPreferredGroupSize(size)}
                  className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                    preferredGroupSize === size
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {size} bạn/bàn
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 italic">
              (Mỗi bàn từ 3 đến 5 học sinh)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAutoPartition}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>Tự Động Xếp Nhóm Theo Chuyên Đề</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
              title="In trực tiếp hoặc Lưu dưới dạng PDF qua trình duyệt"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">In Sơ Đồ Bàn (PDF)</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1">{successNotice}</div>
          </div>
        )}

        {/* Groups Grid / Study Stations */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Sơ đồ {groups.length} Nhóm Bàn Học Cần Hỗ Trợ</span>
            </div>
            <span className="text-slate-400 font-normal">
              Phân nhóm học tập theo năng lực & vùng trũng kiến thức
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang đồng bộ dữ liệu nhóm học tập từ hệ thống...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Chưa chia nhóm học tập cho lớp này</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Bấm vào nút <strong>"Tự Động Xếp Nhóm Theo Chuyên Đề"</strong> phía trên để hệ thống xếp các em có cùng chuyên đề cần củng cố vào chung một nhóm bàn.
              </p>
              <button
                onClick={handleAutoPartition}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Tự động xếp nhóm ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((grp, idx) => {
              const members = grp.members || [];
              const isWorksheetAssigned = !!grp.assignedWorksheetTitle;

              return (
                <div 
                  key={grp.groupId || idx}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Table Header */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {grp.groupName}
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black rounded-lg shrink-0">
                        {grp.memberCount || members.length} bạn
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{grp.focusArea || 'Củng cố kiến thức trọng tâm'}</span>
                    </div>

                    {/* Common Deficiencies Tags (Tối đa 2 thẻ chuyên đề, kèm badge rút gọn chống tràn UI) */}
                    {(() => {
                      const weakSkills = getResolvedWeakSkills(grp);
                      if (weakSkills.length === 0) return null;

                      const maxVisibleTags = 2;
                      const visibleTags = weakSkills.slice(0, maxVisibleTags);
                      const hiddenCount = weakSkills.length - maxVisibleTags;

                      return (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {visibleTags.map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-md max-w-full truncate"
                              title={skill}
                            >
                              ⚠️ {skill}
                            </span>
                          ))}
                          {hiddenCount > 0 && (
                            <span 
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-md transition-colors cursor-help"
                              title={`Các chuyên đề củng cố thêm:\n• ${weakSkills.slice(maxVisibleTags).join('\n• ')}`}
                            >
                              +{hiddenCount} chuyên đề khác
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Members List */}
                  <div className="p-4 space-y-2.5 flex-1">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Thành viên bàn học ({members.length} em)
                    </div>

                    <div className="space-y-1.5">
                      {members.map((m, mIdx) => {
                        const displayName = getDisplayStudentName(m);
                        const mastery = getDisplayMastery(m);

                        return (
                          <div 
                            key={m.studentId || m.id || mIdx}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-6 h-6 rounded-full ${m.avatarColor || 'bg-indigo-500'} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
                                {displayName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-800 truncate" title={displayName}>
                                {displayName}
                              </span>
                            </div>

                            <div className="text-[11px] font-black text-slate-500 shrink-0 ml-2">
                              {mastery != null ? (
                                <span className={mastery >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}>
                                  {Math.round(mastery <= 1 ? mastery * 100 : mastery)}%
                                </span>
                              ) : (
                                <span className="text-slate-400">Đang luyện</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action: Assign Worksheet */}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong>Đề xuất:</strong> {grp.recommendedWorksheetTitle || 'Phiếu bài tập củng cố'}
                      </span>
                    </div>

                    {isWorksheetAssigned ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">Đã phát đề luyện tập</span>
                        </div>
                        <button 
                          onClick={() => handleAssignWorksheet(grp)}
                          className="text-[11px] text-emerald-700 hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          Đổi đề
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAssignWorksheet(grp)}
                        disabled={assigningGroupId === grp.groupId}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {assigningGroupId === grp.groupId ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Giao Phiếu Bài Tập Cho Nhóm Này</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Chia nhóm học tập nhỏ giúp giáo viên dễ dàng kèm cặp và hướng dẫn các em học tập hiệu quả.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
