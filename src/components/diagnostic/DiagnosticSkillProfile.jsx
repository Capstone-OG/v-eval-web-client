import { Brain, CheckCircle2, Info } from 'lucide-react';

const validPrior = (skill) => typeof skill?.pL0 === 'number'
  && Number.isFinite(skill.pL0) && skill.pL0 >= 0 && skill.pL0 <= 1;

function Mastery({ skill }) {
  if (!validPrior(skill)) return <p className="mt-3 text-xs text-slate-500">Chưa có mức thành thạo ước lượng.</p>;
  const percent = Math.round(skill.pL0 * 100);
  return <div className="mt-3 space-y-2">
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-500">Mức thành thạo ước lượng</span>
      <strong className="text-indigo-700">{percent}%</strong>
    </div>
    <div role="meter" aria-label={`Mức thành thạo ${skill.skillName || 'kỹ năng'}`}
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
      className="h-1.5 overflow-hidden rounded-full bg-indigo-50">
      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
    </div>
  </div>;
}

export default function DiagnosticSkillProfile({ result }) {
  const breakdowns = Array.isArray(result?.skillBreakdowns) ? result.skillBreakdowns : [];
  const priors = Array.isArray(result?.skillPriors) ? result.skillPriors : [];
  const measured = priors.filter((skill) => skill.source === 'measured');
  const inferred = priors.filter((skill) => skill.source === 'inferred_from_domain');
  const unknown = priors.filter((skill) => !['measured', 'inferred_from_domain'].includes(skill.source));
  const measuredById = new Map(measured.map((skill) => [skill.skillId, skill]));
  const breakdownIds = new Set(breakdowns.map((skill) => skill.skillId));
  const assessed = [
    ...breakdowns.map((skill) => ({ ...skill, prior: measuredById.get(skill.skillId) })),
    ...measured.filter((skill) => !breakdownIds.has(skill.skillId)).map((skill) => ({ ...skill, prior: skill })),
  ];
  const domains = new Map();
  for (const skill of assessed) {
    const domain = skill.domainName || 'Chưa có thông tin miền kiến thức';
    if (!domains.has(domain)) domains.set(domain, []);
    domains.get(domain).push(skill);
  }

  const renderCard = (skill, prior, hasQuestions = false) => <div key={skill.skillId}
    className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
    <h4 className="text-sm font-semibold text-slate-900">{skill.skillName || 'Kỹ năng chưa có tên'}</h4>
    <p className="mt-1 text-xs text-slate-500">{skill.domainName || 'Chưa có thông tin miền kiến thức'}</p>
    {hasQuestions && Number.isFinite(skill.totalQuestions) && skill.totalQuestions > 0 && <p className="mt-3 text-xs text-slate-600">
      Kết quả bài làm: <strong>{skill.correctCount}/{skill.totalQuestions} câu đúng</strong>
      {Number.isFinite(skill.accuracyPercentage) && ` · ${Math.round(skill.accuracyPercentage)}%`}
    </p>}
    <Mastery skill={prior} />
  </div>;

  return <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
    <div>
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Brain className="h-5 w-5 text-indigo-500" />Đánh giá năng lực ban đầu</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">Kết quả theo kỹ năng của bài kiểm tra này. Mức thành thạo là ước lượng của hệ thống, khác với tỷ lệ câu trả lời đúng và năng lực cập nhật sau quá trình học.</p>
    </div>
    {!priors.some(validPrior) && <p className="flex items-start gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />Chưa có dữ liệu mức thành thạo ước lượng cho bài này. Kết quả câu trả lời được hiển thị bên dưới nếu có.
    </p>}
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Kỹ năng có câu hỏi đánh giá</h4>
      {assessed.length ? <div className="space-y-3">{[...domains].map(([domain, skills]) => <details key={domain} className="rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">{domain} <span className="ml-2 text-xs font-normal text-slate-500">{skills.length} kỹ năng</span></summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{skills.map((skill) => renderCard(skill, skill.prior, true))}</div>
      </details>)}</div>
        : <p className="text-sm text-slate-500">Chưa có dữ liệu phân tích theo kỹ năng.</p>}
    </div>
    {inferred.length > 0 && <details className="rounded-2xl border border-indigo-100 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-indigo-800">Kỹ năng ước lượng gián tiếp ({inferred.length})</summary>
      <p className="mb-3 mt-2 text-xs leading-5 text-slate-500">Bài này chưa có câu hỏi đánh giá các kỹ năng dưới đây. Hệ thống ước lượng từ miền kiến thức liên quan để hỗ trợ khởi tạo lộ trình; đây không phải kết quả làm sai.</p>
      <div className="grid gap-3 sm:grid-cols-2">{inferred.map((skill) => renderCard(skill, skill))}</div>
    </details>}
    {unknown.length > 0 && <details className="rounded-2xl border border-slate-200 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">Ước lượng chưa xác định nguồn ({unknown.length})</summary>
      <p className="mb-3 mt-2 text-xs text-slate-500">Chưa đủ thông tin để phân loại là đánh giá qua bài làm hay ước lượng gián tiếp.</p>
      <div className="grid gap-3 sm:grid-cols-2">{unknown.map((skill) => renderCard(skill, skill))}</div>
    </details>}
  </section>;
}
