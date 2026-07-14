'use client';
import { S, C } from "../constants/styles";

export default function Input({ label, error, onChange, value, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={S.label}>{label}</label>

      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...S.input,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: error ? "1px solid red" : `1px solid ${C.border}`,
        }}
      />

      {error && (
        <div
          style={{
            color: "red",
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}