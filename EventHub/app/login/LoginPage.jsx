'use client';
import { useState } from "react";
import { apiLogin } from "@/lip/api";
import { C } from "../../constants/styles";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/Input";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { SiApple } from "react-icons/si";

const safeLS =
  typeof window !== "undefined"
    ? localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };

function normalizeRole(input) {
  if (input == null || input === "") return "User";
  if (typeof input === "object" && input !== null) {
    if (typeof input.name === "string") return normalizeRole(input.name);
    if (typeof input.slug === "string")
      return normalizeRole(input.slug.replace(/-/g, " "));
    return "User";
  }
  if (typeof input !== "string") return "User";
  const r = input.trim().toLowerCase().replace(/[\s_-]+/g, " ");
  if (r === "attendee" || r === "member") return "User";
  if (r === "organizer" || r === "organisers" || /\borgani[sz]er\b/.test(r))
    return "Organizer";
  if (r === "speaker" || /\bspeaker\b/.test(r)) return "Speaker";
  if (r === "sponsor" || r === "sponser") return "Sponsor";
  if (r === "admin" || r === "administrator" || r === "super_admin")
    return "Admin";
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function pickAuthPayload(json) {
  if (!json || typeof json !== "object") return json;
  if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) {
    return json.data;
  }
  if (
    json.message &&
    typeof json.message === "object" &&
    !Array.isArray(json.message) &&
    (json.message.user ||
      json.message.token ||
      json.message.access_token ||
      json.message.data)
  ) {
    return json.message;
  }
  return json;
}

function extractLoginUser(payload) {
  if (!payload || typeof payload !== "object") return {};
  if (payload.user && typeof payload.user === "object") return payload.user;
  if (payload.email || payload.id || payload.name) return payload;
  return {};
}

function resolveRawLoginRole(user, payload) {
  const candidates = [
    typeof user?.role === "object" && user.role?.name,
    typeof user?.role === "object" && user.role?.slug,
    typeof user?.role === "string" && user.role,
    user?.role_name,
    user?.user_type,
    user?.type,
    user?.account_type,
    Array.isArray(user?.roles) && user.roles[0]?.name,
    Array.isArray(user?.roles) && user.roles[0]?.slug,
    typeof user?.roles?.[0] === "string" && user.roles[0],
    typeof payload?.role === "object" && payload.role?.name,
    typeof payload?.role === "object" && payload.role?.slug,
    typeof payload?.role === "string" && payload.role,
  ];
  for (const c of candidates) {
    if (c == null) continue;
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

function roleFromJwt(token) {
  if (!token || typeof token !== "string" || token.split(".").length !== 3)
    return null;
  try {
    const mid = token.split(".")[1];
    const dec = JSON.parse(
      atob(mid.replace(/-/g, "+").replace(/_/g, "/")),
    );
    const r =
      dec.role ||
      dec.user_role ||
      (Array.isArray(dec.roles) && dec.roles[0]) ||
      (typeof dec.user === "object" && dec.user?.role);
    if (typeof r === "string") return r;
    if (typeof r === "object" && r?.name) return r.name;
    if (typeof r === "object" && r?.slug) return r.slug.replace(/-/g, " ");
    return null;
  } catch {
    return null;
  }
}

function getAdminDecisionByEmail(email) {
  if (!email || typeof window === "undefined") return null;
  try {
    const raw = safeLS.getItem("eh_admin_registration_decisions_v1");
    const rows = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(rows)) return null;
    const target = String(email).trim().toLowerCase();
    return (
      rows.find((u) => {
        const em =
          u?.email ||
          u?.profile?.email ||
          u?.details?.email ||
          u?.user?.email ||
          "";
        return String(em).trim().toLowerCase() === target;
      }) || null
    );
  } catch {
    return null;
  }
}

function roleFromSignupShape(user) {
  if (!user || typeof user !== "object") return null;
  const u = {
    ...(typeof user.profile === "object" && user.profile ? user.profile : {}),
    ...(typeof user.details === "object" && user.details ? user.details : {}),
    ...user,
  };
  const has = (...keys) => keys.some((k) => u[k] != null && String(u[k]).trim() !== "");
  const organizerSignals =
    has("company_name", "company_number", "specialty", "country", "city", "job_title") &&
    has("full_mailing_address", "address");
  const speakerSignals = has("bio", "cv", "resume", "biography");
  const sponsorSignals = has("logo", "logo_url", "company_logo", "brand_logo");
  if (organizerSignals && !speakerSignals && !sponsorSignals) return "organizer";
  if (speakerSignals && !sponsorSignals) return "speaker";
  if (sponsorSignals) return "sponsor";
  return null;
}

function extractToken(payload) {
  if (!payload || typeof payload !== "object") return null;
  const direct = payload.token || payload.access_token || payload.accessToken || null;
  const normalize = (v) => {
    if (!v) return null;
    if (typeof v === "string") return v.trim();
    if (typeof v === "number") return String(v);
    return null;
  };
  const t0 = normalize(direct);
  if (t0) return t0;

  // Some APIs nest token objects: { token: { token: "..." } } etc.
  if (direct && typeof direct === "object") {
    const nested =
      direct.token ||
      direct.access_token ||
      direct.accessToken ||
      direct.bearer ||
      null;
    const t1 = normalize(nested);
    if (t1) return t1;
  }

  // Fallback: search deeply for any token-like field.
  const seen = new Set();
  const findDeep = (obj, depth = 0) => {
    if (!obj || depth > 6) return null;
    if (typeof obj !== "object") return null;
    if (seen.has(obj)) return null;
    seen.add(obj);
    if (Array.isArray(obj)) {
      for (const it of obj) {
        const r = findDeep(it, depth + 1);
        if (r) return r;
      }
      return null;
    }
    for (const k of [
      "token",
      "access_token",
      "accessToken",
      "bearer",
      "jwt",
      "plainTextToken",
      "auth_token",
    ]) {
      const r = normalize(obj[k]);
      if (r) return r;
      if (obj[k] && typeof obj[k] === "object") {
        const r2 = findDeep(obj[k], depth + 1);
        if (r2) return r2;
      }
    }
    for (const v of Object.values(obj)) {
      const r = findDeep(v, depth + 1);
      if (r) return r;
    }
    return null;
  };

  return findDeep(payload);
}

function userNeedsPendingScreen(user) {
  if (!user || typeof user !== "object") return false;
  if (user.is_approved === false || user.is_approved === 0) return true;
  const st = user.approval_status || user.account_status || user.verification_status;
  if (typeof st === "string" && st.toLowerCase() === "pending") return true;
  return false;
}

export default function LoginPage({ setPage, setUserName, setUserEmail, setUserRole, setToken }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async () => {
    // Client-side validation
    let newErrors = {};
    if (!email.trim()) newErrors.email = "Please enter your email";
    if (!pass.trim()) newErrors.pass = "Please enter your password";
    
    setErrors(newErrors);
    setGeneralError("");
    
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const isDemoAdmin =
        trimmedEmail.toLowerCase() === "admin@gmail.com" &&
        pass === "password123";

      // Demo admin: prefer real API if this account exists on the server; otherwise local demo session → admin dashboard
      if (isDemoAdmin) {
        try {
          const response = await apiLogin(trimmedEmail, pass);
          const payload = pickAuthPayload(response);
          const token = extractToken(payload);
          const user = extractLoginUser(payload);
          if (token) {
            safeLS.setItem("eh_token", token);
            setToken(token);
          }
          const adminUid =
            user.id ??
            user.user_id ??
            (token && token.split(".").length === 3
              ? (() => {
                  try {
                    const mid = token.split(".")[1];
                    const dec = JSON.parse(
                      atob(mid.replace(/-/g, "+").replace(/_/g, "/")),
                    );
                    return dec.sub ?? dec.user_id ?? null;
                  } catch {
                    return null;
                  }
                })()
              : null);
          if (adminUid != null && String(adminUid).trim() !== "")
            safeLS.setItem("eh_userId", String(adminUid));
          else safeLS.removeItem("eh_userId");
          setUserName(
            user.name ||
              user.full_name ||
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              "Admin",
          );
          setUserEmail((user.email || trimmedEmail).trim());
          setUserRole(
            normalizeRole(
              resolveRawLoginRole(user, payload) ||
                roleFromJwt(token) ||
                "admin",
            ),
          );
          setPage("admin-dashboard");
          return;
        } catch {
          const demoToken = "admin_super_secure_token_2024";
          safeLS.setItem("eh_token", demoToken);
          safeLS.removeItem("eh_userId");
          setToken(demoToken);
          setUserName("Admin");
          setUserEmail("admin@gmail.com");
          setUserRole("Admin");
          setPage("admin-dashboard");
          return;
        }
      }

      const response = await apiLogin(trimmedEmail, pass);
      const payload = pickAuthPayload(response);
      const token = extractToken(payload);
      const user = extractLoginUser(payload);
      const decision = getAdminDecisionByEmail(trimmedEmail);

      if (!token) {
        throw new Error("Login did not return an access token. Please log in again or contact support.");
      }

      if (token) {
        safeLS.setItem("eh_token", token);
        setToken(token);
      }

      const uid =
        user.id ??
        user.user_id ??
        (token && token.split(".").length === 3
          ? (() => {
              try {
                const mid = token.split(".")[1];
                const dec = JSON.parse(
                  atob(mid.replace(/-/g, "+").replace(/_/g, "/")),
                );
                return dec.sub ?? dec.user_id ?? null;
              } catch {
                return null;
              }
            })()
          : null);
      if (uid != null && String(uid).trim() !== "")
        safeLS.setItem("eh_userId", String(uid));
      else safeLS.removeItem("eh_userId");

      const rawRole =
        resolveRawLoginRole(user, payload) ||
        roleFromJwt(token) ||
        (decision && resolveRawLoginRole(decision, decision)) ||
        roleFromSignupShape(user) ||
        "User";
      const role = normalizeRole(rawRole);
      const name =
        user.name ||
        user.full_name ||
        [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        trimmedEmail;

      setUserName(name);
      setUserEmail((user.email || trimmedEmail).trim());
      setUserRole(role);

      if (userNeedsPendingScreen(user) && decision?._adminDecision !== "approved") {
        setPage("pending-screen");
        return;
      }

      const r = role.toLowerCase();
      if (r === "admin") {
        setPage("admin-dashboard");
      } else if (r === "organizer") {
        setPage("organizer-dashboard");
      } else if (r === "speaker") {
        setPage("speaker-dashboard");
      } else if (r === "sponsor") {
        setPage("sponsor-dashboard");
      } else {
        setPage("landing");
      }

    } catch (error) {
      console.error('❌ Login Error:', error.message);
      
      // Handle API errors
      if (error.message?.includes('email') || error.message?.includes('password')) {
        setErrors({ email: "Invalid email or password" });
      } else {
        setGeneralError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    console.log(`🔗 ${platform} login clicked`);
  };

  return (
    <div className="login-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden" }}>
      
      {/* CONTENT SIDE */}
      <div className="content-side" style={{ maxWidth: 380, width: "100%", position: "relative", zIndex: 10 }}>
          <div 
            onClick={() => setPage("landing")} 
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
          
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: C.navy }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: C.gray, marginBottom: 30 }}>
            Sign in to your account
          </p>

          {/* Email Input */}
          <Input 
            label="Email Address" 
            placeholder="Example@gmail.com"
            type="email" 
            autoComplete="off"
            value={email} 
            onChange={(val) => { 
              setEmail(val); 
              setErrors({ ...errors, email: "" }); 
            }} 
            error={errors.email}
          />

          {/* Password Input */}
          <Input 
            label="Password" 
            placeholder="********"
            type="password" 
            autoComplete="new-password"
            onFocus={(e) => e.target.removeAttribute('readonly')}
            value={pass} 
            onChange={(val) => { 
              setPass(val); 
              setErrors({ ...errors, pass: "" }); 
            }} 
            error={errors.pass}
          />

          {/* Forgot Password */}
          <div 
            style={{ 
              textAlign: "right", 
              fontSize: 13, 
              color: C.navy, 
              marginBottom: 20, 
              cursor: "pointer", 
              fontWeight: 500,
              textDecoration: 'underline'
            }} 
            onClick={() => setPage("forgot-password")}
          >
            Forgot password?
          </div>

          {/* General Error */}
          {generalError && (
            <div style={{ 
              fontSize: 13, 
              color: "#ef4444", 
              marginBottom: 14, 
              padding: 12,
              background: '#fef2f2',
              borderRadius: 8,
              borderLeft: '3px solid #ef4444'
            }}>
              {generalError}
            </div>
          )}

          {/* Login Button */}
          <button 
            onClick={handleLogin} 
            disabled={loading}
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
              marginBottom: 25,
              transition: 'all 0.2s'
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Divider */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            marginBottom: 25, 
            color: C.lightGray, 
            fontSize: 13 
          }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Social Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 25 }}>
            <div 
              onClick={() => handleSocialLogin('Google')}
              style={{ 
                width: 52, height: 52, borderRadius: "50%", 
                background: "#fff", display: "flex", alignItems: "center", 
                justifyContent: "center", cursor: "pointer", 
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                transition: 'all 0.2s'
              }}
              title="Google Login"
            >
              <FcGoogle size={28} />
            </div>

            <div 
              onClick={() => handleSocialLogin('Facebook')}
              style={{ 
                width: 52, height: 52, borderRadius: "50%", 
                background: "#1877f2", display: "flex", alignItems: "center", 
                justifyContent: "center", color: "#fff", fontWeight: 600, 
                fontSize: 18, cursor: "pointer", 
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                transition: 'all 0.2s'
              }}
              title="Facebook Login"
            >
              <FaFacebookF size={24} />
            </div>

            <div 
              onClick={() => handleSocialLogin('Apple')}
              style={{ 
                width: 52, height: 52, borderRadius: "50%", 
                background: "#000", display: "flex", alignItems: "center", 
                justifyContent: "center", color: "#fff", fontWeight: 600, 
                fontSize: 18, cursor: "pointer", 
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                transition: 'all 0.2s'
              }}
              title="Apple Login"
            >
              <SiApple size={24} />
            </div>
          </div>

          {/* Sign Up Link */}
          <div style={{ textAlign: "center", fontSize: 14, color: C.gray, fontWeight: 400 }}>
            Don't have an account?{" "}
            <span 
              onClick={() => setPage("signup")} 
              style={{ 
                color: C.navy, 
                fontWeight: 600, 
                cursor: "pointer", 
                textDecoration: "underline" 
              }}
            >
              Sign Up
            </span>
          </div>
        </div>

      {/* ILLUSTRATION SIDE */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "40px", overflow: 'hidden' }}>
        <img src="/img/login.png" alt="Login Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 992px) {
          .login-container {
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
            opacity: 0.1 !important; 
            pointer-events: none; 
            display: flex !important;
          }
          .content-side {
            max-width: 340px !important;
          }
          .title-responsive {
            font-size: 28px !important;
            text-align: center !important;
          }
          .content-side p { text-align: center !important; margin-bottom: 24px !important; }
          img[alt="Login Illustration"] {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .login-container {
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