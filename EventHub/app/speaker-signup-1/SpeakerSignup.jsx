'use client';
import { apiRegisterSpeaker } from "@/lip/api";
import { useState } from "react";
import { Country, City } from "country-state-city";
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
export function SpeakerSignup1({ setPage }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    let newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Please enter your full name";
    if (!email.trim()) newErrors.email = "Please enter your email";
    if (!pass.trim()) newErrors.pass = "Please enter your password";
    if (!confirmPass.trim()) newErrors.confirmPass = "Please confirm your password";
    else if (pass !== confirmPass) newErrors.confirmPass = "Passwords do not match";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      safeLS.setItem("eh_signup_email", email.trim());
      safeLS.setItem("eh_signup_name", fullName.trim());
      safeLS.setItem("eh_signup_pass", pass);
      setPage("speaker-signup-2");
    }
  };

  return (
    <div className="speaker-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("introduce-yourself")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={0} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Speaker Sign Up</h1>

          <Input label="Full Name" placeholder="John Doe" value={fullName}
            onChange={(val) => { setFullName(val); setErrors({ ...errors, fullName: "" }); }} error={errors.fullName} />
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
        <img src="/img/speaker.png" alt="Speaker Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .speaker-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Speaker Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .speaker-signup-container {
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
export function SpeakerSignup2({ setPage }) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [linkedin, setLinkedin] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const countries = Country.getAllCountries();

  const handleConfirm = () => {
    let newErrors = {};

    if (!country) newErrors.country = "Please select a country";
    if (!city) newErrors.city = "Please select a city";

    if (!linkedin.trim()) {
      newErrors.linkedin = "Please enter your LinkedIn profile link";
    } else if (!/^https:\/\/(www\.)?linkedin\.com\/.+$/.test(linkedin.trim())) {
      newErrors.linkedin = "Only valid LinkedIn URL is allowed";
    }

    if (!agreed) newErrors.agreed = "You must agree to the privacy & policy";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      safeLS.setItem("eh_signup_linkedin", linkedin.trim());
      safeLS.setItem("eh_signup_country", country);
      safeLS.setItem("eh_signup_city", city);
      setPage("speaker-signup-3");
    }
  };

  return (
    <div className="speaker-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          
          <div onClick={() => setPage("speaker-signup-1")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>

          <StepProgress step={1} />

          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>
            Speaker Sign Up
          </h1>

          <Select label="Country" options={countries.map((c) => c.name)} value={country}
            onChange={(val) => {
              setCountry(val);
              setCity("");
              const selectedCountry = countries.find((c) => c.name === val);
              if (selectedCountry) setCities(City.getCitiesOfCountry(selectedCountry.isoCode));
              setErrors({ ...errors, country: "" });
            }}
            error={errors.country}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: errors.country ? "1px solid red" : "1px solid #d1d5db", backgroundColor: "#f9fafb", fontSize: 14, marginBottom: 16, cursor: "pointer", transition: "border 0.2s",}}
          />

          <Select label="City" options={[...new Map(cities.map(c => [c.name, c])).values()].map(c => c.name)} value={city}
            onChange={(val) => { setCity(val); setErrors({ ...errors, city: "" }); }}
            error={errors.city}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: errors.city ? "1px solid red" : "1px solid #d1d5db", backgroundColor: "#f9fafb", fontSize: 14, marginBottom: 16, cursor: "pointer", transition: "border 0.2s",}}
          />

          <Input label="LinkedIn Profile Link" placeholder="https://www.linkedin.com/in/username" value={linkedin}
            onChange={(val) => setLinkedin(val)}
            onBlur={() => {
              if (linkedin.trim() && !/^https:\/\/(www\.)?linkedin\.com\/.+$/.test(linkedin.trim())) {
                setErrors({ ...errors, linkedin: "Only valid LinkedIn URL is allowed" });
              } else {
                setErrors({ ...errors, linkedin: "" });
              }
            }}
            error={errors.linkedin}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px", fontSize: 13 }}>
            <input type="checkbox" checked={agreed}
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

          {errors.agreed && <div style={{ fontSize: 12, color: "red", marginBottom: 8 }}>{errors.agreed}</div>}

          <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginBottom: 12, lineHeight: 1.6 }}>
            By proceeding, you confirm that you have read and understood our terms. Your data is encrypted and never shared with third parties. We are committed to protecting your privacy in accordance with applicable data protection laws.
          </div>

          <button onClick={handleConfirm} style={{ ...btnStyle, marginTop: 16 }}>
            Confirm
          </button>

          {loginLink(setPage, C)}
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/speaker.png" alt="Speaker Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .speaker-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Speaker Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .speaker-signup-container {
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

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
export function SpeakerSignup3({ setPage, setUserRole, setUserName, setUserEmail, redirectAfterSignup, setRedirectAfterSignup }) {
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [profileError, setProfileError] = useState("");
  const [cvError, setCvError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    let newErrors = {};
    if (!bio.trim()) newErrors.bio = "Please enter a short bio";
    if (!jobTitle.trim()) newErrors.jobTitle = "Please enter your job title";
    if (!profileFile) newErrors.profileFile = "Please upload a profile picture";
    if (!cvFile) newErrors.cvFile = "Please upload your CV";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const signupEmail = safeLS.getItem("eh_signup_email") || "";
        const signupName = safeLS.getItem("eh_signup_name") || signupEmail;
        const signupPass = safeLS.getItem("eh_signup_pass") || "";
        const signupCountry = safeLS.getItem("eh_signup_country") || "";
        const signupCity = safeLS.getItem("eh_signup_city") || "";
        const signupLinkedin = safeLS.getItem("eh_signup_linkedin") || "";

        // Convert profile photo to base64 for localStorage
        let photoBase64 = null;
        if (profileFile) {
          const reader = new FileReader();
          photoBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(profileFile);
          });
          // Save to localStorage immediately
          safeLS.setItem(`eh_photo_${signupEmail.toLowerCase()}`, photoBase64);
        }

        await apiRegisterSpeaker({
          name: signupName,
          email: signupEmail,
          password: signupPass,
          linkedin: signupLinkedin,
          country: signupCountry,
          city: signupCity,
          bio: bio.trim(),
          job_title: jobTitle.trim(),
          profile_picture: profileFile,
          photo: photoBase64,
          cv: cvFile,
          role: "speaker",
        });

        setUserEmail(signupEmail);
        setUserName(signupName);
        setUserRole("Speaker");
        [
          "eh_signup_email",
          "eh_signup_name",
          "eh_signup_pass",
          "eh_signup_linkedin",
          "eh_signup_country",
          "eh_signup_city",
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

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Only image files are allowed.");
      setProfileFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("File is too big! Max size is 2MB.");
      setProfileFile(null);
      return;
    }
    setProfileFile(file);
    setProfileError("");
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setCvError("Only PDF files are allowed.");
      setCvFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError("File is too big! Max size is 5MB.");
      setCvFile(null);
      return;
    }
    setCvFile(file);
    setCvError("");
  };

  return (
    <div className="speaker-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("speaker-signup-2")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={2} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Speaker Sign Up</h1>

          {/* Profile Picture */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>Profile Picture</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 16px", border: `1px solid ${C.border}`, borderRadius: 12, color: C.gray, fontSize: 14, cursor: "pointer", background: "#fff" }}>
              <span>⬆</span> Upload Image
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileChange} />
            </label>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Maximum size: 2MB</div>
            {profileError && <div style={{ fontSize: 12, color: "red", marginTop: 2 }}>{profileError}</div>}
            {errors.profileFile && <div style={{ fontSize: 12, color: "red", marginTop: 2 }}>{errors.profileFile}</div>}
            {profileFile && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <img src={URL.createObjectURL(profileFile)} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "1px solid #d1d5db" }} />
                <button type="button" onClick={() => setProfileFile(null)} style={{ fontSize: 12, color: "#ef4444", cursor: "pointer", border: "none", background: "none" }}>Remove</button>
              </div>
            )}
          </div>

          {/* CV */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>CV</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 16px", border: `1px solid ${C.border}`, borderRadius: 12, color: C.gray, fontSize: 14, cursor: "pointer", background: "#fff" }}>
              <span>⬆</span> Add file
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={handleCvChange} />
            </label>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Only PDF files. Maximum size: 5MB</div>
            {cvError && <div style={{ fontSize: 12, color: "red", marginTop: 2 }}>{cvError}</div>}
            {errors.cvFile && <div style={{ fontSize: 12, color: "red", marginTop: 2 }}>{errors.cvFile}</div>}
            {cvFile && (
              <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#1f2937" }}>Selected file: {cvFile.name}</span>
                <button type="button" onClick={() => setCvFile(null)} style={{ fontSize: 12, color: "#ef4444", cursor: "pointer", border: "none", background: "none" }}>Remove</button>
              </div>
            )}
          </div>

          <Input label="Short Bio" placeholder="Tell us about yourself..." value={bio} onChange={(val) => { setBio(val); setErrors({ ...errors, bio: "" }); }} error={errors.bio} />
          <Input label="Job Title" placeholder="e.g. Public Speaker" value={jobTitle} onChange={(val) => { setJobTitle(val); setErrors({ ...errors, jobTitle: "" }); }} error={errors.jobTitle} />

          <button
            onClick={handleContinue}
            disabled={loading}
            style={{
              ...btnStyle,
              opacity: loading ? 0.85 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Continue"}
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
          {loginLink(setPage, C)}
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/speaker.png" alt="Speaker Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .speaker-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Speaker Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .speaker-signup-container {
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