export const C = {
  navy: "#1a1f5e",
  orange: "#f5821f",
  bg: "#f8fafc",
  white: "#ffffff",
  gray: "#6b7280",
  lightGray: "#9ca3af",
  border: "#e5e7eb",
  cardBg: "#f0f2f7",
  green: "#22c55e",
  amber: "#f59e0b",
};

export const S = {
  page: {
    background: C.bg,
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    color: C.navy,
    margin: 0
  },


  /* ================= AUTH ================= */

  authWrap: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
    background: C.bg
  },

  authLeft: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 80px",
  },

  authRight: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },

  authTitle: {
    fontSize: 38,
    fontWeight: 700,
    color: C.navy,
    marginBottom: 40
  },

  label: {
    fontSize: 13,
    color: C.navy,
    marginBottom: 6,
    display: "block",
    fontWeight: 500
  },

  input: {
    width: "100%",
    padding: "13px 16px",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    background: C.white,
    fontSize: 14,
    color: C.navy,
    outline: "none",
    boxSizing: "border-box",
    transition: "0.2s"
  },

  inputWrap: {
    position: "relative",
    marginBottom: 20
  },

  orangeBtn: {
    width: "100%",
    padding: "14px",
    background: C.orange,
    color: C.white,
    border: "none",
    borderRadius: 30,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10
  },


  /* ================= NAV ================= */

  nav: {
    background: C.white,
    borderBottom: `1px solid ${C.border}`,
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68
  },

  navLink: {
    fontSize: 14,
    color: C.navy,
    textDecoration: "none",
    fontWeight: 500,
    cursor: "pointer",
    padding: "4px 0",
    borderBottom: "2px solid transparent"
  },

  navLinkActive: {
    borderBottom: `2px solid ${C.navy}`
  },


  /* ================= LAYOUT ================= */

  sidebarLayout: {
    display: "flex",
    minHeight: "calc(100vh - 68px)"
  },

  sidebar: {
    width: 240,
    background: C.white,
    borderRight: `1px solid ${C.border}`,
    padding: "24px 0",
    flexShrink: 0
  },

  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 500,
    color: C.navy,
    cursor: "pointer"
  },

  sidebarItemActive: {
    background: C.bg,
    borderLeft: `3px solid ${C.navy}`
  },

  mainContent: {
    flex: 1,
    padding: "40px 48px",
    background: C.bg,
    overflowY: "auto"
  },
  

  /* ================= CARDS ================= */

  statCard: {
    background: C.white,
    borderRadius: 16,
    padding: "24px 28px",
    flex: 1,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
  },

  statLabel: {
    fontSize: 13,
    color: C.gray,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6
  },

  statValue: {
    fontSize: 26,
    fontWeight: 700,
    color: C.navy
  },

  chartCard: {
    background: C.white,
    borderRadius: 16,
    padding: 24,
    flex: 1,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
  },

  eventCard: {
    background: C.white,
    borderRadius: 16,
    padding: 18,
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16
  },

  stepBar: {
    display: "flex",
    gap: 8,
    marginBottom: 32,
    alignItems: "center"
  },

  stepDot: (active) => ({
    height: 6,
    borderRadius: 3,
    flex: 1,
    background: active ? C.navy : "#d1d5db"
  })
};
