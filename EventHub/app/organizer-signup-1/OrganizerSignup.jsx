'use client';
import { apiRegisterOrganizer } from "@/lip/api";
import { useState, useEffect } from "react";
import { Country, City } from "country-state-city";
import { C, S } from "../../constants/styles";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/Input";
import Select from "../../components/Select";
import StepProgress from "../../components/StepProgress";
import { HiOutlineArrowLeft } from "react-icons/hi";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
export function OrganizerSignup1({ setPage }) {
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
      setPage("organizer-signup-2");
    }
  };

  return (
    <div className="organizer-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("introduce-yourself")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={0} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Organizer Sign Up</h1>

          <Input label="Email" placeholder="example@gmail.com" type="email" value={email}
            onChange={(val) => { setEmail(val); setErrors({ ...errors, email: "" }); }} error={errors.email} />
          <Input label="Password" placeholder="******" type="password" value={pass}
            onChange={(val) => { setPass(val); setErrors({ ...errors, pass: "" }); }} error={errors.pass} />
          <Input label="Confirm Password" placeholder="******" type="password" value={confirmPass}
            onChange={(val) => { setConfirmPass(val); setErrors({ ...errors, confirmPass: "" }); }} error={errors.confirmPass} />

          <button onClick={handleContinue} style={{ width: "100%", height: 50, backgroundColor: C.orange, border: "none", borderRadius: 30, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 25 }}>
            Continue
          </button>

          <div style={{ textAlign: "center", fontSize: 14, color: C.gray, fontWeight: 400 }}>
            Already have an account?{" "}
            <span onClick={() => setPage("login")} style={{ color: C.navy, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Log in</span>
          </div>
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/organizer.png" alt="Organizer Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .organizer-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Organizer Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .organizer-signup-container {
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
export function OrganizerSignup2({ setPage }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    let newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Please enter your full name";
    if (!phone.trim()) newErrors.phone = "Please enter your phone number";
    if (!jobTitle.trim()) newErrors.jobTitle = "Please enter your job title";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      safeLS.setItem("eh_signup_name", fullName.trim());
      safeLS.setItem("eh_signup_phone", phone.trim());
      safeLS.setItem("eh_signup_jobTitle", jobTitle.trim());
      setPage("organizer-signup-3");
    }
  };

  return (
    <div className="organizer-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("organizer-signup-1")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={1} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Organizer Sign Up</h1>

          <Input label="Full Name" placeholder="John Doe" value={fullName}
            onChange={(val) => { setFullName(val); setErrors({ ...errors, fullName: "" }); }} error={errors.fullName} />
          <Input label="Phone Number" placeholder="+20 100 000 0000" value={phone}
            onChange={(val) => { setPhone(val); setErrors({ ...errors, phone: "" }); }} error={errors.phone} />
          <Input label="Job Title" placeholder="e.g. Event Manager" value={jobTitle}
            onChange={(val) => { setJobTitle(val); setErrors({ ...errors, jobTitle: "" }); }} error={errors.jobTitle} />

          <button onClick={handleContinue} style={{ width: "100%", height: 50, backgroundColor: C.orange, border: "none", borderRadius: 30, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 25 }}>
            Continue
          </button>

          <div style={{ textAlign: "center", fontSize: 14, color: C.gray, fontWeight: 400 }}>
            Already have an account?{" "}
            <span onClick={() => setPage("login")} style={{ color: C.navy, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Log in</span>
          </div>
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/organizer.png" alt="Organizer Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .organizer-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Organizer Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .organizer-signup-container {
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
export function OrganizerSignup3({ setPage, setUserRole, setUserName, setUserEmail }) {
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const selectStyle = (error) => ({ 
    width: "100%", 
    padding: "12px 16px", 
    borderRadius: 10, 
    border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", 
    backgroundColor: "#ffffff", 
    fontSize: 14, 
    marginBottom: 16, 
    cursor: "pointer", 
    appearance: "none", 
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
    backgroundRepeat: "no-repeat", 
    backgroundPosition: "right 12px center", 
    backgroundSize: "16px", 
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)", 
    transition: "all 0.2s ease", 
    outline: "none"
  });

  const countries = Country.getAllCountries();

  const handleConfirm = async () => {
    let newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Please enter your company name";
    if (!taxNumber.trim()) newErrors.taxNumber = "Please enter your company number";
    if (!industry) newErrors.industry = "Please select an industry";
    if (!country) newErrors.country = "Please select a country";
    if (!city) newErrors.city = "Please select a city";
    if (!address.trim()) newErrors.address = "Please enter your mailing address";
    if (!agreed) newErrors.agreed = "You must agree to the privacy & policy";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        const signupEmail = safeLS.getItem("eh_signup_email") || "";
        const signupName = safeLS.getItem("eh_signup_name") || signupEmail;
        const signupPass = safeLS.getItem("eh_signup_pass") || "";
        const signupPhone = safeLS.getItem("eh_signup_phone") || "";
        const signupJobTitle = safeLS.getItem("eh_signup_jobTitle") || "";

        const result = await apiRegisterOrganizer({
          name: signupName,
          email: signupEmail,
          password: signupPass,
          phone: signupPhone,
          job_title: signupJobTitle,
          company_name: companyName.trim(),
          company_number: taxNumber.trim(),
          specialty: industry,
          country,
          city,
          full_mailing_address: address.trim(),
          role: "organizer"
        });

        console.log("✅ Registration Success:", result);
        
        ["eh_signup_email","eh_signup_name","eh_signup_pass","eh_signup_phone","eh_signup_jobTitle"]
          .forEach(k => safeLS.removeItem(k));
        
        setUserEmail(signupEmail);
        setUserName(signupName);
        setUserRole("Organizer");
        
        setPage("pending-screen");
        
      } catch (error) {
        console.error("❌ Registration Error:", error);
        setErrors({ 
          api: error.message || "Registration failed. Please try again." 
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="organizer-signup-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative", overflow: "hidden", gap: 40 }}>
      
      <div className="content-side" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10 }}>
          <div onClick={() => setPage("organizer-signup-2")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
            <HiOutlineArrowLeft size={24} />
          </div>
          <StepProgress step={2} />
          <h1 className="title-responsive" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: C.navy }}>Organizer Sign Up</h1>

          <Input 
            label="Official Company Name" 
            placeholder="e.g. Acme Corp" 
            value={companyName}
            onChange={(val) => { setCompanyName(val); setErrors({ ...errors, companyName: "" }); }} 
            error={errors.companyName} 
          />
          
          <Input 
            label="Company Ph. Number"
            placeholder="+20 100 000 0000" 
            value={taxNumber}
            onChange={(val) => { setTaxNumber(val); setErrors({ ...errors, taxNumber: "" }); }} 
            error={errors.taxNumber} 
          />
          
          <Select 
            label="Industry Type" 
            options={["Technology", "Events", "Marketing", "Finance", "Software"]} 
            value={industry}
            onChange={(val) => { setIndustry(val); setErrors({ ...errors, industry: "" }); }} 
            error={errors.industry} 
          />
          
          <Select 
            label="Country" 
            options={countries.map(c => c.name)} 
            value={country} 
            onChange={(val) => { 
              setCountry(val); 
              setCity("");
              const selectedCountry = countries.find(c => c.name === val);
              if (selectedCountry) setCities(City.getCitiesOfCountry(selectedCountry.isoCode));
              setErrors({ ...errors, country: "" });
            }}
            error={errors.country}
            style={selectStyle(errors.country)}
          />
          
          <Select 
            label="City" 
            options={cities.map(c => c.name)} 
            value={city}
            onChange={(val) => {
              setCity(val);
              setErrors({ ...errors, city: "" });
            }}
            error={errors.city}
            style={selectStyle(errors.city)}
          />       
          
          <Input 
            label="Full Mailing Address" 
            placeholder="123 Main St, Floor 4" 
            value={address} 
            onChange={(val) => { setAddress(val); setErrors({ ...errors, address: "" }); }} 
            error={errors.address} 
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
              <span style={{ color: C.navy, fontWeight: 600, cursor: "pointer" }}>privacy & policy</span>
            </span>
          </div>
          
          {errors.agreed && <div style={{ fontSize: 12, color: "red", marginBottom: 8 }}>{errors.agreed}</div>}
          {errors.api && <div style={{ fontSize: 12, color: "red", marginBottom: 8, padding: 8, background: "#fee2e2", borderRadius: 6 }}>{errors.api}</div>}
          
          <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginBottom: 12, lineHeight: 1.6 }}>
            By proceeding, you confirm that you have read and understood our terms. Your data is encrypted and never shared with third parties.
          </div>

          <button 
            onClick={handleConfirm} 
            disabled={loading}
            style={{ 
              width: "100%", 
              height: 50, 
              backgroundColor: loading ? "#f59e0b" : C.orange, 
              border: "none", 
              borderRadius: 30, 
              color: "#fff", 
              fontSize: 16, 
              fontWeight: 600, 
              cursor: loading ? "not-allowed" : "pointer", 
              marginTop: 16, 
              marginBottom: 25,
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? "Creating Account..." : "Confirm"}
          </button>
        </div>

      {/* ILLUSTRATION SIDE - Photo on Right */}
      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
        <img src="/img/organizer.png" alt="Organizer Signup Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .organizer-signup-container { flex-direction: column !important; padding: 40px 24px !important; justify-content: center !important; overflow: hidden; }
          .illustration-container { 
            position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; 
            margin-left: 0 !important; z-index: 1 !important; opacity: 0.1 !important; 
            pointer-events: none !important; display: flex !important; justify-content: center !important; align-items: center !important;
          }
          .content-side { max-width: 340px !important; position: relative !important; z-index: 10 !important; }
          .title-responsive { font-size: 28px !important; text-align: center !important; margin-bottom: 20px !important; }
          img[alt="Organizer Signup Illustration"] { 
            width: 100% !important; 
            height: 100% !important; 
            object-fit: cover !important; 
          }
          button { height: 46px !important; font-size: 15px !important; }
        }

        @media (min-width: 993px) {
           .organizer-signup-container {
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
