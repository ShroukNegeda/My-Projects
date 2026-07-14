'use client';
import { useState, useEffect } from "react";
import { C } from "../../constants/styles";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FaShieldAlt } from "react-icons/fa";

export default function ConfirmEmailPage({ setPage }) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let t;
    if (timer > 0) t = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const handleChange = (val, idx) => {
    if (isNaN(val)) return;
    const newCode = [...code];
    newCode[idx] = val.slice(-1);
    setCode(newCode);

    // Auto focus next box
    if (val && idx < 3) {
      const next = document.getElementById(`code-${idx + 1}`);
      next?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length < 4) {
      setError("Please enter the full code");
      return;
    }
    setLoading(true);
    // Simulate API check
    setTimeout(() => {
      setLoading(false);
      setPage("reset-password");
    }, 1500);
  };

  return (
    <div className="confirm-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden" }}>
      
      {/* ILLUSTRATION SIDE - Moved up */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "40px", overflow: 'hidden' }}>
        <img src="/img/login.png" alt="Verify Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>
      
      {/* CONTENT SIDE */}
      <div className="content-side" style={{ maxWidth: 380, width: "100%", position: "relative", zIndex: 10 }}>
          <div 
            onClick={() => setPage("forgot-password")} 
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
            <span style={{ fontSize: 14 }}>Back</span>
          </div>

          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 16, 
            background: "#fff0e6", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: 20 
          }}>
            <FaShieldAlt color={C.orange} size={24} />
          </div>
          
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: C.navy }}>
            Verify Email
          </h1>
          <p style={{ fontSize: 14, color: C.gray, marginBottom: 30, lineHeight: 1.6 }}>
            Please enter the 4-digit code sent to your email address.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
            {code.map((num, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                maxLength={1}
                value={num}
                onChange={(e) => handleChange(e.target.value, i)}
                style={{
                  width: 65, height: 65, borderRadius: 14,
                  border: `2px solid ${error ? "#ef4444" : C.border}`,
                  textAlign: "center", fontSize: 24, fontWeight: 700,
                  color: C.navy, outline: "none", transition: "all 0.2s",
                  background: "#fff"
                }}
                onFocus={(e) => e.target.style.borderColor = C.navy}
                onBlur={(e) => e.target.style.borderColor = error ? "#ef4444" : C.border}
              />
            ))}
          </div>

          {error && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 16 }}>{error}</div>}

          <button 
            onClick={handleVerify} 
            disabled={loading}
            style={{ 
              width: "100%", height: 52, backgroundColor: loading ? "#d1d5db" : C.orange,
              border: "none", borderRadius: 30, color: "#fff", fontSize: 16, fontWeight: 600,
              cursor: loading ? "wait" : "pointer", marginTop: 10, boxShadow: "0 8px 20px rgba(255,140,0,0.2)"
            }}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: C.gray }}>
            Didn't receive the code? {" "}
            {timer > 0 ? (
              <span style={{ color: C.navy, fontWeight: 700 }}>Resend in {timer}s</span>
            ) : (
              <span onClick={() => setTimer(60)} style={{ color: C.orange, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Resend Code</span>
            )}
          </div>
        </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 992px) {
          .confirm-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
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
          .content-side p { text-align: center !important; margin-bottom: 24px !important; }
          img[alt="Verify Illustration"] { width: 100% !important; height: 100% !important; object-fit: cover !important; }
          input[id^="code-"] { width: 55px !important; height: 55px !important; font-size: 20px !important; }
        }
        @media (min-width: 993px) {
           .confirm-container { justify-content: space-between !important; padding: 60px 100px !important; }
           .content-side { max-width: 420px !important; }
           .title-responsive { font-size: 40px !important; }
        }
      `}</style>
    </div>
  );
}