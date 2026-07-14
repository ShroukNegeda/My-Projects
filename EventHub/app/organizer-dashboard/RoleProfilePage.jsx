'use client';
import { useState, useEffect, useRef } from "react";
import { apiUpdateProfile } from "@/lip/api";
import { C } from "../../constants/styles";
import SidebarLayout from "../../components/SidebarLayout";
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit, FaCheck, FaTimes, FaCamera, FaTrash,
         FaSignOutAlt, FaPhone, FaBriefcase, FaBuilding, FaMapMarkerAlt,
         FaLinkedin, FaFileAlt, FaHashtag } from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

export default function RoleProfilePage({
  setPage, userName, setUserName,
  userEmail, setUserEmail,
  userRole, logout,
}) {
  const [savedMsg, setSavedMsg] = useState("");
  const flash = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); };

  const getPhotoKey = (email) => email ? `eh_photo_${email.toLowerCase().trim()}` : null;
  const [photo, setPhoto] = useState(() => {
    const k = getPhotoKey(userEmail);
    const stored = k ? safeLS.getItem(k) : null;
    return (stored && stored.startsWith('data:image')) ? stored : null;
  });
  useEffect(() => {
    const k = getPhotoKey(userEmail);
    const stored = k ? safeLS.getItem(k) : null;
    setPhoto(stored && stored.startsWith('data:image') ? stored : null);
  }, [userEmail]);
  const fileRef = useRef();
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file || !userEmail) { if (!userEmail) alert("No email found"); return; }
    const k = getPhotoKey(userEmail);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300, scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        try { 
          safeLS.setItem(k, dataUrl); 
          setPhoto(dataUrl); 
          window.dispatchEvent(new Event("storage"));
        } catch { alert("Storage full."); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const loadAcct = () => { const a = JSON.parse(safeLS.getItem("eh_accounts") || "{}"); return a[(userEmail || "").toLowerCase().trim()] || {}; };
  const saveAcct = (patch) => {
    const a = JSON.parse(safeLS.getItem("eh_accounts") || "{}");
    a[(userEmail || "").toLowerCase().trim()] = { ...loadAcct(), ...patch };
    safeLS.setItem("eh_accounts", JSON.stringify(a));
  };
  const [acct, setAcct] = useState(() => loadAcct());
  useEffect(() => { setAcct(loadAcct()); }, [userEmail]);

  const [editing, setEditing] = useState({});
  const [drafts,  setDrafts]  = useState({});
  const [errors,  setErrors]  = useState({});

  const startEdit  = (key, val) => { setEditing(e=>({...e,[key]:true})); setDrafts(d=>({...d,[key]:val||""})); setErrors(r=>({...r,[key]:""})); };
  const cancelEdit = (key)      => { setEditing(e=>({...e,[key]:false})); setErrors(r=>({...r,[key]:""})); };
  const saveField  = (key, validate) => {
    const val = (drafts[key]||"").trim();
    if (validate) { const err = validate(val); if (err) { setErrors(r=>({...r,[key]:err})); return; } }
    if (key==="name")  setUserName(val);
    if (key==="email") setUserEmail(val);
    saveAcct({[key]:val}); setAcct(a=>({...a,[key]:val}));
    setEditing(e=>({...e,[key]:false})); flash("Changes saved");
  };

  const roleConfig = {
    Organizer: { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa", badge:"Organizer", gradient:"135deg, #f97316, #ea580c" },
    Speaker:   { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0", badge:"Speaker",   gradient:"135deg, #22c55e, #16a34a" },
    Sponsor:   { bg:"#faf5ff", color:"#7e22ce", border:"#e9d5ff", badge:"Sponsor",   gradient:"135deg, #a855f7, #7c3aed" },
  }[userRole] || { bg:"#f1f5f9", color:"#475569", border:"#cbd5e1", badge:userRole, gradient:"135deg, #64748b, #475569" };

  const profileKey = { Organizer:"organizer-profile", Speaker:"speaker-profile", Sponsor:"sponsor-profile" }[userRole];

  const removePhoto = () => {
    if (!userEmail) return;
    const k = getPhotoKey(userEmail);
    safeLS.removeItem(k);
    setPhoto(null);
    window.dispatchEvent(new Event("storage"));
  };
  const initials = (userName||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  const baseFields = [
    { key:"name",     label:"Full Name",     icon:<FaUser      color={C.orange} size={14}/>, value:userName,  validate:v=>!v?"Name cannot be empty":null },
    { key:"email",    label:"Email Address", icon:<FaEnvelope  color={C.orange} size={14}/>, value:userEmail, validate:v=>!v?"Email cannot be empty":!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?"Invalid email":null },
    { key:"phone",    label:"Phone Number",  icon:<FaPhone     color={C.orange} size={14}/>, value:acct.phone||"" },
    { key:"jobTitle", label:"Job Title",     icon:<FaBriefcase color={C.orange} size={14}/>, value:acct.jobTitle||"" },
  ];
  const orgFields = [
    { key:"companyName", label:"Company Name", icon:<FaBuilding     color={C.orange} size={14}/>, value:acct.companyName||"" },
    { key:"taxNumber",   label:"Tax Number",   icon:<FaHashtag      color={C.orange} size={14}/>, value:acct.taxNumber||"" },
    { key:"industry",    label:"Industry",     icon:<FaBriefcase    color={C.orange} size={14}/>, value:acct.industry||"" },
    { key:"country",     label:"Country",      icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.country||"" },
    { key:"city",        label:"City",         icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.city||"" },
    { key:"address",     label:"Address",      icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.address||"" },
  ];
  const spkFields = [
    { key:"linkedin", label:"LinkedIn",  icon:<FaLinkedin     color={C.orange} size={14}/>, value:acct.linkedin||"" },
    { key:"country",  label:"Country",   icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.country||"" },
    { key:"city",     label:"City",      icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.city||"" },
    { key:"bio",      label:"Bio",       icon:<FaFileAlt      color={C.orange} size={14}/>, value:acct.bio||"" },
  ];
  const spsFields = [
    { key:"companyName", label:"Company Name", icon:<FaBuilding     color={C.orange} size={14}/>, value:acct.companyName||"" },
    { key:"taxNumber",   label:"Tax Number",   icon:<FaHashtag      color={C.orange} size={14}/>, value:acct.taxNumber||"" },
    { key:"industry",    label:"Industry",     icon:<FaBriefcase    color={C.orange} size={14}/>, value:acct.industry||"" },
    { key:"country",     label:"Country",      icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.country||"" },
    { key:"city",        label:"City",         icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.city||"" },
    { key:"address",     label:"Address",      icon:<FaMapMarkerAlt color={C.orange} size={14}/>, value:acct.address||"" },
  ];
  const extraFields = userRole==="Organizer"?orgFields:userRole==="Speaker"?spkFields:userRole==="Sponsor"?spsFields:[];
  const allFields = [...baseFields, ...extraFields];

  const EditRow = ({ fieldKey, label, icon, value, validate }) => {
    const isEditing = editing[fieldKey];
    return (
      <div className="profile-field" style={{ display:"flex", alignItems:"flex-start", gap:16, padding:"18px 0", borderBottom:`1px solid #f1f5f9`, transition:"background 0.2s", borderRadius:8, margin:"0 -8px", padding:"18px 8px" }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg, #fff7ed, #fff)`, border:"1.5px solid #ffe4cc", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(245,130,31,0.1)" }}>
          {icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:10, color:"#94a3b8", marginBottom:6, textTransform:"uppercase", letterSpacing:"1px", fontWeight:700 }}>{label}</div>
          {isEditing ? (
            <div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input autoFocus value={drafts[fieldKey]??""} onChange={e=>setDrafts(d=>({...d,[fieldKey]:e.target.value}))}
                  onKeyDown={e=>{if(e.key==="Enter")saveField(fieldKey,validate);if(e.key==="Escape")cancelEdit(fieldKey);}}
                  style={{ fontSize:14, fontWeight:600, color:C.navy, flex:1, border:`2px solid ${errors[fieldKey]?"#ef4444":C.orange}`, borderRadius:10, padding:"8px 14px", fontFamily:"Poppins, sans-serif", outline:"none", background:"#fff", boxShadow:`0 0 0 4px ${errors[fieldKey]?"rgba(239,68,68,0.1)":"rgba(245,130,31,0.1)"}`, transition:"box-shadow 0.2s" }} />
                <button onClick={()=>saveField(fieldKey,validate)} style={{ background:"linear-gradient(135deg,#10b981,#059669)", border:"none", borderRadius:10, padding:"10px 12px", cursor:"pointer", display:"flex", boxShadow:"0 2px 8px rgba(16,185,129,0.3)", transition:"transform 0.1s" }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}><FaCheck color="#fff" size={12}/></button>
                <button onClick={()=>cancelEdit(fieldKey)} style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"none", borderRadius:10, padding:"10px 12px", cursor:"pointer", display:"flex", boxShadow:"0 2px 8px rgba(239,68,68,0.3)", transition:"transform 0.1s" }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}><FaTimes color="#fff" size={12}/></button>
              </div>
              {errors[fieldKey] && <div style={{ fontSize:12, color:"#ef4444", marginTop:6, display:"flex", alignItems:"center", gap:4 }}>⚠ {errors[fieldKey]}</div>}
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"space-between" }}>
              <span style={{ fontSize:14, fontWeight:value?600:400, color:value?C.navy:"#94a3b8", lineHeight:1.4 }}>{value||"Click edit to add"}</span>
              <button onClick={()=>startEdit(fieldKey,value)}
                style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#64748b", fontWeight:600, fontFamily:"Poppins, sans-serif", flexShrink:0, transition:"all 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#fff7ed"; e.currentTarget.style.borderColor=C.orange; e.currentTarget.style.color=C.orange; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#64748b"; }}>
                <FaEdit size={11}/> Edit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <SidebarLayout active={profileKey} setPage={setPage} userName={userName} userEmail={userEmail} userRole={userRole} logout={logout} userPhoto={photo}>
      <style>{`
        .profile-field:hover { background: #fafbff !important; }
        .profile-field:last-child { border-bottom: none !important; }
        .save-toast { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .hero-card { position: relative; overflow: hidden; }
        .hero-card::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; background:radial-gradient(circle, rgba(245,130,31,0.12), transparent 70%); border-radius:50%; pointer-events:none; }
        .hero-card::after { content:''; position:absolute; bottom:-40px; left:-40px; width:160px; height:160px; background:radial-gradient(circle, rgba(26,31,94,0.07), transparent 70%); border-radius:50%; pointer-events:none; }
      `}</style>

      <div style={{ maxWidth:640, paddingBottom:40 }}>

        {/* Page title */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:C.navy, margin:"0 0 4px", fontFamily:"Poppins, sans-serif", letterSpacing:"-0.5px" }}>Profile Settings</h1>
            <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>Manage and update your account information</p>
          </div>
          {savedMsg && (
            <div className="save-toast" style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"1.5px solid #86efac", borderRadius:12, padding:"8px 16px", fontSize:13, color:"#15803d", fontWeight:700 }}>
              <span style={{ fontSize:16 }}>✓</span> {savedMsg}
            </div>
          )}
        </div>

        {/* Hero card */}
        <div className="hero-card" style={{ background:`linear-gradient(135deg, ${C.navy} 0%, #2d3580 100%)`, borderRadius:24, padding:"32px 32px 28px", marginBottom:20, boxShadow:"0 20px 60px rgba(26,31,94,0.25), 0 4px 16px rgba(26,31,94,0.15)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:24, position:"relative", zIndex:1 }}>
            {/* Avatar */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:90, height:90, borderRadius:24, background:"linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))", border:"2px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                {photo
                  ? <img src={photo} alt="profile" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <span style={{ fontSize:32, fontWeight:800, color:"#fff", fontFamily:"Poppins, sans-serif" }}>{initials}</span>}
              </div>
              <button type="button" onClick={()=>fileRef.current.click()} style={{ position:"absolute", bottom:-6, right:-6, width:30, height:30, borderRadius:10, background:`linear-gradient(135deg, ${C.orange}, #f97316)`, border:"2.5px solid #1a1f5e", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 12px rgba(245,130,31,0.5)", transition:"transform 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                <FaCamera color="#fff" size={11}/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
              {photo && (
                <button type="button" onClick={removePhoto}
                  style={{ position:"absolute", top:-6, right:-6, width:24, height:24, borderRadius:8, background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(239,68,68,0.4)", transition:"transform 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <FaTrash color="#fff" size={9}/>
                </button>
              )}
            </div>

            {/* Name + role */}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:8, fontFamily:"Poppins, sans-serif", letterSpacing:"-0.3px", textShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>{userName || "Your Name"}</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, fontWeight:700, background:roleConfig.bg, color:roleConfig.color, padding:"4px 14px", borderRadius:20, border:`1.5px solid ${roleConfig.border}`, letterSpacing:"0.3px" }}>
                  {roleConfig.badge}
                </span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>{userEmail}</span>
              </div>
            </div>
          </div>

          {/* Decorative dots */}
          <div style={{ position:"absolute", top:16, right:120, display:"flex", gap:6, zIndex:0, opacity:0.3 }}>
            {[...Array(4)].map((_,i)=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>)}
          </div>
        </div>

        {/* Fields card */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #f1f5f9", boxShadow:"0 4px 24px rgba(26,31,94,0.06), 0 1px 4px rgba(26,31,94,0.04)", overflow:"hidden", marginBottom:16 }}>

          {/* Personal info section */}
          <div style={{ padding:"20px 28px 4px", borderBottom:"1.5px solid #f1f5f9" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:4 }}>Personal Information</div>
          </div>
          <div style={{ padding:"4px 20px 8px" }}>
            {baseFields.map((f,i) => <EditRow key={f.key} fieldKey={f.key} label={f.label} icon={f.icon} value={f.key==="name"?userName:f.key==="email"?userEmail:acct[f.key]||""} validate={f.validate} />)}
          </div>

          {/* Role-specific section */}
          {extraFields.length > 0 && (
            <>
              <div style={{ padding:"20px 28px 4px", borderBottom:"1.5px solid #f1f5f9", borderTop:"1.5px solid #f1f5f9" }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:4 }}>
                  {userRole === "Speaker" ? "Professional Details" : "Company Details"}
                </div>
              </div>
              <div style={{ padding:"4px 20px 8px" }}>
                {extraFields.map(f => <EditRow key={f.key} fieldKey={f.key} label={f.label} icon={f.icon} value={acct[f.key]||""} validate={f.validate} />)}
              </div>
            </>
          )}

          {/* Role badge row */}
          <div style={{ padding:"16px 28px", borderTop:"1.5px solid #f1f5f9", background:"#fafbff", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:roleConfig.bg, border:`1.5px solid ${roleConfig.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <FaShieldAlt color={roleConfig.color} size={14}/>
            </div>
            <div>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:4, textTransform:"uppercase", letterSpacing:"1px", fontWeight:700 }}>Account Role</div>
              <span style={{ fontSize:13, fontWeight:700, background:roleConfig.bg, color:roleConfig.color, padding:"3px 14px", borderRadius:20, border:`1.5px solid ${roleConfig.border}` }}>{userRole}</span>
            </div>
            <div style={{ marginLeft:"auto", fontSize:12, color:"#94a3b8" }}>Cannot be changed</div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={()=>logout&&logout()}
          style={{ width:"100%", padding:"15px 0", background:"#fff", border:"1.5px solid #fee2e2", borderRadius:16, color:"#ef4444", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Poppins, sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 2px 12px rgba(239,68,68,0.08)", transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.boxShadow="0 4px 20px rgba(239,68,68,0.15)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="#fff"; e.currentTarget.style.boxShadow="0 2px 12px rgba(239,68,68,0.08)"; }}>
          <FaSignOutAlt size={14}/> Sign Out
        </button>
      </div>
    </SidebarLayout>
  );
}
