export default function WeakSkills({ result }) {
  const skills = result?.weakSkills?.length ? result.weakSkills : result?.skillBreakdowns?.filter((skill) => skill.isWeak) || [];
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
    <div><h3 className="text-lg font-bold text-slate-900">Kỹ năng cần củng cố</h3>
      <p className="mt-1 text-sm text-slate-500">Ưu tiên những kỹ năng có tỉ lệ đúng thấp.</p></div>
    {skills.length ? <div className="grid gap-3 sm:grid-cols-2">
      {[...skills].sort((a, b) => a.accuracyPercentage - b.accuracyPercentage).map((skill) => (
        <div key={skill.skillId} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="font-semibold text-slate-900">{skill.skillName}</p>
          <p className="mt-1 text-xs text-slate-500">{skill.domainName}</p>
          <div className="mt-3 flex justify-between text-sm"><span>{skill.correctCount}/{skill.totalQuestions} câu đúng</span>
            <strong className="text-amber-800">{Math.round(skill.accuracyPercentage)}%</strong></div>
          <div className="mt-2 h-1.5 rounded-full bg-amber-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.max(0, Math.min(100, skill.accuracyPercentage))}%` }} /></div>
        </div>))}
    </div> : <p className="text-sm text-slate-600">Chưa có kỹ năng yếu được ghi nhận trong kết quả này.</p>}
  </section>;
}
