/**
 * Slide Templates
 *
 * Templates own controlled markup only. Layout selection lives in
 * slide-layouts.js, while the AI remains limited to presentation content.
 */
(function(root) {
    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatSlideNumber(current, total) {
        return String(current).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    }

    function buildHeader(title, presentationTitle) {
        return `
            <div class="slide-top-bar">
                <div class="slide-title-group">
                    <h2 class="slide-title">${escapeHTML(title)}</h2>
                    <div class="slide-title-line"></div>
                </div>
                <div class="slide-deck-title">${escapeHTML(presentationTitle)}</div>
            </div>`;
    }

    function buildFooter(takeaway, slideNumber, totalSlides) {
        return `
            <div class="slide-footer">
                <div class="slide-takeaway">${escapeHTML(takeaway || 'Key takeaway')}</div>
                <div class="slide-number">${formatSlideNumber(slideNumber, totalSlides)}</div>
            </div>`;
    }

    function buildIcon(icon) {
        return icon ? `
            <div class="slide-visual">
                <img class="slide-icon" src="icons/hugeicons/${escapeHTML(icon)}" alt="" aria-hidden="true">
            </div>` : '';
    }

    function buildInlineIcon(icon) {
        return icon ? `<img class="template-icon" src="icons/hugeicons/${escapeHTML(icon)}" alt="" aria-hidden="true">` : '';
    }

    function buildBulletFocus({ slide, icon }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        const pointMarkup = points.map((point) => '<li class="slide-point">' + escapeHTML(point) + '</li>').join('');

        return `
            <div class="slide-body">
                <ul class="slide-points">${pointMarkup}</ul>
                ${buildIcon(icon)}
            </div>`;
    }

    function splitPoint(point) {
        const separator = String(point).indexOf(':');
        if (separator === -1) {
            return { label: '', copy: String(point) };
        }

        return {
            label: String(point).slice(0, separator).trim(),
            copy: String(point).slice(separator + 1).trim()
        };
    }

    function buildCardGrid({ slide, pointIcons }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 4) {
            return null;
        }

        return `
            <div class="slide-structured-body slide-card-grid">
                ${points.map((point, index) => {
                    const item = splitPoint(point);
                    return `
                        <article class="slide-card">
                            <div class="slide-card-top"><span class="slide-card-marker">${String(index + 1).padStart(2, '0')}</span>${buildInlineIcon(pointIcons?.[index])}</div>
                            <h3 class="slide-card-title">${escapeHTML(item.label || item.copy)}</h3>
                            ${item.label ? `<p class="slide-card-copy">${escapeHTML(item.copy)}</p>` : ''}
                        </article>`;
                }).join('')}
            </div>`;
    }

    function buildComparison({ slide }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 2 || points.length > 5 || points.slice(0, 2).some((point) => !String(point).includes(':'))) {
            return null;
        }

        const sides = points.slice(0, 2).map(splitPoint);
        const insights = points.slice(2).map(splitPoint);
        return `
            <div class="slide-structured-body slide-comparison">
                <article class="comparison-panel comparison-panel--left">
                    <span class="comparison-kicker">Option 01</span>
                    <h3 class="comparison-title">${escapeHTML(sides[0].label)}</h3>
                    <p class="comparison-copy">${escapeHTML(sides[0].copy)}</p>
                </article>
                <div class="comparison-divider" aria-hidden="true">VS</div>
                <article class="comparison-panel comparison-panel--right">
                    <span class="comparison-kicker">Option 02</span>
                    <h3 class="comparison-title">${escapeHTML(sides[1].label)}</h3>
                    <p class="comparison-copy">${escapeHTML(sides[1].copy)}</p>
                </article>
                ${insights.length ? `
                    <div class="comparison-insight">
                        ${insights.map((insight) => `<span><strong>${escapeHTML(insight.label || 'Insight')}</strong>${insight.label ? ': ' : ''}${escapeHTML(insight.copy)}</span>`).join('')}
                    </div>` : ''}
            </div>`;
    }

    function buildProcess({ slide }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 5) {
            return null;
        }

        return `
            <div class="slide-structured-body slide-process">
                ${points.map((point, index) => `
                    <article class="process-step">
                        <span class="process-number">${String(index + 1).padStart(2, '0')}</span>
                        <p class="process-copy">${escapeHTML(point)}</p>
                    </article>
                    ${index < points.length - 1 ? '<span class="process-connector" aria-hidden="true"></span>' : ''}
                `).join('')}
            </div>`;
    }

    function buildRoadmap({ slide }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 5) {
            return null;
        }

        return `
            <div class="slide-structured-body slide-roadmap slide-roadmap--${points.length}">
                ${points.map((point, index) => {
                    const phase = splitPoint(point);
                    return `
                        <article class="roadmap-phase">
                            <span class="roadmap-marker">${String(index + 1).padStart(2, '0')}</span>
                            <h3 class="roadmap-title">${escapeHTML(phase.label || phase.copy)}</h3>
                            ${phase.label ? `<p class="roadmap-copy">${escapeHTML(phase.copy)}</p>` : ''}
                        </article>`;
                }).join('')}
            </div>`;
    }

    function buildArchitecture({ slide }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 4 || points.some((point) => !String(point).includes(':'))) {
            return null;
        }

        return `
            <div class="slide-structured-body slide-architecture">
                ${points.map((point, index) => {
                    const layer = splitPoint(point);
                    return `
                        <article class="architecture-layer">
                            <span class="architecture-number">${String(index + 1).padStart(2, '0')}</span>
                            <div>
                                <h3 class="architecture-title">${escapeHTML(layer.label)}</h3>
                                <p class="architecture-copy">${escapeHTML(layer.copy)}</p>
                            </div>
                        </article>
                        ${index < points.length - 1 ? '<span class="architecture-connector" aria-hidden="true"></span>' : ''}
                    `;
                }).join('')}
            </div>`;
    }

    function buildSpotlight({ slide, icon, pointIcons }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 5) {
            return null;
        }

        return `
            <div class="slide-structured-body slide-spotlight">
                <div class="spotlight-lead">
                    <span class="spotlight-marker">Core idea</span>
                    <p>${escapeHTML(points[0])}</p>
                    ${buildIcon(icon)}
                </div>
                <div class="spotlight-support">
                    ${points.slice(1).map((point, index) => `<p><span>${String(index + 2).padStart(2, '0')}</span>${buildInlineIcon(pointIcons?.[index + 1])}${escapeHTML(point)}</p>`).join('')}
                </div>
            </div>`;
    }

    function buildSplitColumns({ slide, pointIcons }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 5) {
            return null;
        }

        const midpoint = Math.ceil(points.length / 2);
        const buildColumn = (items, side, offset) => `
            <div class="split-column split-column--${side}">
                ${items.map((point, index) => `<p><span>${String(index + offset + 1).padStart(2, '0')}</span>${buildInlineIcon(pointIcons?.[index + offset])}${escapeHTML(point)}</p>`).join('')}
            </div>`;

        return `
            <div class="slide-structured-body slide-split-columns">
                ${buildColumn(points.slice(0, midpoint), 'left', 0)}
                ${buildColumn(points.slice(midpoint), 'right', midpoint)}
            </div>`;
    }

    function buildPillars({ slide, pointIcons }) {
        const points = Array.isArray(slide.points) ? slide.points : [];
        if (points.length < 3 || points.length > 5) {
            return null;
        }

        return `
            <div class="slide-structured-body slide-pillars slide-pillars--${points.length}">
                ${points.map((point, index) => `
                        <article class="pillar">
                        <div class="pillar-top"><span class="pillar-number">${String(index + 1).padStart(2, '0')}</span>${buildInlineIcon(pointIcons?.[index])}</div>
                        <p>${escapeHTML(point)}</p>
                    </article>`).join('')}
            </div>`;
    }

    function renderContentTemplate({ slide, plan, icon, pointIcons, presentationTitle, slideNumber, totalSlides }) {
        const safeSlide = slide || {};
        const template = plan?.template || 'bullet-focus';
        const specializedBodies = {
            'card-grid': buildCardGrid,
            comparison: buildComparison,
            process: buildProcess,
            roadmap: buildRoadmap,
            architecture: buildArchitecture,
            spotlight: buildSpotlight,
            'split-columns': buildSplitColumns,
            pillars: buildPillars
        };
        const specializedBody = specializedBodies[template]
            ? specializedBodies[template]({ slide: safeSlide, icon, pointIcons: pointIcons || [] })
            : null;
        const body = specializedBody || buildBulletFocus({ slide: safeSlide, icon });

        return [
            '<div class="slide-template template--' + escapeHTML(template) + '">',
            buildHeader(safeSlide.title, presentationTitle),
            body,
            buildFooter(safeSlide.takeaway, slideNumber, totalSlides),
            '</div>'
        ].join('');
    }

    const api = { renderContentTemplate, escapeHTML, formatSlideNumber };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    root.SlideTemplates = api;
})(typeof window !== 'undefined' ? window : globalThis);
