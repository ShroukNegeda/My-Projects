'use client';
import { apiRegisterSponsor } from "@/lip/api";
import { useState } from "react";
import { C, S } from "../../constants/styles";
import Input from "../../components/Input";
import Select from "../../components/Select";
import StepProgress from "../../components/StepProgress";
import { HiOutlineArrowLeft } from "react-icons/hi";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

const btnStyle = { width: "100%", height: 50, backgroundColor: C.orange, border: "none", borderRadius: 30, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 25 };
const loginLink = (setPage, C) => (
  <div style={{ textAlign: "center", fontSize: 14, color: C.gray, fontWeight: 400 }}>
    Already have an account?{" "}
    <span onClick={() => setPage("login")} style={{ color: C.navy, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Log in</span>
  </div>
);

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
export function SponsorSignup1({ setPage }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    let newErrors = {};
    if (!email.trim()) newErrors.email = "Please enter your email";
    if (!pass.trim()) newErrors.pass = "Please enter your password";
    if (!confirmPass.trim()) newErrors.confirmPass = "Please confirm your password";
    else if (pass !== confirmPass) newErrors.confirmPass = "Passwords do not match";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      safeLS.setItem("eh_signup_email", email.trim());
      safeLS.setItem("eh_signup_pass", pass);
      setPage("sponsor-signup-2");
    }
  };

  return (
    <div className="sponsor-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("introduce-yourself")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={0} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Sponsor Sign Up</h1>

          <Input label="Email" placeholder="example@gmail.com" type="email" value={email}
            onChange={(val) => { setEmail(val); setErrors({ ...errors, email: "" }); }} error={errors.email} />
          <Input label="Password" placeholder="******" type="password" value={pass}
            onChange={(val) => { setPass(val); setErrors({ ...errors, pass: "" }); }} error={errors.pass} />
          <Input label="Confirm Password" placeholder="******" type="password" value={confirmPass}
            onChange={(val) => { setConfirmPass(val); setErrors({ ...errors, confirmPass: "" }); }} error={errors.confirmPass} />

          <button onClick={handleContinue} style={btnStyle}>Continue</button>
          {loginLink(setPage, C)}
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/sponsor.png" alt="Sponsor Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .sponsor-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Sponsor Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .sponsor-signup-container {
             justify-content: center !important;
             padding: 60px 80px !important;
           }
           .content-side {
             max-width: 400px !important;
           }
           .illustration-container img {
             max-width: 480px !important;
           }
           .title-responsive {
             font-size: 36px !important;
           }
        }
      `}</style>
    </div>
  );
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
export function SponsorSignup2({ setPage }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    let newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Please enter your full name";
    if (!phone.trim()) newErrors.phone = "Please enter your phone number";
    if (!jobTitle.trim()) newErrors.jobTitle = "Please enter your job title";
    if (!industry) newErrors.industry = "Please select an industry";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      safeLS.setItem("eh_signup_name", fullName.trim());
      safeLS.setItem("eh_signup_phone", phone.trim());
      safeLS.setItem("eh_signup_jobTitle", jobTitle.trim());
      safeLS.setItem("eh_signup_industry", industry);
      setPage("sponsor-signup-3");
    }
  };

  return (
    <div className="sponsor-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("sponsor-signup-1")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={1} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Sponsor Sign Up</h1>

          <Input label="Full Name" placeholder="John Doe" value={fullName}
            onChange={(val) => { setFullName(val); setErrors({ ...errors, fullName: "" }); }} error={errors.fullName} />
          <Input label="Phone Number" placeholder="+20 100 000 0000" value={phone}
            onChange={(val) => { setPhone(val); setErrors({ ...errors, phone: "" }); }} error={errors.phone} />
          <Input label="Job Title" placeholder="e.g. Marketing Manager" value={jobTitle}
            onChange={(val) => { setJobTitle(val); setErrors({ ...errors, jobTitle: "" }); }} error={errors.jobTitle} />
          <Select label="Industry Type" options={["Technology", "Finance", "Retail", "Healthcare"]} value={industry}
            onChange={(val) => { setIndustry(val); setErrors({ ...errors, industry: "" }); }} error={errors.industry} />

          <button onClick={handleContinue} style={btnStyle}>Continue</button>
          {loginLink(setPage, C)}
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/sponsor.png" alt="Sponsor Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .sponsor-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Sponsor Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .sponsor-signup-container {
             justify-content: center !important;
             padding: 60px 80px !important;
           }
           .content-side {
             max-width: 400px !important;
           }
           .illustration-container img {
             max-width: 480px !important;
           }
           .title-responsive {
             font-size: 36px !important;
           }
        }
      `}</style>
    </div>
  );
}

// Helper function to compress image before converting to base64
const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
export function SponsorSignup3({ setPage, setUserRole, setUserName, setUserEmail, redirectAfterSignup, setRedirectAfterSignup }) {
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    let newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Please enter your company name";
    if (!taxNumber.trim()) newErrors.taxNumber = "Please enter your tax number";
    if (!address.trim()) newErrors.address = "Please enter your mailing address";
    if (!agreed) newErrors.agreed = "You must agree to the privacy & policy";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        // Get signup data from safeLS (saved by Step 1 and 2)
        const signupEmail = safeLS.getItem("eh_signup_email");
        const signupPass  = safeLS.getItem("eh_signup_pass");
        const signupName  = safeLS.getItem("eh_signup_name");
        const signupCountry = safeLS.getItem("eh_signup_country");
        const signupCity    = safeLS.getItem("eh_signup_city");
        
        console.log('[DEBUG] Sponsor signup data:', { signupEmail, signupName, signupCountry, signupCity, hasPass: !!signupPass });
        
        if (!signupEmail || !signupName) {
          alert("Missing signup information. Please go back and complete steps 1 and 2.");
          setLoading(false);
          return;
        }
        
        // Save logo to localStorage if available
        if (logoPreview && signupEmail) {
          safeLS.setItem(`eh_photo_${signupEmail.toLowerCase()}`, logoPreview);
        }
        
        await apiRegisterSponsor({
          name: signupName,
          email: signupEmail,
          password: signupPass,
          country: signupCountry,
          city: signupCity,
          full_mailing_address: address.trim(),
          logo: logoFile,
          photo: logoPreview,
          role: "sponsor",
        });

        setUserEmail(signupEmail);
        setUserName(signupName);
        setUserRole("Sponsor");
        [
          "eh_signup_email",
          "eh_signup_name",
          "eh_signup_pass",
          "eh_signup_phone",
          "eh_signup_jobTitle",
          "eh_signup_industry",
        ].forEach((k) => safeLS.removeItem(k));

        if (redirectAfterSignup) {
          setPage("pending-screen");
          setRedirectAfterSignup(null);
        } else {
          setPage("pending-screen");
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          api: error.message || "Registration failed. Please try again.",
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="sponsor-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("sponsor-signup-2")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={2} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Sponsor Sign Up</h1>

          <Input label="Official Company Name" placeholder="e.g. Acme Corp" value={companyName}
            onChange={(val) => { setCompanyName(val); setErrors({ ...errors, companyName: "" }); }} error={errors.companyName} />
          <Input label="Company Ph. Number" placeholder="+20 100 000 0000" value={taxNumber}
            onChange={(val) => { setTaxNumber(val); setErrors({ ...errors, taxNumber: "" }); }} error={errors.taxNumber} />
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>Company Logo</label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 16px", border: `1px solid ${C.border}`, borderRadius: 12, color: C.gray, fontSize: 14, cursor: "pointer", background: "#fff" }}>
                <span>⬆</span> Upload Image
                <input type="file" accept="image/*"
                 style={{ display: "none" }}
                 onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  // Check file size (max 5MB before compression)
                  if (file.size > 5 * 1024 * 1024) {
                    alert('File too large. Maximum 5MB.');
                    return;
                  }
                  setLogoFile(file);
                  // Compress and convert to base64 for persistent preview
                  try {
                    const compressed = await compressImage(file, 300, 300, 0.6);
                    setLogoPreview(compressed);
                    console.log('[DEBUG] Logo compressed, size:', Math.round(compressed.length / 1024), 'KB');
                  } catch (err) {
                    console.error('[DEBUG] Compression failed:', err);
                    alert('Failed to process image. Please try a smaller image.');
                  }
                }}
              />
            </label>
            
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Only images. Maximum size: 5MB</div>
            
            {logoPreview && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <img src={logoPreview} alt="Logo Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "1px solid #d1d5db"}}/>
                <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} style={{ fontSize: 12, color: "#ef4444", cursor: "pointer", border: "none", background: "none" }}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <Input label="Full Mailing Address" placeholder="123 Main St, Floor 4" value={address}
            onChange={(val) => { setAddress(val); setErrors({ ...errors, address: "" }); }} error={errors.address} />

          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px", fontSize: 13 }}>
            <input type="checkbox" checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setErrors({ ...errors, agreed: "" }); }}
              style={{ cursor: "pointer", accentColor: C.orange }} />
            <span style={{ color: C.gray, fontWeight: 400 }}>
              I agree with{" "}
              <span style={{ color: C.navy, fontWeight: 600, cursor: "pointer" }}>privacy &amp; policy</span>
            </span>
          </div>
          {errors.agreed && <div style={{ fontSize: 12, color: "red", marginBottom: 8 }}>{errors.agreed}</div>}
          <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginBottom: 12, lineHeight: 1.6 }}>
            By proceeding, you confirm that you have read and understood our terms. Your data is encrypted and never shared with third parties. We are committed to protecting your privacy in accordance with applicable data protection laws.
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              ...btnStyle,
              marginTop: 16,
              opacity: loading ? 0.85 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Confirm"}
          </button>
          {errors.api && (
            <div
              style={{
                fontSize: 12,
                color: "red",
                marginTop: -14,
                marginBottom: 12,
              }}
            >
              {errors.api}
            </div>
          )}
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/sponsor.png" alt="Sponsor Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .sponsor-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Sponsor Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .sponsor-signup-container {
             justify-content: center !important;
             padding: 60px 80px !important;
           }
           .content-side {
             max-width: 400px !important;
           }
           .illustration-container img {
             max-width: 480px !important;
           }
           .title-responsive {
             font-size: 36px !important;
           }
        }
      `}</style>
    </div>
  );
}
