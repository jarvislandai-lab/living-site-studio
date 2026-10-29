# Living Site Studio

Build a full-stack, responsive AI Website & Application Builder platform (inspired by Lovable, Bolt.new, and v0). 

### 🎯 CORE ARCHITECTURE & FEATURES TO IMPLEMENT

1. SPLIT-SCREEN WORKSPACE LAYOUT:
   - Left Panel (Chat & Controls): 
     • Interactive AI Prompt Box with model selector (Gemini 3.5 Flash, Claude 3.5 Sonnet, GPT-4o).
     • Step-by-step AI progress status stream (Parsing Prompt ➔ Generating Component Tree ➔ Applying CSS ➔ Compiling Preview).
     • Quick starter templates (e.g., "SaaS Analytics Dashboard", "E-Commerce Storefront", "Kanban Board").
     • File Tree Explorer (displays virtual files like /src/App.tsx, /src/components/Navbar.tsx, /src/pages/Dashboard.tsx).
   - Right Panel (Live Preview & Code Canvas):
     • Dual Tabs: "Live Preview" and "Code Editor".
     • Multi-Device Viewport Switcher (Desktop, Tablet, Mobile iPhone frame).
     • Interactive Element Inspector simulation and Console Logs drawer.

2. VIRTUAL MULTI-FILE CODE GENERATION:
   - Cleanly modularize generated web applications into separate files inside a virtual workspace file store.
   - When given a prompt, create dedicated components (`Navbar.tsx`, `Hero.tsx`, `FeatureGrid.tsx`, `CartDrawer.tsx`, `types.ts`).
   - Allow clicking any file tab to view and edit its code in a syntax-highlighted code panel.

3. REAL-TIME INTERACTIVE CANVAS:
   - Provide full interactive state inside the Live Preview iframe (working buttons, modal toggles, search/filter inputs, shopping cart counter, theme switchers).
   - Support dynamic iterative prompts (e.g., typing "Add emerald theme" or "Switch to Kanban view" updates the rendered application instantly).

4. LUXURY DESIGN SYSTEM & UX:
   - Use Tailwind CSS with dark glassmorphism styling, violet/cyan glowing accents, clean typography, and Lucide React icons.
   - Make the UI fully responsive so it looks and works seamlessly on both mobile devices and desktop screens.

Start by creating the workspace layout, virtual file system state, and default active project!

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://living-site-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6262a7cc-aebf-4629-98e0-f77ecb2704a1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
