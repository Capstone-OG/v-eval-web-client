import { useId, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from '@daypicker/react';
import { vi } from '@daypicker/react/locale/vi';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { parseCalendarDate, serializeCalendarDate } from '../../utils/calendarDate';
import '@daypicker/react/style.css';
import './DatePicker.css';

export default function DatePicker({ id, value, onChange, label = 'Chọn ngày', disabled = false }) {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const selected = parseCalendarDate(value);
  const choose = (date) => {
    onChange(serializeCalendarDate(date));
    setOpen(false);
  };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button id={id} type="button" disabled={disabled} aria-label={`${label}: ${selected ? selected.toLocaleDateString('vi-VN') : 'Chưa chọn'}`}
          className="w-full flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:opacity-50 cursor-pointer">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span className={`flex-1 text-left ${selected ? '' : 'text-slate-400'}`}>
            {selected ? selected.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chọn ngày thi dự kiến'}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={8} collisionPadding={12} aria-labelledby={headingId}
          className="veval-date-popover z-[100] w-fit max-w-[calc(100vw-24px)] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 bg-blue-50/60 px-4 py-3">
            <p id={headingId} className="text-xs font-extrabold text-slate-800">{label}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Chọn ngày phù hợp với kế hoạch ôn tập</p>
          </div>
          <DayPicker mode="single" selected={selected} onSelect={choose} defaultMonth={selected}
            locale={vi} weekStartsOn={1} showOutsideDays fixedWeeks autoFocus
            captionLayout="dropdown" navLayout="around"
            startMonth={new Date(Math.min(new Date().getFullYear() - 1, selected?.getFullYear() ?? Infinity), 0)}
            endMonth={new Date(Math.max(new Date().getFullYear() + 10, selected?.getFullYear() ?? 0), 11)}
            className="veval-calendar p-3" />
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
            <button type="button" onClick={() => choose(undefined)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer">Xóa ngày</button>
            <button type="button" onClick={() => choose(new Date())} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 cursor-pointer">Hôm nay</button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
