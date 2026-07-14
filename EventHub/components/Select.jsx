'use client';
import { S } from "../constants/styles";

export default function Select({ label, options, value, onChange }) {
  return (
    <div style={S.inputWrap}>
      {label && <label style={S.label}>{label}</label>}
      <select
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          ...S.input,
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        <option value="">Value</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
