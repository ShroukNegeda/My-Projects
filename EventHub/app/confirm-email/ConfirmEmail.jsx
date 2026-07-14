'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../../constants/styles";
import AuthLayout from "../../components/AuthLayout";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FaEnvelope, FaRedo, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { apiVerifyOtp, apiResetPassword } from "@/lip/api";

export default function ConfirmEmail({ setPage, userEmail = "" }) {
  const [email, setEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [step, setStep] = useState("otp");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  // OTP refs auto-focus
  const otpRefs = useRef([]);

  // ✅ Initialize email
  useEffect(() => {
    console.log('🔍 ConfirmEmail Debug:', {
      userEmail,
      storedEmail: typeof window !== 'undefined' ? localStorage.getItem('eh_reset_email') : null
    });
    
    if (typeof window === 'undefined') {
      setEmail(userEmail);
      return;
    }
    
    const storedEmail = localStorage.getItem('eh_reset_email');
    const emailToUse = storedEmail || userEmail || "";
    
    if (emailToUse) {
      setEmail(emailToUse);
      // Focus OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 500);
    } else {
      setOtpError("No email found. Please go back.");
    }
  }, [userEmail]);

  // OTP handlers - 4 digits
  const handleOtpChange = useCallback((index, value) => {
    const num = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = otp.split('');
    newOtp[index] = num;
    const newOtpStr = newOtp.join('');
    
    setOtp(newOtpStr);
    setOtpError("");
    
    // Auto-focus next
    if (num && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const numbers = paste.replace(/\D/g, '').slice(0, 4);
    setOtp(numbers);
    setOtpError("");
    
    setTimeout(() => {
      if (numbers.length > 0 && otpRefs.current[numbers.length - 1]) {
        otpRefs.current[numbers.length - 1].focus();
      }
    }, 10);
  }, []);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = async () => {
    if (!email.trim()) {
      setOtpError("Email is required");
      return;
    }
    
    if (otp.length !== 4) {
      setOtpError("Please enter 4-digit OTP");
      return;
    }

    setVerifying(true);
    setOtpError("");

    try {
      console.log('🔍 Verifying OTP:', { email: email.trim(), otp });
      
      await apiVerifyOtp(email.trim(), otp);
      
      setVerifiedOtp(otp);
      setStep("reset");
      
    } catch (error) {
      console.error('❌ Verify OTP Error:', error.message);
      setOtpError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = async () => {
    if (!newPass.trim()) {
      setPassError("Please enter a new password");
      return;
    }
    if (newPass.length < 8) {
      setPassError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Za-z]/.test(newPass) || !/[0-9]/.test(newPass)) {
      setPassError("Password must contain letters and numbers");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Passwords do not match");
      return;
    }
    if (!verifiedOtp) {
      setPassError("OTP not verified");
      return;
    }

    setResetting(true);
    setPassError("");

    try {
      console.log('🔍 Resetting:', { email: email.trim(), code: verifiedOtp });
      await apiResetPassword(email.trim(), verifiedOtp, newPass);
      
      setDone(true);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('eh_reset_email');
      }
      
      setTimeout(() => setPage?.("login"), 2000);
      
    } catch (error) {
      console.error('❌ Reset Error:', error.message);
      setPassError(error.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const handleResendOtp = () => setPage("forgot-password");
  const handleBack = () => {
    if (step === "reset") {
      setStep("otp");
      setVerifiedOtp("");
      setOtp("");
      setNewPass("");
      setConfirmPass("");
      setPassError("");
    } else {
      setPage?.("forgot-password");
    }
  };

  return (
    <AuthLayout
      left={
        <div style={{ 
          width: "100%", 
          maxWidth: 380, 
          fontFamily: "Poppins, sans-serif", 
          padding: 20, 
          boxSizing: "border-box" 
        }}>
          <div 
            onClick={handleBack}
            style={{ 
              cursor: "pointer", 
              marginBottom: 24, 
              color: C.navy,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <HiOutlineArrowLeft size={24} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Back</span>
          </div>

          {done ? (
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                background: "#ecfdf5", 
                border: "4px solid #10b981", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 24px" 
              }}>
                <span style={{ fontSize: 36, color: '#10b981', fontWeight: 'bold' }}>✓</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: C.navy, marginBottom: 12 }}>
                Password Reset!
              </h2>
              <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.6 }}>
                You can now login with your new password
              </p>
            </div>
          ) : step === "otp" ? (
            <>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 20, 
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: 24,
                boxShadow: '0 8px 25px rgba(251, 191, 36, 0.2)'
              }}>
                <FaEnvelope color={C.orange} size={28} />
              </div>
              
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: C.navy }}>
                Enter 4-digit Code
              </h1>
              <p style={{ 
                fontSize: 15, 
                color: C.gray, 
                marginBottom: 36, 
                lineHeight: 1.6,
                textAlign: 'center'
              }}>
                We sent code to <strong style={{ color: C.navy }}>{email}</strong>
              </p>

              {/* 4 OTP inputs */}
              <div style={{ 
                display: 'flex', 
                gap: 16, 
                justifyContent: 'center', 
                marginBottom: otpError ? 16 : 32 
              }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <input
                    key={i}
                    ref={el => { if (el) otpRefs.current[i] = el; }}
                    value={otp[i] || ''}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onPaste={handleOtpPaste}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={verifying}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      border: `2px solid ${otpError ? '#ef4444' : verifying ? '#d1d5db' : C.border}`,
                      background: otp[i] ? '#fef3c7' : verifying ? '#f9fafb' : 'white',
                      fontSize: 24,
                      fontWeight: 700,
                      textAlign: 'center',
                      color: C.navy,
                      outline: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.2s',
                      cursor: verifying ? 'not-allowed' : 'pointer'
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <div style={{ fontSize: 12, color: "#ef4444", textAlign: 'center', marginBottom: 20, fontWeight: 500 }}>
                  {otpError}
                </div>
              )}

              <button 
                onClick={handleVerifyOtp} 
                disabled={verifying || otp.length !== 4}
                style={{ 
                  width: "100%", 
                  height: 50, 
                  backgroundColor: verifying || otp.length !== 4 ? "#d1d5db" : C.orange, 
                  border: "none", 
                  borderRadius: 30, 
                  color: "#fff", 
                  fontSize: 16, 
                  fontWeight: 600, 
                  cursor: verifying ? "wait" : "pointer", 
                  marginBottom: 20,
                  transition: 'all 0.2s'
                }}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>

              <div style={{ textAlign: "center", fontSize: 13, color: C.gray }}>
                Didn't receive code?{' '}
                <span onClick={handleResendOtp} style={{ color: C.navy, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                  <FaRedo size={11} style={{ marginRight: 4, display: 'inline' }} /> Resend
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 16, 
                background: "#e0f2fe", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: 20 
              }}>
                <FaLock color="#0ea5e9" size={24} />
              </div>
              
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: C.navy }}>
                Create New Password
              </h1>
              
              <p style={{ fontSize: 14, color: C.gray, marginBottom: 24, lineHeight: 1.7 }}>
                OTP verified! Now enter your new password below.
              </p>

              <label style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: C.navy, 
                display: "block", 
                marginBottom: 6 
              }}>
                New Password
              </label>
              
              <div style={{ position: "relative", marginBottom: 16 }}>
                <input 
                  type={showPass ? "text" : "password"} 
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                    setPassError("");
                  }}
                  placeholder="Minimum 8 characters"
                  disabled={resetting}
                  style={{ 
                    width: "100%", 
                    height: 48, 
                    padding: "0 44px 0 14px", 
                    border: `2px solid ${passError ? "#ef4444" : C.border}`, 
                    borderRadius: 12, 
                    fontSize: 14, 
                    fontFamily: "Poppins, sans-serif", 
                    outline: "none", 
                    boxSizing: "border-box", 
                    color: C.navy,
                    backgroundColor: resetting ? '#f9fafb' : 'white'
                  }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(p => !p)}
                  disabled={resetting}
                  style={{ 
                    position: "absolute", 
                    right: 14, 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    background: "none", 
                    border: "none", 
                    cursor: resetting ? "not-allowed" : "pointer", 
                    color: C.gray 
                  }}
                >
                  {showPass ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
                </button>
              </div>

              <label style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: C.navy, 
                display: "block", 
                marginBottom: 6 
              }}>
                Confirm Password
              </label>
              
              <input 
                type="password" 
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  setPassError("");
                }}
                placeholder="Repeat new password"
                disabled={resetting}
                style={{ 
                  width: "100%", 
                  height: 48, 
                  padding: "0 14px", 
                  border: `2px solid ${passError ? "#ef4444" : C.border}`, 
                  borderRadius: 12, 
                  fontSize: 14, 
                  fontFamily: "Poppins, sans-serif", 
                  outline: "none", 
                  boxSizing: "border-box", 
                  color: C.navy, 
                  marginBottom: 4,
                  backgroundColor: resetting ? '#f9fafb' : 'white'
                }} 
              />
              
              {passError && (
                <div style={{ 
                  fontSize: 12, 
                  color: "#ef4444", 
                  marginBottom: 8,
                  fontWeight: 500
                }}>
                  {passError}
                </div>
              )}

              <button 
                onClick={handleReset} 
                disabled={resetting || !newPass || !confirmPass}
                style={{ 
                  width: "100%", 
                  height: 50, 
                  marginTop: 16, 
                  backgroundColor: resetting || !newPass || !confirmPass ? "#d1d5db" : C.orange, 
                  border: "none", 
                  borderRadius: 30, 
                  color: "#fff", 
                  fontSize: 16, 
                  fontWeight: 600, 
                  cursor: resetting ? "wait" : "pointer",
                  transition: 'all 0.2s'
                }}
              >
                {resetting ? "Resetting Password..." : "Reset Password"}
              </button>
            </>
          )}
        </div>
      }
      right={
        <div style={{ 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 40 
        }}>
          <div style={{ textAlign: "center", maxWidth: 320 }}>
            <svg width="260" height="200" viewBox="0 0 260 200">
              <ellipse cx="130" cy="180" rx="100" ry="12" fill="#d1d9f0" opacity="0.4"/>
              <rect x="40" y="50" width="180" height="120" rx="12" fill="#c7d2f5" opacity="0.5"/>
              <rect x="50" y="60" width="160" height="100" rx="8" fill="white" opacity="0.8"/>
              <rect x="70" y="90" width="120" height="8" rx="4" fill="#1a1f5e" opacity="0.12"/>
              <rect x="70" y="106" width="80" height="8" rx="4" fill="#1a1f5e" opacity="0.08"/>
              <circle cx="200" cy="46" r="20" fill="#f5821f" opacity="0.85"/>
              <text x="194" y="52" fontSize="16" fill="white" fontWeight="bold">✓</text>
            </svg>
            <h2 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: "#1a1f5e", 
              marginTop: 10, 
              marginBottom: 8 
            }}>
              {step === "otp" ? "Enter your OTP" : "Set New Password"}
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
              {step === "otp"
                ? "Enter the 4-digit code from your email."
                : "Create a strong password (8+ chars, letters + numbers)."}
            </p>
          </div>
        </div>
      }
    />
  );
}