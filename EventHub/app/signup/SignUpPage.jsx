'use client';
import { useState } from "react";
import { apiRegisterAttendee } from "@/lip/api";
import { C, S } from "../../constants/styles";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/Input";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { SiApple } from "react-icons/si";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};


export default function SignUpPage({ setPage, setUserEmail }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    let newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Please enter your full name";
    if (!email.trim()) newErrors.email = "Please enter your email";
    if (!pass.trim()) newErrors.pass = "Please enter your password";
    if (!confirmPass.trim()) newErrors.confirmPass = "Please confirm your password";
    else if (pass !== confirmPass) newErrors.confirmPass = "Passwords do not match";
    if (!agreed) newErrors.agreed = "You must agree to the privacy & policy";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await apiRegisterAttendee(fullName.trim(), email.trim(), pass);
      setPage("login");
    } catch(err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
      else setErrors({ pass: msg || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative" }}>
      
      {/* CONTENT SIDE */}
      <div className="content-side" style={{ maxWidth: 380, width: "100%", position: "relative", zIndex: 2 }}>
          <div
            onClick={() => setPage("landing")}
            style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}
          >
            <HiOutlineArrowLeft size={24} />
          </div>

          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>
            Create Account
          </h1>

          <Input
            label="Full Name"
            placeholder="John Doe"
            type="text"
            value={fullName}
            onChange={(val) => { setFullName(val); setErrors({ ...errors, fullName: "" }); }}
            error={errors.fullName}
          />

          <Input
            label="Email"
            placeholder="example@gmail.com"
            type="email"
            value={email}
            onChange={(val) => { setEmail(val); setErrors({ ...errors, email: "" }); }}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="******"
            type="password"
            value={pass}
            onChange={(val) => { setPass(val); setErrors({ ...errors, pass: "" }); }}
            error={errors.pass}
          />

          <Input
            label="Confirm Password"
            placeholder="******"
            type="password"
            value={confirmPass}
            onChange={(val) => { setConfirmPass(val); setErrors({ ...errors, confirmPass: "" }); }}
            error={errors.confirmPass}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px", fontSize: 13 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setErrors({ ...errors, agreed: "" }); }}
              style={{ cursor: "pointer", accentColor: C.orange }}
            />
            <span style={{ color: C.gray, fontWeight: 400 }}>
              I agree with{" "}
              <span style={{ color: C.navy, fontWeight: 600, cursor: "pointer" }}>
                privacy &amp; policy
              </span>
            </span>
          </div>
          {errors.agreed && (
            <div style={{ fontSize: 12, color: "red", marginBottom: 8 }}>{errors.agreed}</div>
          )}
          <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginBottom: 12, lineHeight: 1.6 }}>
            By proceeding, you confirm that you have read and understood our terms. Your data is encrypted and never shared with third parties. We are committed to protecting your privacy in accordance with applicable data protection laws.
          </div>

          <button
            onClick={handleSignUp} disabled={loading}
            style={{
              width: "100%",
              height: 50,
              backgroundColor: loading ? "#d1d5db" : C.orange,
              border: "none",
              borderRadius: 30,
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              marginTop: 16,
              marginBottom: 25,
            }}
          >
            {loading ? "Creating…" : "Create Account"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 25,
              color: C.lightGray,
              fontSize: 13,
            }}
          >
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 25 }}>
            {/* Google */}
            <div
              onClick={() => window.open("https://accounts.google.com/signin", "_blank")}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >
              <FcGoogle size={28} />
            </div>

            {/* Facebook */}
            <div
              onClick={() => window.open("https://www.facebook.com/login", "_blank")}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#1877f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >
              <FaFacebookF size={24} />
            </div>

            {/* Apple */}
            <div
              onClick={() => alert("Apple login not implemented")}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >
              <SiApple size={24} />
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 14, color: C.gray, fontWeight: 400 }}>
            Already have an account?{" "}
            <span
              onClick={() => setPage("login")}
              style={{ color: C.navy, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
            >
              Log in
            </span>
          </div>
        </div>

      {/* ILLUSTRATION SIDE */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "40px", overflow: 'hidden' }}>
        <img src="/img/signup.png" alt="Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 992px) {
          .signup-container {
            flex-direction: column !important;
            padding: 40px 24px !important;
            justify-content: center !important;
            overflow: hidden;
          }
          .illustration-container {
            position: absolute !important;
            top: 0; left: 0;
            width: 100% !important;
            height: 100% !important;
            margin-left: 0 !important;
            z-index: 1 !important;
            opacity: 0.08 !important;
            pointer-events: none;
          }
          .content-side {
            max-width: 340px !important;
          }
          .title-responsive {
            font-size: 28px !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          img[alt="Signup Illustration"] {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
        }

        @media (min-width: 993px) {
           .signup-container {
             justify-content: space-between !important;
             padding: 60px 100px !important;
           }
           .content-side {
             max-width: 420px !important;
           }
           .title-responsive {
             font-size: 40px !important;
           }
        }
      `}</style>
    </div>
  );
}
