'use client';
import { useState } from "react";
import { C } from "../../constants/styles";
import { HiOutlineUsers, HiOutlineCalendar, HiOutlineMicrophone, HiOutlineHand, HiOutlineArrowLeft, } from "react-icons/hi";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};


const ROLES = [
  { icon: <HiOutlineUsers size={26} />, title: "Want To Attend an Event?", desc: "Explore upcoming events and secure your spot with a single tap.", next: "login", role: "User" },
  { icon: <HiOutlineCalendar size={26} />, title: "Want To Organize an Event?", desc: "Create and publish events easily on EventHub.", next: "organizer-signup-1", role: "Organizer" },
  { icon: <HiOutlineMicrophone size={26} />, title: "Want To Become a Speaker?", desc: "Share your experience and join top events.", next: "speaker-signup-1", role: "Speaker" },
  { icon: <HiOutlineHand size={26} />, title: "Want To Sponsor an Event?", desc: "Promote your brand to the right audience.", next: "sponsor-signup-1", role: "Sponsor" },
];

export default function IntroduceYourself({ setPage, setUserRole, setUserName, setUserEmail }) {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected === null) return;
    const role = ROLES[selected].role;
    const signupEmail = safeLS.getItem("eh_signup_email") || "";
    const signupName  = safeLS.getItem("eh_signup_name")  || signupEmail;
    const signupPass  = safeLS.getItem("eh_signup_pass")  || "";

    // Navigate FIRST — before setting userRole, to prevent App re-routing
    setPage(ROLES[selected].next);
    // Temp keys are kept for all roles — login/signup steps will clear them
  };

  return (
    <div className="introduce-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Poppins, sans-serif", background: "#f7f8fb", position: "relative" }}>

      {/* LEFT CONTENT */}

      <div className="content-side" style={{ maxWidth: 480, width: "100%", position: "relative", zIndex: 2 }}>


        {/* Back Icon */}

        <div onClick={() => setPage("signup")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy }}>
          <HiOutlineArrowLeft size={24} />
        </div>


        {/* Title */}

        <h1 className="title-responsive" style={{ fontSize: 34, fontWeight: 800, marginBottom: 32, color: C.navy, textAlign: "left" }}>
          Introduce Yourself
        </h1>


        {/* Cards */}
        
        {ROLES.map((r, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ borderRadius: 18, padding: "22px", marginBottom: 20, cursor: "pointer", background: "#fff", boxShadow: selected === i ? `0 8px 24px rgba(0,0,0,0.2)` : "0 8px 24px rgba(0,0,0,0.05)", border: selected === i ? `2px solid ${C.navy}` : "2px solid transparent", transition: "all 0.3s ease", textAlign: "center",}} className="role-card">
            <div style={{ marginBottom: 12, color: C.navy, display: "flex", justifyContent: "center" }}>
              {r.icon}
            </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#222" }}>{r.title}</div>
          <div style={{ fontSize: 14, color: "#777", lineHeight: 1.6 }}>{r.desc}</div>
        </div>
      ))}


        {/* Confirm Button */}

        <button onClick={handleConfirm} style={{ marginTop: 10, width: "100%", padding: "18px 0", borderRadius: 40, border: "none", background: C.orange, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(255,140,0,0.25)",}}>
          Confirm
        </button>
      </div>


      {/* RIGHT IMAGE */}

      <div className="illustration-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "40px", overflow: 'hidden' }}>
        <img src="/img/Intreduce%20Yourself%20Page.png" alt="Introduce Yourself Illustration" style={{ width: "100%", maxWidth: "450px", height: "auto", minHeight: "280px", objectFit: "cover", display: "block" }}/>
      </div>


      {/* Responsive CSS */}

      <style>{`
        @media (max-width: 992px) {
          .introduce-container {
            flex-direction: column !important;
            padding: 40px 20px !important;
            justify-content: center !important;
            overflow: hidden;
          }
          .illustration-container {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100% !important;
            margin-left: 0 !important;
            margin-bottom: 0 !important;
            z-index: 1 !important;
            opacity: 0.12 !important;
            pointer-events: none;
          }
          .content-side {
            max-width: 360px !important;
          }
          img[alt="Introduce Yourself Illustration"] {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            max-width: none !important;
          }
          .title-responsive {
            font-size: 24px !important;
            margin-bottom: 20px !important;
            text-align: center !important;
          }
          .role-card {
            padding: 12px !important;
            margin-bottom: 10px !important;
            border-radius: 12px !important;
          }
          .role-card div:nth-child(2) {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }
          .role-card div:nth-child(3) {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          button {
            padding: 14px 0 !important;
            font-size: 15px !important;
            margin-top: 15px !important;
          }
        }

        @media (min-width: 993px) {
           .introduce-container {
             justify-content: space-between !important;
             padding: 60px 80px !important;
           }
           .content-side {
             max-width: 540px !important;
           }
           .illustration-container img {
             max-width: 580px !important;
           }
           .title-responsive {
             font-size: 42px !important;
           }
           .role-card {
             padding: 24px !important;
           }
        }

      .role-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 28px rgba(0,0,0,0.18);
        }
      `}</style>
    </div>
  );
}