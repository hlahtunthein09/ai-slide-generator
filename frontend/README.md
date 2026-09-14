# AI Presentation Generator - Frontend

## How to Use

### Prerequisites
- Backend server must be running on `http://localhost:3001`
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Steps

1. **Start the Backend**
   ```bash
   cd ../backend
   npm start
   ```

2. **Open the Frontend**
   - Open `index.html` in your web browser
   - Or use Live Server in VS Code

3. **Generate a Presentation**
   - Type a topic in the input field (e.g., "AI Agents")
   - Click **Generate Presentation**
   - Wait for the AI to generate slides
   - Use navigation buttons to browse slides

### Keyboard Shortcuts
- `→` or `↓` — Next slide
- `←` or `↑` — Previous slide

### Progressive Web App (PWA) & Installation
SlideCraft is a fully installable PWA on Desktop and Mobile:
- **Desktop (Chrome / Edge / Brave):** Click the **Install App** button in the header, or the install icon in the browser address bar.
- **Android (Chrome):** Tap the **Install App** button or browser menu (`⋮`) -> **Install App / Add to Home screen**.
- **iOS / iPadOS (Safari):** Tap **Install App** for a guided walk-through, or tap **Share** (`⎋`) -> **Add to Home Screen** (`⊞`).
- **Offline Mode:** Core static assets are cached via Service Worker (`sw.js`). You can browse previously viewed or generated slides even without an internet connection.

### Testing (Browser Console)
Open browser console (F12) and run:
```javascript
// Test backend connection
App.testConnection()

// Test presentation generation
App.testGenerate()
```

## File Structure

```
frontend/
├── index.html          # Main HTML structure + PWA meta tags
├── manifest.json       # Web App Manifest (PWA metadata, icons, shortcuts)
├── sw.js               # Service Worker (asset caching & offline support)
├── style.css           # All styles (design system + slides + PWA UI)
├── icons/
│   ├── pwa/            # PWA icons (192px, 512px, maskable, apple-touch-icon, SVG)
│   ├── hugeicons/      # Slide templates & feature icons
│   └── outline/        # Favicon & UI icons
└── js/
    ├── app.js          # Main orchestration, API calls
    ├── pwa.js          # PWA manager (install prompts, iOS modal, offline monitor)
    ├── renderer.js     # Converts JSON to HTML slides
    ├── navigation.js   # Slide navigation controls
    ├── slide-layouts.js # 16:9 layout calculation
    └── slide-templates.js # Structural visual templates
```

## For Team Members

### What Each File Does

**index.html** — The main page with:
- Input form for typing presentation topic
- Slide preview area
- Navigation buttons (Previous/Next)

**style.css** — All the styling including:
- Design tokens (colors, fonts, spacing)
- Slide template (16:9 aspect ratio)
- Responsive design

**js/app.js** — Handles:
- User input
- API calls to backend
- Loading/error states
- Connecting everything together

**js/renderer.js** — Converts presentation data to HTML:
- Takes JSON data from API
- Creates slide elements
- Handles HTML escaping for security

**js/navigation.js** — Controls slide movement:
- Next/Previous buttons
- Keyboard shortcuts
- Slide counter display

### How It Works

1. User types a topic and clicks Generate
2. `app.js` sends the topic to backend API
3. Backend generates presentation using AI
4. Backend returns JSON with slides
5. `renderer.js` converts JSON to HTML slides
6. `navigation.js` lets user browse slides

### No Frameworks Used!
This is pure HTML, CSS, and JavaScript — no React, no Vue, no build tools.
