# SplitShare - Premium Bill Splitter

SplitShare is a sleek, clean, and highly responsive web-based bill-splitting calculator. Built using pure HTML5, CSS3, and Vanilla JavaScript, it offers a premium glassmorphic dark-theme interface with zero external framework dependencies.

With SplitShare, you can easily divide a restaurant bill, tax, and tips among friends using either manual shares or item-based proportions, while ensuring tax and tip are distributed fairly and proportionally.

## 🚀 Live Demo & Visuals

The app features:
* **Glassmorphic UI**: Semi-transparent dark cards, smooth shadows, and animated floating background glows.
* **Responsive Layout**: Fluid single-column layout on mobile, automatically shifting to a side-by-side two-column view on desktop.
* **Sticky Summary Panel**: The calculations card remains pinned to the viewport as you scroll through a long list of people.

---

## 🌟 Key Features

1. **Flexible Split Options**:
   * **Equal/Items (Ratio)**: Distribute the remaining bill proportionally based on the number of items or weight each person consumed (defaults to 1 for an equal split).
   * **Manual Amount**: Allocate a fixed amount of the subtotal to a person.
2. **Proportional Tax & Tip Allocations**:
   * Tax and tip percentages are applied proportionally to each person's base share. If Person A consumed twice as much as Person B, Person A pays twice as much of the tax and tip.
3. **Multi-Currency Support**:
   * Toggle between INR (₹), USD ($), EUR (€), GBP (£), and JPY (¥) with instant symbol updates.
4. **Convenient Presets**:
   * Quick tip buttons (5%, 10%, 15%, 20%) alongside a custom percentage input.
5. **Dynamic Animations**:
   * Smooth, spring-loaded animations when adding or removing people.
6. **WhatsApp-Ready Sharing**:
   * Copy a formatted breakdown text block to the clipboard with one click, complete with emojis and markdown bold tags.

---

## 🛠️ Tech Stack

* **Structure**: Semantic HTML5.
* **Styling**: Vanilla CSS3 (Custom properties, CSS Grids, Flexbox, Glassmorphism backdrop-filters, custom scrollbars).
* **Logic**: Vanilla JavaScript (ES6+ state management, incremental DOM node rendering to prevent input focus issues).
* **Iconography**: [Lucide Icons](https://lucide.dev) loaded via CDN.
* **Typography**: Outfit (headings) and Plus Jakarta Sans (body) via Google Fonts.

---

## 💻 Running Locally

Since SplitShare is built with pure web technologies without package managers or bundlers, running it is extremely simple:

### Option 1: Direct File Open
1. Download or clone this repository.
2. Double-click the `index.html` file to open it in your preferred web browser (Chrome, Firefox, Safari, Edge, etc.).

### Option 2: Local HTTP Server (Recommended)
Running it through an HTTP server ensures full compatibility with clipboard APIs and modules:
* **Python 3**:
  ```bash
  python -m http.server 8000
  ```
  Open `http://localhost:8000` in your browser.
* **Node.js (npx)**:
  ```bash
  npx serve
  ```
  Open the URL provided in the terminal (usually `http://localhost:3000` or `3000`).

---

## ☁️ Deploying on Vercel

Deploying a vanilla project on Vercel is free, takes less than 2 minutes, and automatically configures HTTPS.

### Deploying via Vercel Git Integration (Recommended)
1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and sign in.
3. Click the **"Add New..."** button and select **"Project"**.
4. Import your repository from the Git provider list.
5. Under the project settings:
   * **Framework Preset**: Select **"Other"** (Vercel will auto-detect the HTML/CSS/JS file structure).
   * **Root Directory**: `./` (current directory).
   * **Build and Development Settings**: Keep empty/default (no build command is required!).
6. Click **"Deploy"**. Your site is now live with a production-ready preview URL!

### Deploying via Vercel CLI
If you have Vercel CLI installed locally:
```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Run vercel command in the project root directory
vercel
```
Follow the interactive prompts to log in and set up your project. To deploy to production:
```bash
vercel --prod
```
