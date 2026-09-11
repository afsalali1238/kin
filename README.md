# kinē — Interactive 3D Physiotherapy & Rehabilitation Guide

**kinē** is an interactive, clinical-grade 3D physiotherapy application designed to help individuals assess musculoskeletal discomfort, understand pain mechanisms, and follow adaptive, evidence-informed rehabilitation programs.

Built with **Next.js 16 (App Router)**, **React 19**, **Three.js / React Three Fiber**, **Tailwind CSS**, and **Drizzle ORM / PostgreSQL**.

---

## ✨ Key Features

- **Interactive 3D Anatomical Body Map**:
  - Realistic male & female 3D anatomical models loaded via GLTF/GLB with Three.js / React Three Fiber.
  - Interactive region selection with 31 coarse body regions.
  - Precise single-point pain-pinning (place → confirm) with an NPRS severity slider (0–10).
  - Orbit rotation, zoom, anterior/posterior switching, and fallback 2D viewer.
- **7-Step Clinical Assessment**:
  - Contextual triage covering onset, symptom duration, diurnal patterns, aggravators/easers, irritability, and neurological screening.
  - Automated red-flags detection (e.g. cauda equina, cervical myelopathy, systemic concerns) with safety-first clinical guidance.
  - Pattern matching across 28 clinical presentations with transparent pattern-fit scoring.
- **Personalized Rehabilitation Programs**:
  - 3 progressive phases: **Calm** (find comfort), **Load** (rebuild strength), and **Capacity** (return to life/sport).
  - Tailored to user irritability levels and time commitments (capped to ≤15 mins for maximum adherence).
  - Built-in exercise player with timers, hold indicators, written clinical cues, and voice guidance (Web Speech API).
  - Dynamic exercise swapping for easier/harder variations depending on pain response.
- **Progress Tracking & Daily Check-Ins**:
  - Tracks session completion, pain trends, streaks, and next-morning recovery responses.
- **Dual Language Support (EN & AR)**:
  - Full English and Arabic localization with RTL mirroring.
- **Resilient Offline-First Sync**:
  - Client-side persistence with `localStorage` (works out of the box with zero configuration).
  - Optional seamless cloud sync to PostgreSQL via Drizzle ORM when `DATABASE_URL` is configured.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **3D / WebGL**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: PostgreSQL & [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (Node 22 or 24 recommended)
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd psyyy

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

This project is fully optimized for **Vercel** deployment with zero mandatory configuration:

1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import this repository.
4. Framework Preset will be automatically detected as **Next.js**.
5. *(Optional)* If you want PostgreSQL sync across devices:
   - Add a `DATABASE_URL` environment variable in the Vercel project settings (e.g. from Neon, Supabase, or Vercel Postgres).
   - If omitted, the application seamlessly runs using local browser storage with zero crashes.
6. Click **Deploy**.

---

## 📁 Project Structure

```
├── public/
│   └── models/               # 3D GLB anatomical models (male.glb, female.glb)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/       # Database health-check endpoint
│   │   │   └── recovery/     # Recovery state sync endpoint
│   │   ├── globals.css       # App styles and theme
│   │   ├── layout.tsx        # Root layout with metadata
│   │   └── page.tsx          # Main entry page
│   ├── components/
│   │   ├── body/             # 3D BodyViewer, CameraRig, skin material & region picker
│   │   └── KinesioApp.tsx    # Core application orchestration
│   ├── data/                 # JSON databases: exercises, presentations, rules, regions
│   ├── db/                   # Drizzle ORM schema & database client
│   └── lib/                  # Clinical logic, pattern matching, programme generation
├── DECISIONS.md              # Detailed clinical and product architecture decisions
└── package.json
```

---

## 📄 License

This project is licensed under the MIT License.
