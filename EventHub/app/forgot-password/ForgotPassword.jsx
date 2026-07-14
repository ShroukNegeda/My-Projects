'use client';
import { useState } from "react";
import { C } from "../../constants/styles";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/Input";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { apiForgotPassword } from "@/lip/api";

export default function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { 
      setError("Please enter your email address"); 
      return; 
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address"); 
      return; 
    }
    
    setError("");
    setLoading(true);

    try {
      console.log('🔍 Sending OTP to:', email.trim());
      await apiForgotPassword(email.trim());
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('eh_reset_email', email.trim());
        console.log('✅ Saved to localStorage:', email.trim());
      }
      
      setSent(true);
      
      setTimeout(() => {
        setPage("confirm-email");
      }, 1500);
      
    } catch(err) {
      console.error('❌ ForgotPassword Error:', err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden" }}>
      
      {/* CONTENT SIDE */}
      <div className="content-side" style={{ maxWidth: 380, width: "100%", position: "relative", zIndex: 10 }}>
          <div 
            onClick={() => setPage("login")} 
            style={{ 
              cursor: "pointer", 
              marginBottom: 20, 
              color:C.navy,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <HiOutlineArrowLeft size={24} />
            <span style={{ fontSize: 14 }}>Back to Login</span>
          </div>

          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius:16, 
            background:"#fff0e6", 
            display: "flex", 
            alignItems:"center", 
            justifyContent:"center", 
            marginBottom:20 
          }}>
            <FaEnvelope color={C.orange} size={24} />
          </div>

          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, color: C.navy }}>
            Forgot Password?
          </h1>
          <p style={{ fontSize:14, color:C.gray, marginBottom:30, lineHeight:1.7 }}>
            Enter your email and we'll send you a <strong>4-digit verification code</strong>.
          </p>

          <Input 
            label="Email Address" 
            placeholder="example@gmail.com" 
            type="email"
            value={email} 
            onChange={val => { 
              setEmail(val); 
              setError(""); 
            }} 
            error={error} 
          />

          <button 
            onClick={handleSend} 
            disabled={sent || loading}
            style={{ 
              width:"100%", 
              height:50, 
              backgroundColor: sent ? "#10b981" : loading ? "#d1d5db" : C.orange,
              border:"none", 
              borderRadius:30, 
              color:"#fff", 
              fontSize:16, 
              fontWeight:600,
              cursor: sent || loading ? "default" : "pointer", 
              marginBottom:25,
              display:"flex", 
              alignItems:"center", 
              justifyContent:"center", 
              gap:8, 
              transition:"all .3s"
            }}
          >
            {sent ? (
              <>✓ Code Sent to {email.slice(0, 8)}...!</>
            ) : loading ? (
              "Sending…"
            ) : (
              <>
                <FaPaperPlane size={14} /> Send Verification Code
              </>
            )}
          </button>

          <div style={{ textAlign:"center", fontSize:14, color:C.gray }}>
            Remember your password?{" "}
            <span 
              onClick={() => setPage("login")} 
              style={{ 
                color:C.navy, 
                fontWeight:600, 
                cursor:"pointer", 
                textDecoration:"underline" 
              }}
            >
              Log In
            </span>
          </div>
        </div>

      {/* ILLUSTRATION SIDE */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "40px", overflow: 'hidden' }}>
        <img src="/img/login.png" alt="Forgot Password Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 992px) {
          .forgot-container { 
            flex-direction: column !important; 
            padding: 40px 24px !important; 
            justify-content: center !important; 
            overflow: hidden; 
          }
          .illustration-container { 
            position: absolute !important; 
            inset: 0 !important; 
            width: 100% !important; 
            height: 100% !important; 
            margin-left: 0 !important; 
            z-index: 1 !important; 
            opacity: 0.12 !important; 
            pointer-events: none; 
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; }
          .content-side p { text-align: center !important; margin-bottom: 24px !important; }
          img[alt="Forgot Password Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .forgot-container { justify-content: space-between !important; padding: 60px 100px !important; }
           .content-side { max-width: 420px !important; }
           .title-responsive { font-size: 40px !important; }
        }
      `}</style>
    </div>
  );
}