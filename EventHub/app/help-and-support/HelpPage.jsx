'use client';
import { C } from "../../constants/styles";
import { HiOutlineArrowLeft } from "react-icons/hi";

export default function HelpSupport({ setPage }) {
  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "40px auto", fontFamily: "Poppins, sans-serif", padding: 20, boxSizing: "border-box",}}>

      {/* Back Arrow */}
      <div onClick={() => setPage("landing")} style={{ cursor: "pointer", marginBottom: 24, color: C.navy,}}>
        <HiOutlineArrowLeft size={24} />
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: C.navy,}}>
        Help & Support
      </h1>

      {/* Content */}
      <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginBottom: 16,}}>
        We are here to help you at any time. If you experience any issues
        while using EventHub or have any questions or suggestions,
        please feel free to contact us.
      </p>

      <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginBottom: 16,}}>
        Our support team is committed to responding to all inquiries
        as quickly as possible to ensure the best experience for you.
      </p>

      <p style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 8,}}>
        Contact us via email:
      </p>

      <a href="mailto:eventhub.support138@gmail.com" style={{ fontSize: 14, color: C.orange, fontWeight: 600, textDecoration: "none",}}>
        eventhub.support138@gmail.com
      </a>
    </div>
  );
}