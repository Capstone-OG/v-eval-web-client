import { GraduationCap, Users } from 'lucide-react';

export default function RegistrationRoleSwitch({ role, onChange, dark = false, disabled = false }) {
  return (
    <div role="group" aria-label="Loại tài khoản đăng ký"
      className={`relative isolate grid grid-cols-2 rounded-2xl border p-1 text-xs font-bold ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
      <div aria-hidden="true" className={`absolute inset-1 grid grid-cols-2 pointer-events-none transition-transform duration-300 ease-out motion-reduce:transition-none ${role === 'parent' ? 'translate-x-1/2' : 'translate-x-0'}`}>
        <div className={`rounded-xl shadow-sm ${dark ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-white'}`} />
      </div>
      {[{ value: 'student', label: 'Học sinh', Icon: GraduationCap }, { value: 'parent', label: 'Phụ huynh', Icon: Users }].map(({ value, label, Icon }) => (
        <button key={value} type="button" aria-pressed={role === value} disabled={disabled}
          onClick={() => onChange(value)}
          className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 transition-colors duration-200 motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-wait ${
            role === value ? (dark ? 'text-white' : 'text-blue-700') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
          }`}>
          <Icon className="w-3.5 h-3.5" />{label}
        </button>
      ))}
    </div>
  );
}
