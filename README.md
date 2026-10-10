# Robotshow Indonesia — Official AgiBot Talent Platform

> High-performance, Awwwards-caliber digital experience and fleet management platform for **Robot Future Indonesia** ([robotshow.id](https://robotshow.id)). Showcases official AgiBot humanoid robots and quadrupeds for commercial exhibitions, VIP hospitality, product unveils, and custom stage choreographies.

---

## Overview

Robotshow.id is an editorial-grade web application engineered to demonstrate the real physical presence, joint kinematics, and choreographic capabilities of the AgiBot fleet. Built with pure performance and craft in mind, the platform delivers 60fps WebGL rendering, kinetic smooth scroll choreography, and interactive 3D simulation across desktop and mobile devices.

### Core Features

- **Kinetic 3D Hero & Studio Presentation:** Real-time Three.js WebGL scene featuring AgiBot X2 Ultra, dynamic studio lighting, interactive mouse parallax, and scroll-linked camera pull-back transitions.
- **Interactive 3D Casting Room (`/casting/`):** Standalone 3D kinematics simulator with 30 DoF URDF joint controls, choreographic dance emotes (*wave*, *cheer*, *point*), and facial LED mood expressions.
- **Editorial Event Concierge:** Bespoke quiet luxury inquiry liaison with zero neon/AI slop. Provides accurate fleet comparisons, technical riders, and pre-formatted WhatsApp booking dispatch.
- **Trilingual Localization:** Seamless real-time language switching between Bahasa Indonesia (`ID`), English (`EN`), and Chinese (`ZH`).
- **Dedicated Robot Datasheets (`/robot/:id/`):** Multi-entry static page generation for individual fleet riders (`x2-ultra`, `a2-ultra`, `a2-lite`, `d1-pro`) with OpenGraph metadata for WhatsApp link previews.
- **PDF Deck Generator:** Automated headless presentation generator (`scripts/build-presentation.mjs`) producing publication-grade client pitch decks.

---

## Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Core** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Component architecture & ultra-fast HMR build pipeline |
| **3D & Graphics** | [Three.js](https://threejs.org/) + [Meshoptimizer](https://github.com/zeux/meshoptimizer) | WebGL rendering, PBR materials, and meshopt-compressed models |
| **Animation & Scroll** | [GSAP 3](https://gsap.com/) + [Lenis](https://lenis.darkroom.engineering/) | Hardware-accelerated ScrollTrigger pinning and inertial smooth scroll |
| **Design Language** | Vanilla CSS + CSS Custom Properties | Double-bezel ("Doppelrand") architecture, dark studio palette |
| **Typography** | Playfair Display / Cormorant Garamond + Inter Tight + IBM Plex Mono | High-contrast editorial type pairing with monospace metadata |
| **Icons** | [Lucide React](https://lucide.dev/) | Minimalist, ultra-light glyph line system |
| **Linting & Quality** | [Oxlint](https://oxc.rs/) | Rust-powered high-speed linter enforcing clean React patterns |

---

## Project Structure

```text
robot/
├── casting/                      # Standalone 3D Casting Room entry point
│   └── index.html
├── docs/                         # Specifications & creative direction
│   ├── design-spec.md
│   └── prompts-video-story.md
├── media/                        # Source 3D URDF assets, bakes, and footage
│   ├── a2-urdf/
│   ├── x2-urdf/
│   └── footage/
├── public/                       # Static public assets
│   ├── assets/robots/            # High-resolution cutouts & model textures
│   ├── fonts/                    # Self-hosted web fonts
│   └── models/                   # Meshopt-compressed GLB binary models
├── scripts/                      # Build & automation scripts
│   ├── build-robot-model.mjs     # GLTF transform & meshoptimizer pipeline
│   ├── build-a2-model.mjs        # A2 URDF to GLB converter
│   ├── build-presentation.mjs    # Puppeteer PDF presentation compiler
│   └── shoot.mjs                 # Headless design QA screenshot tool
├── src/                          # Application source code
│   ├── components/               # UI components (Hero, Talent, ConciergeBot, etc.)
│   ├── config/                   # Site config, WhatsApp endpoints, and metadata
│   ├── context/                  # Trilingual LanguageContext (ID, EN, ZH)
│   ├── data/                     # Fleet datasheets, specs, and comp cards
│   ├── three/                    # Three.js loaders, rigs, and shader materials
│   ├── utils/                    # Geometry and math helpers
│   ├── App.jsx                   # Home page application root
│   ├── casting.jsx               # Casting Room application root
│   └── robot.jsx                 # Individual robot datasheet application root
├── PRESENTASI_WEB_ROBOTSHOW_ID.pdf  # Compiled official pitch deck
├── index.html                    # Main landing page template
├── robot.html                    # Dynamic robot rider template
├── vite.config.js                # Multi-entry build configuration
└── package.json                  # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or higher (Node v20+ recommended)
- **npm:** v9.0.0 or higher
- **Google Chrome:** (Optional, required only for running PDF build or headless QA scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/reyrs/robotfutureindonesia.git

# Enter project directory
cd robotfutureindonesia

# Install dependencies
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

Visit `http://localhost:5173/` in your browser.

- Home Page: `http://localhost:5173/`
- 3D Casting Room: `http://localhost:5173/casting/`
- Robot Specification Pages: `http://localhost:5173/robot/x2-ultra/`

---

## Production Build

To build the static production distribution:

```bash
npm run build
```

This compiles all HTML entry points (`dist/index.html`, `dist/casting/index.html`, and `dist/robot/:id/index.html`) with tree-shaken chunks, compressed assets, and minified bundles.

To preview the production build locally:

```bash
npm run preview
```

### Code Quality & Linting

Verify lint rules with Oxlint:

```bash
npm run lint
```

---

## Fleet Specifications Summary

| Model | Height | Weight | Degrees of Freedom | Max Speed | Recommended Role |
|---|---|---|---|---|---|
| **AgiBot X2 Ultra** | 131 cm | 39 kg | 30 DoF | 1.8 m/s | Synchronized stage choreography, VIP reveals |
| **AgiBot A2 Ultra** | 169 cm | 69 kg | 32 DoF | 1.2 m/s | Keynote presentations, corporate unveilings |
| **AgiBot A2 Lite** | 169 cm | 64 kg | 23 DoF | 0.8 m/s | Entrance greeting, exhibition booth hospitality |
| **AgiBot D1 Pro** | 45 cm | 15 kg | Quadruped | 3.5 m/s | Dynamic sprints, crowd engagement, expo attractions |

*All fleet rentals include certified on-site technical operators and safety perimeter protocols.*

---

## License

Private & Confidential — © 2026 PT Robot Future Indonesia (Robotshow.id). All rights reserved.
