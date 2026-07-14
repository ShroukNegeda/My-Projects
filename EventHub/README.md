# EventHub

<div align="center">

![EventHub Logo](public/img/logo.png)

**A full-stack event management platform connecting organizers, speakers, sponsors, and attendees.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Laravel](https://img.shields.io/badge/Backend-Laravel-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)

</div>

---

## 📌 About the Project:

**EventHub** is a modern event management web application that brings together the entire event ecosystem in one platform. Whether you're an organizer creating unforgettable experiences, a speaker sharing your expertise, a sponsor growing your brand, or an attendee discovering exciting events — EventHub has everything you need.

The platform is built with a clean, responsive UI using **Next.js 16 (App Router)** on the frontend, connected to a **Laravel REST API** backend deployed at `https://eventhub.huma-volve.com/api/v1`.

---

## ✨ Features:

### 👤 For Attendees:
- Browse and search events by category, location, and keyword.
- Book tickets with Vodafone Cash payment integration.
- Save favorite events and manage your wishlist.
- View and download your booked tickets with QR codes.
- User profile with photo upload and editable info.

### 🎤 For Speakers:
- Apply to speak at events with session proposals.
- Dedicated speaker dashboard showing all sessions.
- Track session titles, formats, durations, and venues.

### 🤝 For Sponsors:
- Browse sponsorship tiers (Bronze, Silver, Gold).
- Select and confirm sponsorship packages for events.
- Sponsor dashboard with charts showing sponsored events.

### 🗓️ For Organizers:
- Create and manage events with full details (title, location, tickets, speakers, sponsors).
- Upload event cover images.
- Sales Growth and Payouts charts based on real data.
- Edit or delete events directly from the dashboard.
- View all registered speakers and sponsors per event.

### 🛡️ For Admins:
- Dedicated admin panel to review all role-based signup requests.
- Approve or reject Organizer / Speaker / Sponsor applications.
- View full applicant profile details before making a decision.
- Real-time status updates — applicants see pending/rejected/approved instantly.

### 🔐 Authentication & Security:
- JWT token-based authentication.
- Role-based access control (Attendee, Organizer, Speaker, Sponsor, Admin).
- Pending approval system — role accounts require admin approval before access.
- Forgot password flow with OTP verification via email.
- Auto-logout on session expiry.

---

## 🛠️ Tech Stack:

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, App Router |
| **Styling** | Inline styles + CSS Modules, Poppins font |
| **Charts** | Recharts |
| **Icons** | React Icons |
| **HTTP Client** | Native Fetch API with custom wrapper |
| **Backend** | Laravel (REST API) |
| **Auth** | JWT Bearer Tokens |
| **State** | React Context API |

---

## 🗂️ Project Structure:

```
eventhub-next/
├── app/
│   ├── landing/               # Landing page with trending events
│   ├── events/                # Browse all events
│   ├── event-detail/          # Single event detail & booking
│   ├── my-tickets/            # Booked tickets with QR codes
│   ├── favorites/             # Saved events
│   ├── profile/               # User profile
│   ├── login/                 # Login page
│   ├── signup/                # Attendee signup
│   ├── forgot-password/       # Password recovery
│   ├── confirm-email/         # OTP verification & password reset
│   ├── organizer-dashboard/   # Organizer control panel
│   ├── speaker-dashboard/     # Speaker sessions view
│   ├── sponsor-dashboard/     # Sponsor events & charts
│   ├── admin-dashboard/       # Admin approval panel
│   ├── create-event/          # Create / edit events
│   ├── organizer-signup-1/2/3/  # Multi-step organizer registration
│   ├── speaker-signup-1/2/3/    # Multi-step speaker registration
│   ├── sponsor-signup-1/2/3/    # Multi-step sponsor registration
│   ├── pending-screen/        # Awaiting admin approval screen
├── components/
│   ├── NavBar.jsx             # Responsive navigation
│   ├── SidebarLayout.jsx      # Dashboard sidebar
│   ├── AuthGuardModal.jsx     # Login prompt modal
│   ├── AuthLayout.jsx         # Auth pages layout
│   ├── Input.jsx              # Form input component
│   ├── Select.jsx             # Dropdown select
│   └── StepProgress.jsx       # Multi-step progress bar
├── context/
│   └── AppContext.jsx         # Global state (user, token, favorites, tickets)
├── lib/
│   ├── api.js                 # All API calls to backend
│   ├── apiFetchTrack.js       # Global fetch tracker for loading states
│   └── eventDeleteHelpers.js  # Event ownership & delete helpers
└── constants/
    └── styles.js              # Shared color palette & style tokens
```

---

## 🚀 Getting Started:

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/eventhub-next.git
cd eventhub-next

# Install dependencies
npm install

# Run development server
npm run dev
```

Open (http://localhost:3000) or (https://event-hub-flame.vercel.app/landing) in your browser.

### Environment Variables (Optional)

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_BASE=https://eventhub.huma-volve.com/api/v1
```

---

## 🔗 API:

The frontend connects to a Laravel REST API at:
```
https://eventhub.huma-volve.com/api/v1
```

Key endpoints include:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/register` | Register (any role) |
| `POST` | `/auth/forgot-password` | Send OTP to email |
| `POST` | `/auth/verify-otp` | Verify OTP code |
| `POST` | `/auth/reset-password` | Reset password |
| `GET` | `/events` | List all events |
| `GET` | `/events/{id}` | Single event detail |
| `POST` | `/events` | Create event (Organizer) |
| `PUT` | `/events/{id}` | Update event |
| `DELETE` | `/events/{id}` | Delete event |
| `POST` | `/bookings` | Book tickets |
| `GET` | `/my-tickets` | My booked tickets |
| `POST` | `/favorites/toggle/{id}` | Toggle favorite |
| `GET` | `/favorites` | My favorites |
| `POST` | `/speaker/apply` | Speaker session proposal |
| `GET` | `/sponsor/packages` | Sponsorship tiers |
| `POST` | `/sponsor/select` | Select package |
| `GET` | `/admin/pending-users` | Admin: pending requests |
| `POST` | `/admin/users/{id}/status` | Admin: approve/reject |

---

## 👥 User Roles:

| Role | Access |
|---|---|
| **Attendee** | Browse events, book tickets, favorites, profile |
| **Organizer** | All attendee access + create/manage events, dashboard |
| **Speaker** | All attendee access + apply for sessions, speaker dashboard |
| **Sponsor** | All attendee access + sponsor events, sponsor dashboard |
| **Admin** | Approve/reject role requests, admin panel |

> **Note:** Organizer, Speaker, and Sponsor accounts require admin approval before gaining access. After signup, users see a "Request Under Review" screen until approved.

---

## 🎥 System Demo Videos

### 👤 User
[![Watch Demo](https://img.youtube.com/vi/knpIGqOn93c/0.jpg)](https://www.youtube.com/watch?v=knpIGqOn93c)

### 🗂️ Organizer
[![Watch Demo](https://img.youtube.com/vi/hZdLf00IKtA/0.jpg)](https://www.youtube.com/watch?v=hZdLf00IKtA)

### 🎤 Speaker
[![Watch Demo](https://img.youtube.com/vi/XoPdNPYMzAc/0.jpg)](https://www.youtube.com/watch?v=XoPdNPYMzAc)

### 🤝 Sponsor
[![Watch Demo](https://img.youtube.com/vi/BrWrKdj-qpY/0.jpg)](https://www.youtube.com/watch?v=BrWrKdj-qpY)


## 📄 License:

This project was developed as a Final Year Project.

---

## 👩‍💻 Developer

<p align="center">

<img src="public/img/shrouk...jpg" width="120" />
<img src="public/img/arwa.jpg" width="120" />

</p>

<p align="center">
<b>Shrouk Negeda & Arwa Mohamed</b><br/>
Final Year Managment Information System Project
</p>

## 🔗 Connect With Me

<p align="center">

<a href="https://github.com/ShroukNegeda">
  <img src="https://img.shields.io/badge/%20Visit%20My%20GitHub-Connect%20with%20me-ff7a18?style=for-the-badge&logo=github&logoColor=white" />
</a>

</p>

<p align="center">
  🔗 Connect with me
</p>

---

<div align="center">
  Made with ❤️ using Next.js & Laravel
</div>
