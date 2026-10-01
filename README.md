# Utility Tools 🛠️

A modern, fast, and privacy-first all-in-one web utility application built with **React 19**, **Vite 8**, **TypeScript**, and **Tailwind CSS v4**. All processing is executed **100% client-side** in your browser without uploading your files to any external backend server.

---

## ✨ Features & Tools

### 1. 💬 Fake WhatsApp Chat Generator
- **Realistic UI**: Simulation of WhatsApp chat interface with status bar, header, avatar, and background.
- **Dynamic Messaging**: Create sender & receiver messages with custom timestamps, read receipts (blue ticks, double ticks, clock), and media attachments.
- **Export to Image**: Export screenshot of the chat preview directly to high-quality **PNG** using `html-to-image`.
- **JSON Backup & Presets**: Export and import complete chat configurations via JSON for easy sharing and restoring.

### 2. 🖼️ Image Converter & Optimizer
- **Multi-Format Support**: Convert between `PNG`, `JPG / JPEG`, `WEBP`, `AVIF`, `BMP`, `ICO`, and more.
- **Quality & Size Control**: Adjust compression quality and resize dimensions on the fly.
- **Batch Processing**: Convert multiple images simultaneously and download them individually or bundled in a **ZIP** archive (`jszip`).

### 3. 📄 Photo to PDF Converter
- **Multi-Image Merging**: Combine multiple photos into a single PDF document using `pdf-lib`.
- **Custom Layouts**: Customize page orientation (Portrait / Landscape), margins, and page sizes (A4, Letter, etc.).
- **Page Reordering**: Easily reorder images before generating the final PDF.

### 4. ✂️ Split PDF
- **Flexible Splitting**: Extract specific pages or page ranges from any PDF document.
- **Instant Browser Processing**: Fast parsing and extraction without server delays.
- **ZIP Download**: Save separated pages individually or bundled into a single ZIP file.

### 5. 🌓 Dark & Light Mode
- Seamless theme switching with high-contrast dark theme and clean light theme powered by Tailwind CSS v4 variables and `localStorage` persistence.

---

## 🛠️ Tech Stack

- ⚡ **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 8](https://vitejs.dev/)
- 🎨 **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- 🛣️ **Routing**: [React Router v7](https://reactrouter.com/)
- 🗂️ **Libraries**:
  - `pdf-lib` - Client-side PDF manipulation & generation
  - `html-to-image` - DOM-to-canvas rendering for chat snapshots
  - `jszip` - In-browser ZIP archive compression
  - `lucide-react` - Modern iconography

---

## 📁 Folder Structure

```text
Utility-Tools/
├── public/              # Static assets & favicon
├── scripts/
│   └── make-page.js     # CLI generator for creating pages & routes automatically
├── src/
│   ├── assets/          # Static images and icons
│   ├── components/      # UI & Feature Components
│   │   ├── fakeChat/    # Fake WhatsApp Chat components (Header, Preview, JSON Modal, etc.)
│   │   └── ui/          # Core UI layout components (Header, Sidebar, Layout)
│   ├── constants/       # Global constants, router definitions, and menu items
│   │   ├── listed.ts        # App route paths definition
│   │   ├── router.tsx       # React Router setup
│   │   └── sidemenuItems.tsx# Sidebar navigation items
│   ├── context/         # Global AppContext (Theme management)
│   ├── hooks/           # Reusable custom React hooks
│   ├── pages/           # Application views (Dashboard, FakeChat, ImageConverter, PhotoToPDF, SplitPDF)
│   ├── types/           # TypeScript interfaces and types
│   ├── utils/           # Helper utilities (image conversion, pdf processing, json helpers)
│   ├── App.tsx          # Root Router Provider
│   ├── index.css        # Tailwind v4 theme & custom utilities
│   └── main.tsx         # Application entry point
├── vercel.json          # Vercel SPA rewrite configuration
├── package.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 18+ recommended)
- **pnpm** (recommended) or **npm** / **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Biyu-aja/Utility-Tools.git
   cd Utility-Tools
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   pnpm build
   # or
   npm run build
   ```

---

## 🌐 Deployment (Vercel)

This project includes a `vercel.json` configuration file with rewrite rules to ensure Single Page Application (SPA) routing works properly upon browser refresh:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy:
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into [Vercel](https://vercel.com).
3. The build command (`vite build`) and output directory (`dist`) will be automatically detected.

---

## ⚡ CLI Page Generator

You can quickly scaffold a new utility page, route, and sidebar menu item using the built-in generator:

```bash
# Basic generator
pnpm make:page MyTool

# With custom Lucide icon
pnpm make:page MyTool -- --icon Wrench
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
