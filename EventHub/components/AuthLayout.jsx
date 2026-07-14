'use client';
import { S } from "../constants/styles";

export default function AuthLayout({ left, right }) {
  return (
    <div style={S.authWrap}>
      <div style={S.authLeft}>{left}</div>
      <div style={S.authRight}>{right}</div>
    </div>
  );
}