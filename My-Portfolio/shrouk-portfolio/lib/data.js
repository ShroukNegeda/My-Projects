export const profile = {
  name: "Shrouk Negeda",
  role: "Frontend Developer",
  subrole: "Systems & Management Information Student",
  location: "Cairo, Egypt",
  email: "sh.ta.3366@gmail.com",
  phone: "+20 100 869 0906",
  github: "https://github.com/ShroukNegeda",
  githubUser: "ShroukNegeda",
  linkedin: "https://www.linkedin.com/in/shrouk-negeda-798a8927b/",
  vercel: "https://vercel.com/shrouknegedas-projects",
  blurb:
    "I build clean, fast, accessible interfaces - then spend the second half of every day making sure they actually feel good to use.",
  bio: "Motivated frontend developer and Systems & Management Information student at El Shorouk Academy. I've completed two intensive frontend training programs and shipped 15+ projects in HTML5, CSS3, JavaScript and SCSS. Outside the editor, I've spent three years in progressive leadership roles at IEEE - most recently as Head of HR - running recruitment, onboarding and team management for a 20+ person student branch.",
};

export const education = {
  degree: "B.Sc. Systems & Management Information",
  school: "El Shorouk Academy",
  period: "2022 - 2026",
};

export const skills = [
  {
    category: "Languages & Markup",
    items: ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript (basic)", "JSON"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["React.js", "Bootstrap 5", "jQuery", "Flexbox", "CSS Grid"],
  },
  {
    category: "Tools & Platforms",
    items: ["Git & GitHub", "VS Code", "npm / Node.js", "Figma (basic)", "REST APIs"],
  },
  {
    category: "Working Style",
    items: [
      "Team Leadership",
      "Communication",
      "Time Management",
      "Fast Learner",
      "Decision Making",
      "Works Under Pressure",
    ],
  },
];

export const experience = [
  {
    role: "Head of Human Resources",
    org: "IEEE - El Shorouk Academy Branch",
    period: "Oct 2024 - May 2025",
    points: [
      "Led end-to-end recruitment for 20+ new student members per cycle",
      "Designed onboarding that cut new-member ramp-up time by 30%",
      "Organized 2 internal events focused on member engagement",
    ],
  },
  {
    role: "Human Resources Member",
    org: "IEEE - El Shorouk Academy Branch",
    period: "Oct 2023 - Oct 2024",
    points: [
      "Supported recruitment drives that grew branch membership by 15%",
      "Coordinated member relations and helped plan 2+ branch events",
      "Maintained HR records and performance tracking for 10+ members",
    ],
  },
  {
    role: "Non-Technical Member",
    org: "IEEE - El Shorouk Academy Branch",
    period: "Oct 2022 - May 2023",
    points: [
      "Contributed to event planning and logistics for 4 technical workshops",
      "Collaborated across teams to ensure smooth event execution",
    ],
  },
];

export const courses = [
  { name: "AI for you", org: "Oracle University", date: "Aug 2026" },
  { name: "Introduction to Cyber Security", org: "Cisco", date: "Jul 2026" },
  { name: "Frontend", org: "Elevvo", date: "Mar 2026" },
  { name: "Frontend Diploma", org: "Route Academy", date: "Feb 2026" },
  { name: "Artificial Intelligence", org: "IMPACT x BUE", date: "Feb 2025" },
  { name: "Cyber Security", org: "IMPACT x BUE", date: "Nov 2024" },
  { name: "HTML5", org: "Coursera", date: "Sep 2024" },
  { name: "HTML & CSS", org: "Mahara-Tech", date: "Aug 2024" },
  { name: "Presentation Skills", org: "El Shorouk Academy", date: "Jun 2023" },
];

export const events = [
  { name: "TechTalks", org: "IEEE", date: "Apr 2025" },
  { name: "Electrovision", org: "IEEE", date: "Dec 2024" },
  { name: "YLF Competition", org: "IEEE", date: "Sep 2024" },
];

export const featuredProjects = [
  {
    slug: "freshcart",
    name: "FreshCart",
    description: "A full e-commerce storefront with product browsing, categories, brands, cart, wishlist, auth and order flows, built during the Route Academy training.",
    longDescription: "FreshCart is a fully functional e-commerce web app built with React and a live REST API. It covers the complete shopping experience — browsing products by category or brand, adding items to a wishlist, managing a cart, authenticating with JWT, and placing orders. The project was the capstone of the Route Academy frontend diploma.",
    tags: ["React", "REST API", "Auth"],
    tech: ["React", "React Router", "Axios", "JWT Auth", "Bootstrap 5", "REST API"],
    highlights: [
      "JWT-based authentication with protected routes",
      "Cart and wishlist synced with the API in real time",
      "Product filtering by category and brand",
      "Full order placement and history flow",
    ],
    url: "https://route-academy-tasks.vercel.app/",
    github: "https://github.com/ShroukNegeda/Route-Academy-Tasks/tree/main/Final-Project",
    image: "/images/projects/freshcart.png",
  },
  {
    slug: "eventhub",
    name: "EventHub",
    description: "An events platform for discovering, favoriting and managing tickets for events, with a dedicated creation flow for organizers.",
    longDescription: "EventHub is a React-based events platform where users can browse upcoming events, save favorites, manage their tickets, and organizers can create and publish new events. Built with a live REST API and a clean, responsive UI.",
    tags: ["React", "REST API"],
    tech: ["React", "React Router", "Axios", "REST API", "Bootstrap 5"],
    highlights: [
      "Event discovery with search and category filters",
      "Favorites and ticket management per user",
      "Dedicated organizer flow for creating events",
      "Fully responsive layout",
    ],
    url: "https://my-projects-sandy-one.vercel.app/landing",
    github: "https://github.com/ShroukNegeda/My-Projects/tree/main/EventHub",
    image: "/images/projects/eventhub.png",
  },
  {
    slug: "pure-glow",
    name: "Pure Glow",
    description: "A skincare & beauty e-commerce landing page with a product catalog, detail pages, ratings and a brand story section.",
    longDescription: "Pure Glow is a skincare and beauty e-commerce front end built with React. It features a full product catalog, individual product detail pages with ratings and reviews, a brand story section, and a clean UI focused on the beauty niche.",
    tags: ["React", "E-commerce", "UI/UX"],
    tech: ["React", "React Router", "CSS Modules", "Responsive Design"],
    highlights: [
      "Product catalog with detail pages and ratings",
      "Brand story and about section",
      "Clean, beauty-focused UI design",
      "Fully responsive across all screen sizes",
    ],
    url: "https://my-projects-eosin-tau.vercel.app/",
    github: "https://github.com/ShroukNegeda/My-Projects/tree/main/Pure%20Glow",
    image: "/images/projects/pure-glow.png",
  },
  {
    slug: "booknest",
    name: "BookNest",
    description: "A React project for browsing and organizing books, built as part of a frontend training curriculum.",
    longDescription: "BookNest is a React application for browsing and organizing a collection of books. Users can view book listings, see details for each title, and manage their reading list. Built as part of a structured frontend training program.",
    tags: ["React", "JavaScript"],
    tech: ["React", "React Router", "JavaScript (ES6+)", "CSS3"],
    highlights: [
      "Book browsing with detail view per title",
      "Reading list management",
      "Component-based architecture",
      "Clean and minimal UI",
    ],
    url: "https://fourth-react-project.vercel.app/",
    github: "https://github.com/ShroukNegeda/ITI-Tasks/tree/master/18-%20Fourth%20React%20Project/book-app",
    image: "/images/projects/booknest.png",
  },
];

export const fallbackProjects = [
  {
    name: "Pizza / Recipe Finder",
    description:
      "A recipe search app built on the Forkify API with async data fetching, loading states and a card-based results grid.",
    tags: ["React", "REST API", "Axios"],
    url: "https://github.com/ShroukNegeda",
  },
  {
    name: "JavaScript Training Projects",
    description:
      "Six progressive assignments covering DOM manipulation, ES6+ features and event handling, styled with a modular SCSS architecture.",
    tags: ["JavaScript", "SCSS", "DOM"],
    url: "https://github.com/ShroukNegeda",
  },
  {
    name: "Frontend Training Builds",
    description:
      "Five-plus responsive interfaces from Route Academy and Elevvo, built with semantic HTML, Flexbox/Grid and Bootstrap components.",
    tags: ["HTML5", "CSS3", "Bootstrap"],
    url: "https://github.com/ShroukNegeda",
  },
];
