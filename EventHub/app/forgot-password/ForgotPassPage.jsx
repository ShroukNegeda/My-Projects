'use client';
import { useState } from "react";
import { C } from "../../constants/styles";
import Input from "../../components/Input";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FaPaperPlane } from "react-icons/fa";

export default function ForgotPassPage({ setPage }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    
    // Simulate recovery email API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="forgot-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden" }}>
      
      {/* ILLUSTRATION SIDE - Moved up to be behind in DOM flow */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "40px", overflow: 'hidden' }}>
        <img src="/img/login.png" alt="Forgot Password Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>
      
      {/* CONTENT SIDE */}
      <div className="content-side" style={{ maxWidth: 380, width: "100%", position: "relative", zIndex: 10 }}>
          <div 
            onClick={() => setPage("login")} 
            style={{ 
              cursor: "pointer", 
              marginBottom: 20, 
              color: C.navy,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <HiOutlineArrowLeft size={24} />
            <span style={{ fontSize: 14 }}>Back to Login</span>
          </div>
          
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: C.navy }}>
            Forgot Password?
          </h1>
          <p style={{ fontSize: 14, color: C.gray, marginBottom: 30 }}>
            Enter your email and we'll send you a link to reset your password.
          </p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', background: '#ecfdf5', borderRadius: 16, border: '1px solid #10b981' }}>
              <FaPaperPlane size={44} color="#10b981" style={{ marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#064e3b', marginBottom: 8 }}>Check your email</div>
              <p style={{ fontSize: 13, color: '#065f46', lineHeight: 1.5 }}> We've sent a password recovery link to your inbox. </p>
              <button onClick={() => setPage("login")} style={{ marginTop: 20, background: 'none', border: 'none', color: C.navy, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
            </div>
          ) : (
            <>
              <Input 
                label="Email Address" 
                placeholder="Example@gmail.com"
                type="email" 
                value={email} 
                onChange={(val) => { setEmail(val); setError(""); }} 
                error={error}
              />

              <button 
                onClick={handleReset} 
                disabled={loading}
                style={{ width: "100%", height: 50, backgroundColor: loading ? "#d1d5db" : C.orange, border: "none", borderRadius: 30, color: "#fff", fontSize: 16, fontWeight: 600, cursor: loading ? "wait" : "pointer", marginTop: 10, transition: 'all 0.2s' }}
              >
                {loading ? "Sending Link..." : "Reset Password"}
              </button>
            </>
          )}
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
            opacity: 0.08 !important; 
            pointer-events: none !important; 
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .content-side { 
            max-width: 340px !important; 
            position: relative !important; 
            z-index: 10 !important; 
          }
          .title-responsive { font-size: 28px !important; text-align: center !important; }
          .content-side p { text-align: center !important; margin-bottom: 24px !important; font-size: 13px !important; }
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