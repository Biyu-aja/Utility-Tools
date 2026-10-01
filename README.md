# FE-RTTS-BP 🚀
### Frontend React TypeScript Tailwind v4 Starter Boilerplate

A modern, clean, and modular boilerplate for web frontend development built with **React 19**, **Vite 8**, **TypeScript**, **Tailwind CSS v4**, and **React Router v7**. This project includes a dark mode system, modular layout structure, and a built-in **CLI Generator** to automatically scaffold pages, routes, and sidebar navigation in seconds.

---

## 🛠️ Tech Stack & Key Features

- ⚡ **Vite 8** - Ultra-fast build tool with instant Hot Module Replacement (HMR).
- ⚛️ **React 19** - The latest stable release of React.
- 📘 **TypeScript** - Full static typing and type safety.
- 🎨 **Tailwind CSS v4** - Next-generation utility-first styling with `@tailwindcss/vite` and CSS variables.
- 🌓 **Light & Dark Mode** - Clean white light theme by default with smooth dark mode toggle & `localStorage` persistence.
- 🛣️ **React Router v7** - Centralized client-side routing with nested layout support.
- 🛠️ **CLI Page Generator** - Automated command (`make:page`) to generate page components, routes, and sidemenu entries instantly.
- 🗂️ **Modular Architecture** - Separated Layout, Header, Sidebar, Context, Constants, Services, and Hooks.

---

## 📁 Folder Structure

```text
FE-RTTS-BP/
├── scripts/
│   └── make-page.js     # CLI generator for creating pages & routes automatically
├── src/
│   ├── assets/          # Static assets like images, logos, and icons
│   ├── components/      # Reusable components
│   │   └── ui/          # Core UI components (Header, Sidebar, Layout)
│   ├── constants/       # Global constants, router configurations, and menus
│   │   ├── listed.ts        # Route path definitions (AppRoutes)
│   │   ├── router.tsx       # React Router route definitions
│   │   └── sidemenuItems.tsx# Sidebar navigation items and Lucide icons
│   ├── context/         # React Context for global state (Theme & User)
│   ├── hooks/           # Reusable custom React hooks (e.g. useFetch)
│   ├── pages/           # Application pages (Dashboard, Settings, Analytics, etc.)
│   ├── services/        # API client and HTTP services
│   ├── types/           # TypeScript interfaces and type definitions
│   ├── utils/           # Helper utility functions (formatting, dates, etc.)
│   ├── App.css          # App-wide global stylesheet
│   ├── App.tsx          # Router Provider Entry Point
│   ├── index.css        # Tailwind v4 theme variables (light & dark)
│   └── main.tsx         # Application root mount point
├── package.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 18 or above recommended)
- Package manager: **pnpm** (recommended), **npm**, or **yarn**.

### Installation Steps

1. **Clone or navigate into the repository**:
   ```bash
   cd FE-RTTS-BP
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 💻 Available Scripts

| Script | Description |
| :--- | :--- |
| `pnpm dev` / `npm run dev` | Starts the Vite local development server. |
| `pnpm make:page` / `npm run make:page` | **CLI Generator**: Automatically scaffolds a new page, route, and sidebar menu item. |
| `pnpm build` / `npm run build` | Compiles TypeScript and builds production bundle in `dist/`. |
| `pnpm preview` / `npm run preview` | Previews the production build locally. |
| `pnpm lint` / `npm run lint` | Runs ESLint code checks. |

---

## ⚡ CLI Page Generator

You can generate a new page, register its route, and add it to the sidebar navigation with a single command!

### 1. Direct Command (Default icon: `LayoutDashboard`)
```bash
pnpm make:page Settings
# or
npm run make:page Settings
```

### 2. With Custom Lucide Icon
```bash
pnpm make:page Analytics -- --icon BarChart3
# or
npm run make:page Analytics -- --icon BarChart3
# or
node scripts/make-page.js Analytics --icon BarChart3
```

### 3. Interactive Mode
Run the command without arguments to enter interactive prompt:
```bash
pnpm make:page
```

**What the CLI does automatically:**
1. Creates `src/pages/<PageName>.tsx` with a clean boilerplate component.
2. Registers the route in `src/constants/listed.ts` (`AppRoutes`).
3. Adds the route and import in `src/constants/router.tsx`.
4. Adds the navigation item and imports the Lucide icon in `src/constants/sidemenuItems.tsx`.

---

## 🎨 Theme & Dark Mode

The project comes with a built-in theme manager in `src/context/AppContext.tsx`:
- **Default Theme**: Light mode (clean `#ffffff` background).
- **Dark Mode**: High-contrast dark palette configured in `src/index.css`.
- **Toggle Button**: Located on the top-left side of the header.
- **Persistence**: Automatically remembers user preference in `localStorage`.

To use the theme in your own components:
```tsx
import { useApp } from '../context/AppContext'

export function MyComponent() {
  const { theme, toggleTheme } = useApp()

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

---

## 🧱 Layout Components

The layout is divided into dedicated, clean components inside `src/components/ui/`:
- **`header.tsx`**: Top navigation containing the dark mode toggle, app title, and user indicator.
- **`sidebar.tsx`**: Side navigation menu rendering items from `src/constants/sidemenuItems.tsx`.
- **`layout.tsx`**: Main application shell wrapping the header, sidebar, and `<Outlet />`.
