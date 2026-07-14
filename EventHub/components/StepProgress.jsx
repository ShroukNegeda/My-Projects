'use client';
import { S } from "../constants/styles";

export default function StepProgress({ step, total = 3 }) {
  return (
    <div style={S.stepBar}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={S.stepDot(i <= step)} />
      ))}
    </div>
  );
}
