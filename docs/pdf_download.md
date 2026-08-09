Research conclusion: start with **browser printing to PDF**, not a PDF library.

Your slides are already HTML/CSS, so the cleanest MVP flow is:

```text
[ Download PDF ]
→ browser print dialog opens
→ student selects “Save as PDF”
→ one 16:9 slide per PDF page
```

This needs no extra npm package, preserves normal browser text rendering, and avoids turning slides into blurry canvas images. CSS print media supports hiding UI, setting page size/margins, and forcing page breaks. [MDN printing guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing), [MDN paged media](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Paged_media)

Implementation design:

- Add a `Download PDF` button near navigation.
- Its JavaScript calls `window.print()`.
- Add `@media print` CSS that:
  - hides the header, prompt form, navigation, and buttons;
  - displays every generated slide, including currently hidden ones;
  - gives each slide its own page with `break-after: page`;
  - removes preview shadows, outer padding, and card borders;
  - applies a landscape 16:9 print page.

One limitation: browsers control the Save dialog, so the website cannot silently save a `.pdf` or force a filename/location. The user must choose **Save as PDF**.

For later, if you require a true immediate `.pdf` download button:

- `jsPDF + html2canvas` can create it in the browser, but it rasterizes HTML into images, can have font/CORS fidelity issues, and adds packages. jsPDF’s HTML mode itself depends on html2canvas and DOMPurify. [jsPDF documentation](https://github.com/parallax/jsPDF)
- A server-side Playwright/Chromium PDF endpoint produces strong HTML-to-PDF fidelity, but adds a large browser dependency and deployment complexity. [Playwright PDF API](https://playwright.dev/docs/next/api/class-page)

For your current school-project MVP, I recommend implementing the native **Print / Save PDF** version first.

I’ll add a PDF button to the generated presentation panel and implement print-specific styling so every slide exports as its own 16:9 PDF page while app controls stay out of the file.