import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { SI_PREFIXES } from '../../data/referenceFormulasData';

const UNIT_GROUPS = {
  length: {
    label: 'Độ dài',
    units: {
      km: { label: 'km', toBase: 1e3 },
      m: { label: 'm (SI)', toBase: 1 },
      dm: { label: 'dm', toBase: 1e-1 },
      cm: { label: 'cm', toBase: 1e-2 },
      mm: { label: 'mm', toBase: 1e-3 },
      um: { label: 'µm', toBase: 1e-6 },
      nm: { label: 'nm', toBase: 1e-9 },
      angstrom: { label: 'Å (Angstrom)', toBase: 1e-10 }
    },
    defaultFrom: 'cm',
    defaultTo: 'm'
  },
  mass: {
    label: 'Khối lượng',
    units: {
      ton: { label: 'Tấn', toBase: 1e3 },
      kg: { label: 'kg (SI)', toBase: 1 },
      g: { label: 'g', toBase: 1e-3 },
      mg: { label: 'mg', toBase: 1e-6 },
      u: { label: 'u (đvC)', toBase: 1.66055e-27 }
    },
    defaultFrom: 'g',
    defaultTo: 'kg'
  },
  time: {
    label: 'Thời gian',
    units: {
      h: { label: 'Giờ (h)', toBase: 3600 },
      min: { label: 'Phút (min)', toBase: 60 },
      s: { label: 'Giây (s — SI)', toBase: 1 },
      ms: { label: 'ms', toBase: 1e-3 },
      us: { label: 'µs', toBase: 1e-6 },
      ns: { label: 'ns', toBase: 1e-9 }
    },
    defaultFrom: 'min',
    defaultTo: 's'
  },
  speed: {
    label: 'Vận tốc',
    units: {
      ms: { label: 'm/s (SI)', toBase: 1 },
      kmh: { label: 'km/h', toBase: 1 / 3.6 },
      cms: { label: 'cm/s', toBase: 0.01 }
    },
    defaultFrom: 'kmh',
    defaultTo: 'ms'
  },
  energy: {
    label: 'Năng lượng',
    units: {
      J: { label: 'J (SI)', toBase: 1 },
      kJ: { label: 'kJ', toBase: 1e3 },
      cal: { label: 'cal', toBase: 4.184 },
      kcal: { label: 'kcal', toBase: 4184 },
      eV: { label: 'eV', toBase: 1.60218e-19 },
      MeV: { label: 'MeV', toBase: 1.60218e-13 },
      kWh: { label: 'kWh', toBase: 3.6e6 }
    },
    defaultFrom: 'eV',
    defaultTo: 'J'
  },
  pressure: {
    label: 'Áp suất',
    units: {
      Pa: { label: 'Pa (N/m²)', toBase: 1 },
      kPa: { label: 'kPa', toBase: 1e3 },
      atm: { label: 'atm', toBase: 101325 },
      bar: { label: 'bar', toBase: 1e5 },
      mmHg: { label: 'mmHg (Torr)', toBase: 133.322 }
    },
    defaultFrom: 'atm',
    defaultTo: 'Pa'
  },
  angle: {
    label: 'Góc (Độ ↔ Rad)',
    units: {
      deg: { label: 'Độ (°)', toBase: Math.PI / 180 },
      rad: { label: 'Radian (rad)', toBase: 1 }
    },
    defaultFrom: 'deg',
    defaultTo: 'rad'
  },
  temp: {
    label: 'Nhiệt độ',
    custom: true,
    units: {
      C: { label: '°C (Celsius)' },
      K: { label: 'K (Kelvin — SI)' },
      F: { label: '°F (Fahrenheit)' }
    },
    defaultFrom: 'C',
    defaultTo: 'K'
  }
};

const QUICK_CONVERSIONS = [
  '1 km/h = 1/3,6 m/s  (m/s → km/h nhân 3,6)',
  '1 atm = 760 mmHg = 101.325 Pa ≈ 1,013 bar',
  '1 bar = 10⁵ Pa   |   1 L = 1 dm³ = 10⁻³ m³',
  '1 eV = 1,6 × 10⁻¹⁹ J   |   1 MeV = 1,6 × 10⁻¹³ J',
  '1 cal = 4,184 J   |   1 kWh = 3,6 × 10⁶ J',
  '1 Å = 10⁻¹⁰ m = 0,1 nm   |   T(K) = t(°C) + 273,15'
];

function convertValue(groupKey, valStr, fromKey, toKey) {
  const num = parseFloat(valStr);
  if (Number.isNaN(num)) return '—';

  if (groupKey === 'temp') {
    let c = num;
    if (fromKey === 'K') c = num - 273.15;
    else if (fromKey === 'F') c = ((num - 32) * 5) / 9;

    let out = c;
    if (toKey === 'K') out = c + 273.15;
    else if (toKey === 'F') out = (c * 9) / 5 + 32;
    return Number(out.toPrecision(6)).toString();
  }

  const grp = UNIT_GROUPS[groupKey];
  const f = grp.units[fromKey]?.toBase;
  const t = grp.units[toKey]?.toBase;
  if (!f || !t) return '—';
  const res = (num * f) / t;
  if (Math.abs(res) !== 0 && (Math.abs(res) < 1e-4 || Math.abs(res) >= 1e7)) {
    return res.toExponential(4);
  }
  return Number(res.toPrecision(6)).toString();
}

export default function UnitConverterPanel() {
  const [groupKey, setGroupKey] = useState('length');
  const [fromUnit, setFromUnit] = useState('cm');
  const [toUnit, setToUnit] = useState('m');
  const [inputVal, setInputVal] = useState('100');

  const activeGroup = UNIT_GROUPS[groupKey];
  const result = convertValue(groupKey, inputVal, fromUnit, toUnit);

  const handleGroupChange = (nextKey) => {
    setGroupKey(nextKey);
    setFromUnit(UNIT_GROUPS[nextKey].defaultFrom);
    setToUnit(UNIT_GROUPS[nextKey].defaultTo);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Công cụ Quy đổi Đơn vị Chuẩn (Hệ SI)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Đổi nhanh 8 đại lượng Toán · Lý · Hóa chính xác tuyệt đối.</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(UNIT_GROUPS).map(([k, g]) => (
            <button
              key={k}
              type="button"
              onClick={() => handleGroupChange(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                groupKey === k
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-end">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">Giá trị nguồn</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                {Object.entries(activeGroup.units).map(([uKey, uObj]) => (
                  <option key={uKey} value={uKey}>{uObj.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            title="Đảo chiều đơn vị"
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 cursor-pointer self-center sm:mb-0.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">Kết quả quy đổi</label>
            <div className="flex gap-1.5">
              <div className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 text-sm font-extrabold text-indigo-900 truncate">
                {result}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                {Object.entries(activeGroup.units).map(([uKey, uObj]) => (
                  <option key={uKey} value={uKey}>{uObj.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* SI Prefixes */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
          Bảng tiếp đầu ngữ Hệ SI (Ước số &amp; Bội số)
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {SI_PREFIXES.map((p) => (
            <div key={p.sym} className="rounded-lg bg-slate-50 border border-slate-200/70 px-2 py-1.5 text-center">
              <div className="text-xs font-extrabold text-slate-800">
                {p.sym} <span className="font-normal text-slate-400">({p.prefix})</span>
              </div>
              <div className="text-xs font-bold text-indigo-600">{p.factor}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Cheat Conversions */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
          Quy đổi nhanh hay gặp trong đề thi
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
          {QUICK_CONVERSIONS.map((line) => (
            <div key={line} className="pl-2.5 border-l-2 border-indigo-300 py-0.5 font-medium">
              {line}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
