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
  ArrowRight,
  Calendar,
  Clock,
  ArrowRightLeft,
  Video,
  MapPin
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { contentService } from '../../services/contentService';
import { 
  getRemedialSessions, 
  getAllRemedialSessions,
  saveRemedialSession, 
  deleteRemedialSession,
  STANDARD_ACADEMIC_SLOTS
} from '../../utils/remedialSessionStore';
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
  const [heatmapRows, setHeatmapRows] = useState([]);

  // Quản lý lịch học nhóm phụ đạo / bồi dưỡng (Remedial Study Sessions)
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [schedulingGroup, setSchedulingGroup] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    sessionDate: '',
    slotNo: 3,
    timeSlot: 'Slot 3: 13:00 - 15:00',
    startTime: '13:00',
    endTime: '15:00',
    format: 'OFFLINE',
    room: 'Phòng phụ đạo vi mô P.204',
    notes: 'Ôn tập phương pháp giải & củng cố các câu hay làm sai'
  });

  // Chế độ hiển thị danh sách học sinh khi bồi dưỡng chuyên đề
  const [remedialScope, setRemedialScope] = useState('STRUGGLING_ONLY'); // 'STRUGGLING_ONLY' | 'ALL_CLASS'

  // Phân nhóm học sinh tập trung bồi dưỡng đúng chuyên đề được chỉ định (Focus Skill)
  const partitionStudentsForFocusSkill = (focusSkill, skillId, rows = [], size = 4, scope = remedialScope) => {
    if (!rows || rows.length === 0) return [];

    // 1. Xác định tập hợp học sinh cần xếp nhóm
    let targetRows = rows;

    if (scope === 'STRUGGLING_ONLY') {
      // Ưu tiên danh sách targetStudentIds truyền từ ngoài vào (học sinh thực tế < 50%)
      if (Array.isArray(classData?.targetStudentIds) && classData.targetStudentIds.length > 0) {
        const targetIdSet = new Set(classData.targetStudentIds.map(id => String(id).toLowerCase()));
        const matched = rows.filter(r => {
          const sId = r.studentId || r.StudentId || r.id;
          return sId && targetIdSet.has(String(sId).toLowerCase());
        });
        if (matched.length > 0) {
          targetRows = matched;
        }
      } else {
        // Fallback: Lọc những học sinh có điểm làm bài ở chuyên đề này < 50%
        const struggling = rows.filter(r => {
          if (!Array.isArray(r.skillCells)) return false;
          const cell = r.skillCells.find(c =>
            (skillId && String(c.skillId).toLowerCase() === String(skillId).toLowerCase()) ||
            (c.skillName && c.skillName.trim().toLowerCase() === focusSkill.trim().toLowerCase())
          );
          return cell && cell.plt != null ? Number(cell.plt) < 0.5 : false;
        });
        if (struggling.length > 0) {
          targetRows = struggling;
        }
      }
    }

    const studentList = targetRows.map((r) => {
      const sId = r.studentId || r.StudentId || r.id;
      const sName = r.studentName || r.StudentName || r.name;

      // Tìm cell của chuyên đề này trong row
      let skillPlt = null;
      if (Array.isArray(r.skillCells)) {
        const cell = r.skillCells.find((c) =>
          (skillId && String(c.skillId).toLowerCase() === String(skillId).toLowerCase()) ||
          (c.skillName && c.skillName.trim().toLowerCase() === focusSkill.trim().toLowerCase())
        );
        if (cell && cell.plt != null) {
          skillPlt = Number(cell.plt);
        }
      }
      if (skillPlt == null) {
        skillPlt = r.thetaScore ?? r.overallMastery ?? 0.08;
      }

      return {
        studentId: sId,
        id: sId,
        name: sName,
        mastery: skillPlt,
        overallMastery: r.overallMastery
      };
    });

    // Sắp xếp học sinh theo độ hiểu chuyên đề này từ thấp đến cao (bồi dưỡng các bạn yếu nhất trước)
    studentList.sort((a, b) => a.mastery - b.mastery);

    const n = studentList.length;
    if (n === 0) return [];

    // Tạo mã định danh duy nhất theo chuyên đề để không bao giờ bị đụng lịch giữa các chuyên đề khác nhau!
    const skillSlug = (focusSkill || skillId || 'GEN')
      .toLowerCase()
      .replace(/[đĐ]/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);

    // Nếu số lượng học sinh bồi dưỡng từ 1 đến 5 em: Xếp đúng 1 bàn học vi mô kèm riêng
    if (n <= 5) {
      return [{
        groupId: `GRP-${skillSlug}-01`,
        groupName: `Nhóm 01 - Bàn trọng tâm: ${focusSkill}`,
        focusArea: focusSkill,
        memberCount: n,
        members: studentList,
        commonWeakSkillIds: skillId ? [skillId] : [],
        commonWeakSkillNames: [focusSkill],
        assignedWorksheetTitle: `Phiếu bài tập vi mô: 5 câu ${focusSkill}`,
        recommendedWorksheetTitle: `Phiếu bài tập vi mô: 5 câu ${focusSkill}`
      }];
    }

    // Nếu sĩ số > 5 em: Tách thành các bàn học vi mô chuẩn sư phạm 3 - 5 em/bàn
    const minM = Math.ceil(n / 5);
    const maxM = Math.floor(n / 3);
    const targetSize = Math.max(3, Math.min(5, size));
    const targetM = Math.round(n / targetSize);
    const m = Math.max(minM, Math.min(maxM, targetM));

    const baseSize = Math.floor(n / m);
    const remainder = n % m;
    const quotas = [];
    for (let i = 0; i < m; i++) {
      quotas.push(i < remainder ? baseSize + 1 : baseSize);
    }

    const nextGroups = [];
    let curIdx = 0;
    for (let i = 0; i < m; i++) {
      const q = quotas[i];
      const members = studentList.slice(curIdx, curIdx + q);
      curIdx += q;

      const groupNum = String(i + 1).padStart(2, '0');
      const tierTag = m > 1
        ? (i === 0 ? ' (Bồi dưỡng cấp tốc)' : ' (Củng cố & Luyện tập)')
        : '';

      nextGroups.push({
        groupId: `GRP-${skillSlug}-${groupNum}`,
        groupName: `Nhóm ${groupNum} - Bàn trọng tâm: ${focusSkill}${tierTag}`,
        focusArea: focusSkill,
        memberCount: members.length,
        members: members,
        commonWeakSkillIds: skillId ? [skillId] : [],
        commonWeakSkillNames: [focusSkill],
        assignedWorksheetTitle: `Phiếu bài tập vi mô: 5 câu ${focusSkill}`,
        recommendedWorksheetTitle: `Phiếu bài tập vi mô: 5 câu ${focusSkill}`
      });
    }

    return nextGroups;
  };

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
        setHeatmapRows(rows);

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

        // 1. Xử lý nhóm vi mô
        let loadedGroups = [];
        if (groupsRes.status === 'fulfilled' && groupsRes.value) {
          const val = groupsRes.value;
          loadedGroups = Array.isArray(val) ? val : (Array.isArray(val?.groups) ? val.groups : []);
        }

        // Nếu mở modal có chỉ định chuyên đề bồi dưỡng trọng tâm (Focus Skill):
        // Kiểm tra xem nhóm từ CSDL có khớp đúng chuyên đề này không. Nếu không, gom nhóm bồi dưỡng chuẩn xác chuyên đề này.
        if (classData.focusSkill) {
          const isMatchingFocus = loadedGroups.length > 0 && loadedGroups.every((g) =>
            g.focusArea && g.focusArea.toLowerCase().includes(classData.focusSkill.toLowerCase())
          );

          if (!isMatchingFocus) {
            const partitionRows = rows.length > 0
              ? rows
              : (Array.isArray(classData.initialMembers) && classData.initialMembers.length > 0
                  ? classData.initialMembers.map(m => ({
                      studentId: m.studentId || m.id,
                      studentName: m.name,
                      overallMastery: m.mastery || 0.1
                    }))
                  : []);

            if (partitionRows.length > 0) {
              loadedGroups = partitionStudentsForFocusSkill(
                classData.focusSkill,
                classData.focusSkillId,
                partitionRows,
                preferredGroupSize
              );
            }
          }
        }

        setGroups(loadedGroups);

        // 4. Nạp lịch phụ đạo đã lên cho lớp (hỗ trợ tra cứu fallback toàn hệ thống nếu có targetGroupId/focusSkill)
        const classIdToUse = classData.id || classData.classId;
        let sessions = getRemedialSessions(classIdToUse);
        if ((!sessions || sessions.length === 0) && classData.focusSkill) {
          const allSessions = getAllRemedialSessions();
          const matched = allSessions.filter(s =>
            (s.classId === classIdToUse) ||
            (classData.targetGroupId && s.groupId === classData.targetGroupId) ||
            (s.focusSkill && s.focusSkill.toLowerCase().trim() === classData.focusSkill.toLowerCase().trim()) ||
            (s.topic && s.topic.toLowerCase().replace(/^phụ đạo:\s*/i, '').trim() === classData.focusSkill.toLowerCase().trim())
          );
          if (matched.length > 0) sessions = matched;
        }
        setScheduledSessions(sessions);
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
    // 0. Nếu đang trong ngữ cảnh bồi dưỡng chuyên đề trọng tâm, luôn ưu tiên chuyên đề này
    if (classData?.focusSkill) {
      const list = [classData.focusSkill];
      if (Array.isArray(grp.commonWeakSkillNames)) {
        grp.commonWeakSkillNames.forEach((n) => {
          if (n && n !== classData.focusSkill && !isRawGuid(n)) list.push(n);
        });
      }
      return Array.from(new Set(list));
    }

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

  // Xử lý tự động chia nhóm vi mô trên Backend hoặc tập trung bồi dưỡng Focus Skill
  const handleAutoPartition = async (overrideSize = null) => {
    if (!classData) return;
    const targetGroupSize = overrideSize || preferredGroupSize;
    try {
      setLoading(true);

      let nextGroups = [];
      if (classData.focusSkill) {
        // Ưu tiên gọi Backend API kèm focusSkill parameters
        try {
          const res = await practiceService.autoPartitionMicroGroups(classData.id, targetGroupSize, {
            focusSkillId: classData.focusSkillId,
            focusSkillName: classData.focusSkill,
            targetStudentIds: classData.targetStudentIds
          });
          const rawGroups = Array.isArray(res?.groups) ? res.groups : (Array.isArray(res) ? res : []);
          const isMatching = rawGroups.length > 0 && rawGroups.every((g) =>
            g.focusArea && g.focusArea.toLowerCase().includes(classData.focusSkill.toLowerCase())
          );
          if (isMatching) {
            nextGroups = rawGroups;
          }
        } catch (apiErr) {
          console.warn('[ClassMicroGroupsModal] Backend focus partition fallback:', apiErr.message);
        }

        // Nếu Backend chưa có nhóm riêng cho chuyên đề này, phân nhóm bám sát chuyên đề focusSkill
        if (nextGroups.length === 0) {
          const activeRows = heatmapRows.length > 0
            ? heatmapRows
            : Array.from(studentInfoMap.entries()).map(([id, info]) => ({
                studentId: id,
                studentName: info.name,
                overallMastery: info.mastery,
                skillCells: [{ skillName: classData.focusSkill, skillId: classData.focusSkillId, plt: info.mastery ?? 0.1 }]
              }));

          nextGroups = partitionStudentsForFocusSkill(
            classData.focusSkill,
            classData.focusSkillId,
            activeRows,
            targetGroupSize
          );
        }
      } else {
        const res = await practiceService.autoPartitionMicroGroups(classData.id, targetGroupSize);
        nextGroups = Array.isArray(res?.groups) ? res.groups : (Array.isArray(res) ? res : []);
      }

      setGroups(nextGroups);

      // Sinh thông báo giải thích toán học & sư phạm rõ ràng
      const studentCounts = nextGroups.map(g => (g.members || []).length || g.memberCount || 0);
      const breakdownText = studentCounts.map((cnt, i) => `Bàn ${i + 1}: ${cnt} bạn`).join(', ');
      const totalPlaced = studentCounts.reduce((a, b) => a + b, 0);

      const focusLabel = classData.focusSkill ? ` chuyên đề "${classData.focusSkill}"` : '';
      setSuccessNotice(
        `Đã xếp thành công ${nextGroups.length} nhóm bàn (${breakdownText})${focusLabel} cho ${totalPlaced} học sinh theo chuẩn sư phạm 3 – 5 bạn/bàn!`
      );
      setTimeout(() => setSuccessNotice(''), 7000);
    } catch (err) {
      toast.error('Không thể phân nhóm vi mô: ' + (err?.message || 'Lỗi kết nối Backend'));
    } finally {
      setLoading(false);
    }
  };

  // Chọn quy mô bàn học và tự động cập nhật phân nhóm
  const handleSelectGroupSize = (size) => {
    setPreferredGroupSize(size);
    if (classData.focusSkill && heatmapRows.length > 0) {
      const nextGroups = partitionStudentsForFocusSkill(
        classData.focusSkill,
        classData.focusSkillId,
        heatmapRows,
        size,
        remedialScope
      );
      setGroups(nextGroups);
      const studentCounts = nextGroups.map(g => (g.members || []).length || g.memberCount || 0);
      const breakdownText = studentCounts.map((cnt, i) => `Bàn ${i + 1}: ${cnt} bạn`).join(', ');
      const totalPlaced = studentCounts.reduce((a, b) => a + b, 0);
      setSuccessNotice(
        `Đã xếp lại ${nextGroups.length} nhóm bàn (${breakdownText}) chuyên đề "${classData.focusSkill}" theo quy mô ${size} bạn/bàn!`
      );
      setTimeout(() => setSuccessNotice(''), 7000);
    } else {
      handleAutoPartition(size);
    }
  };

  // Thao tác chuyển đổi học sinh giữa các bàn học (Tự chủ giảng viên)
  const handleMoveStudent = (studentId, fromGroupId, toGroupId) => {
    const fromGroup = groups.find(g => g.groupId === fromGroupId);
    const toGroup = groups.find(g => g.groupId === toGroupId);
    if (!fromGroup || !toGroup) return;

    const studentToMove = (fromGroup.members || []).find(m => (m.studentId || m.id) === studentId);
    if (!studentToMove) return;

    // Cảnh báo sư phạm mềm
    if ((fromGroup.members || []).length <= 3) {
      toast.warning(`${fromGroup.groupName?.split(' - ')[0] || 'Bàn hiện tại'} sẽ còn dưới 3 bạn. Chú ý giữ sĩ số tối thiểu thảo luận nhóm!`);
    }
    if ((toGroup.members || []).length >= 5) {
      toast.warning(`${toGroup.groupName?.split(' - ')[0] || 'Bàn đích'} sẽ có hơn 5 bạn. Chú ý đảm bảo khả năng kèm cặp tại bàn!`);
    }

    const nextGroups = groups.map(g => {
      if (g.groupId === fromGroupId) {
        const newMembers = (g.members || []).filter(m => (m.studentId || m.id) !== studentId);
        return { ...g, members: newMembers, memberCount: newMembers.length };
      }
      if (g.groupId === toGroupId) {
        const newMembers = [...(g.members || []), studentToMove];
        return { ...g, members: newMembers, memberCount: newMembers.length };
      }
      return g;
    });

    setGroups(nextGroups);
    const studentName = getDisplayStudentName(studentToMove);
    toast.success(`Đã chuyển bạn ${studentName} sang ${toGroup.groupName?.split(' - ')[0] || toGroup.groupName}!`);
  };

  // Mở modal lên lịch phụ đạo
  const handleOpenScheduleModal = (group) => {
    // Khởi tạo ngày học mặc định (ngày mai)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    const existing = scheduledSessions.find(s => 
      s.groupId === group.groupId ||
      (classData?.targetGroupId && s.groupId === classData.targetGroupId) ||
      (group.focusArea && (
        (s.focusSkill && s.focusSkill.toLowerCase().trim() === group.focusArea.toLowerCase().trim()) ||
        (s.topic && s.topic.toLowerCase().replace(/^phụ đạo:\s*/i, '').trim() === group.focusArea.toLowerCase().trim())
      ))
    );
    setSchedulingGroup(group);

    const defaultSlot = STANDARD_ACADEMIC_SLOTS[2]; // Slot 3: 13:00 - 15:00

    setScheduleForm({
      sessionDate: existing?.sessionDate || defaultDate,
      slotNo: existing?.slotNo || defaultSlot.slot,
      timeSlot: existing?.timeSlot || `${defaultSlot.label}: ${defaultSlot.timeRange}`,
      startTime: existing?.startTime || defaultSlot.startTime,
      endTime: existing?.endTime || defaultSlot.endTime,
      format: existing?.format || 'OFFLINE',
      room: existing?.room || (existing?.format === 'ONLINE' ? 'Trực tuyến' : 'Phòng phụ đạo vi mô P.204'),
      notes: existing?.notes || `Bồi dưỡng chuyên đề: ${group.focusArea || classData.focusSkill || 'Kiến thức trọng tâm'}`
    });
  };

  // Lưu lịch phụ đạo cho nhóm
  const handleSaveSchedule = () => {
    if (!schedulingGroup) return;
    if (!scheduleForm.sessionDate) {
      toast.error('Vui lòng chọn ngày tổ chức buổi phụ đạo.');
      return;
    }

    const currentSlot = STANDARD_ACADEMIC_SLOTS.find(s => s.slot === scheduleForm.slotNo) || STANDARD_ACADEMIC_SLOTS[2];

    const payload = {
      groupId: schedulingGroup.groupId,
      groupName: schedulingGroup.groupName,
      topic: schedulingGroup.focusArea || classData.focusSkill || 'Củng cố kiến thức trọng tâm',
      focusSkill: classData.focusSkill || schedulingGroup.focusArea,
      focusSkillId: classData.focusSkillId,
      sessionDate: scheduleForm.sessionDate,
      slotNo: currentSlot.slot,
      timeSlot: `${currentSlot.label}: ${currentSlot.timeRange}`,
      startTime: currentSlot.startTime,
      endTime: currentSlot.endTime,
      format: scheduleForm.format,
      room: scheduleForm.format === 'ONLINE' ? 'Trực tuyến (Google Meet / Zoom)' : (scheduleForm.room || 'Phòng phụ đạo vi mô P.204'),
      studentCount: (schedulingGroup.members || []).length,
      members: (schedulingGroup.members || []).map(m => ({
        studentId: m.studentId || m.id,
        name: m.name,
        mastery: m.mastery
      })),
      className: classData.name,
      teacherName: classData.assignedTeacher || 'Giảng viên phụ trách',
      isRemedial: true,
      notes: scheduleForm.notes
    };

    const saved = saveRemedialSession(classData.id, payload);
    if (saved) {
      setScheduledSessions(getRemedialSessions(classData.id));
      setSuccessNotice(`Đã lên lịch phụ đạo ${currentSlot.label} (${currentSlot.timeRange}) ngày ${saved.sessionDate} cho ${schedulingGroup.groupName}!`);
      setTimeout(() => setSuccessNotice(''), 6000);
      toast.success(`Đã lưu lịch phụ đạo (${currentSlot.label}) và đồng bộ sang Thời Khóa Biểu!`);
      setSchedulingGroup(null);
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
        
        {/* Modal Header Với Ngữ Cảnh Lớp Rõ Ràng */}
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
                  Phân hóa năng lực
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-1">
                Lớp: <strong className="text-white">{classData.name}</strong> • Mã lớp: <strong className="text-cyan-300">{classData.code || classData.id?.slice(0, 8)}</strong> • Giảng viên: <strong className="text-white">{classData.assignedTeacher || 'Thầy/Cô phụ trách'}</strong>
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

        {/* Banner Ngữ Cảnh Chuyên Đề Được Chọn Bồi Dưỡng */}
        {classData.focusSkill && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Chuyên đề bồi dưỡng trọng tâm
                </span>
                <span className="text-sm font-black text-amber-950">
                  {classData.focusSkill}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setRemedialScope('STRUGGLING_ONLY');
                  if (heatmapRows.length > 0) {
                    const g = partitionStudentsForFocusSkill(
                      classData.focusSkill,
                      classData.focusSkillId,
                      heatmapRows,
                      preferredGroupSize,
                      'STRUGGLING_ONLY'
                    );
                    setGroups(g);
                  }
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                  remedialScope === 'STRUGGLING_ONLY'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
                title="Chỉ xếp các bạn có điểm kiểm tra chưa đạt chuyên đề này"
              >
                🎯 Chỉ {groups.reduce((a, g) => a + (g.members?.length || 0), 0)} học sinh chưa đạt
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemedialScope('ALL_CLASS');
                  if (heatmapRows.length > 0) {
                    const g = partitionStudentsForFocusSkill(
                      classData.focusSkill,
                      classData.focusSkillId,
                      heatmapRows,
                      preferredGroupSize,
                      'ALL_CLASS'
                    );
                    setGroups(g);
                  }
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                  remedialScope === 'ALL_CLASS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
                title="Xếp toàn bộ học sinh trong lớp theo các mức độ bồi dưỡng khác nhau"
              >
                👥 Cả lớp ({totalStudents} học sinh)
              </button>
            </div>
          </div>
        )}

        {/* Action & Strategy Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-slate-500 font-bold">Quy mô mỗi bàn học:</span>
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSelectGroupSize(size)}
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
              (Chuẩn sư phạm: Mỗi bàn từ 3 đến 5 học sinh)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleAutoPartition()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {classData.focusSkill
                  ? `Tự Động Xếp Nhóm: ${classData.focusSkill}`
                  : 'Tự Động Xếp Nhóm Theo Chuyên Đề'}
              </span>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Sơ đồ {groups.length} Nhóm Bàn Học Cần Hỗ Trợ</span>
            </div>
            <span className="text-slate-400 font-normal">
              Thầy/cô có thể tự do đổi bàn hoặc lên lịch phụ đạo riêng cho từng nhóm
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
              const scheduledSession = scheduledSessions.find(s => 
                s.groupId === grp.groupId ||
                (classData?.targetGroupId && s.groupId === classData.targetGroupId) ||
                (grp.focusArea && (
                  (s.focusSkill && s.focusSkill.toLowerCase().trim() === grp.focusArea.toLowerCase().trim()) ||
                  (s.topic && s.topic.toLowerCase().replace(/^phụ đạo:\s*/i, '').trim() === grp.focusArea.toLowerCase().trim())
                ))
              );

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
                      <span className="truncate">{grp.focusArea || classData.focusSkill || 'Củng cố kiến thức trọng tâm'}</span>
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

                  {/* Members List Với Nút Chuyển Bàn Tự Chủ */}
                  <div className="p-4 space-y-2.5 flex-1">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Thành viên bàn học ({members.length} em)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Đổi bàn ⇄</span>
                    </div>

                    <div className="space-y-1.5">
                      {members.map((m, mIdx) => {
                        const displayName = getDisplayStudentName(m);
                        const mastery = getDisplayMastery(m);
                        const sId = m.studentId || m.id;

                        return (
                          <div 
                            key={sId || mIdx}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-6 h-6 rounded-full ${m.avatarColor || 'bg-indigo-500'} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
                                {displayName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-800 truncate" title={displayName}>
                                {displayName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {mastery != null ? (
                                <span className={`text-[11px] font-black ${mastery >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {Math.round(mastery <= 1 ? mastery * 100 : mastery)}%
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Đang luyện</span>
                              )}

                              {/* Menu chuyển bàn nhanh cho Giảng viên */}
                              {groups.length > 1 && (
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) handleMoveStudent(sId, grp.groupId, e.target.value);
                                  }}
                                  className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 rounded-md px-1.5 py-0.5 cursor-pointer transition-colors"
                                  title="Chuyển học sinh này sang bàn khác"
                                >
                                  <option value="" disabled>⇄</option>
                                  {groups
                                    .filter(other => other.groupId !== grp.groupId)
                                    .map(other => (
                                      <option key={other.groupId} value={other.groupId}>
                                        Sang {other.groupName?.split(' - ')[0] || other.groupName}
                                      </option>
                                    ))}
                                </select>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Area: Lên Lịch Phụ Đạo & Phát Phiếu Bài Tập */}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2.5">
                    {/* Trạng thái Lịch Phụ Đạo đã lên */}
                    {scheduledSession ? (
                      <div className="p-2.5 bg-indigo-50/90 border border-indigo-200 rounded-xl text-xs space-y-1 animate-fade-in">
                        <div className="flex items-center justify-between font-bold text-indigo-900">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Lịch phụ đạo: {scheduledSession.sessionDate}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/70 text-indigo-800 font-black">
                            {scheduledSession.format === 'ONLINE' ? 'Trực tuyến' : 'Tại lớp'}
                          </span>
                        </div>
                        <div className="text-[11px] text-indigo-700 font-medium">
                          Ca học: <strong>{scheduledSession.timeSlot}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(grp)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline font-bold pt-0.5 cursor-pointer block"
                        >
                          Đổi lịch học phụ đạo »
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenScheduleModal(grp)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Lên Lịch Buổi Phụ Đạo Cho Nhóm Này</span>
                      </button>
                    )}

                    {/* Phiếu bài tập thích ứng */}
                    <div className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 truncate">
                        <strong>Đề xuất:</strong> {grp.recommendedWorksheetTitle || 'Phiếu bài tập củng cố'}
                      </span>
                    </div>

                    {isWorksheetAssigned ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
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

      {/* Sub-Modal: Lên Lịch Buổi Phụ Đạo Cho Nhóm Bàn */}
      {schedulingGroup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Lên Lịch Buổi Phụ Đạo
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {schedulingGroup.groupName?.split(' - ')[0] || schedulingGroup.groupName} ({schedulingGroup.members?.length} học sinh)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingGroup(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chuyên đề trọng tâm bồi dưỡng:
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900">
                  {schedulingGroup.focusArea || classData.focusSkill || 'Củng cố kiến thức trọng tâm'}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Hình thức tổ chức buổi phụ đạo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleForm(prev => ({ ...prev, format: 'OFFLINE' }))}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      scheduleForm.format === 'OFFLINE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Tại phòng học</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleForm(prev => ({ ...prev, format: 'ONLINE' }))}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      scheduleForm.format === 'ONLINE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Live Q&A Online</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ngày tổ chức buổi phụ đạo:
                </label>
                <input
                  type="date"
                  value={scheduleForm.sessionDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, sessionDate: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn Ca học (Khung 6 Slot chuẩn của Thời Khóa Biểu):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-1.5">
                  {STANDARD_ACADEMIC_SLOTS.map((slotObj) => {
                    const isSelected = scheduleForm.slotNo === slotObj.slot;
                    return (
                      <button
                        key={slotObj.slot}
                        type="button"
                        onClick={() => setScheduleForm(prev => ({
                          ...prev,
                          slotNo: slotObj.slot,
                          timeSlot: `${slotObj.label}: ${slotObj.timeRange}`,
                          startTime: slotObj.startTime,
                          endTime: slotObj.endTime
                        }))}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs">{slotObj.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">{slotObj.period}</span>
                        </div>
                        <div className="text-[11px] font-mono font-medium text-slate-600 mt-0.5">{slotObj.timeRange}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi chú dặn dò học sinh:
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Nhập nội dung dặn dò học sinh chuẩn bị bài..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-xs font-medium text-slate-800 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSchedulingGroup(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận & Lưu Lịch Phụ Đạo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
