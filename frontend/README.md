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
├── index.html      # Main HTML structure
├── style.css       # All styles (design system + slides)
└── js/
    ├── app.js      # Main orchestration, API calls
    ├── renderer.js # Converts JSON to HTML slides
    └── navigation.js # Slide navigation controls
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
