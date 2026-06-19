# AGENTS.md — Developer Notes for AI-Assisted Maintenance

## Project Overview

This is a single-file bookmarklet (`gemini-export.js`) that runs in the browser console on `gemini.google.com`. It extracts the conversation DOM and converts it to a Markdown file download.

## Architecture

The script is a single IIFE with these internal functions:

### DOM Extraction

- **`buildConversation()`** — Entry point. Queries `document.querySelectorAll('user-query, model-response')` and groups them into alternating user/model turns. Each model turn may contain multiple `model-response` nodes (e.g., regenerated responses).
- **`extractUserText(el)`** — Extracts user query text from `.query-text-line` elements, falling back to `textContent`.

### Formatting

- **`formatMarkdownPanel(panel)`** — Walks the `.markdown-main-panel` children in document order. For elements with inline `[data-math]`, it merges text segments and LaTeX in sequence. Delegates block elements (p, h*, pre, table, etc.) to `formatContent`.
- **`formatContent(el)`** — Formats a single element by tag type. Key case: `[data-math]` attributes are output as `$$...$$` (if `math-block`/`display` class) or `$...$` (inline). Also handles p, li, blockquote, pre/code, table, headings, hr, img.
- **`formatMathML(el)`** — Legacy MathML→LaTeX converter. Handles `<math>`, `<mi>`, `<mrow>`, `<msup>`, `<msub>`, `<mfrac>`, `<msqrt>` etc. Uses a Unicode→LaTeX mapping for Greek letters and operators. Only used if `<math>` elements with `<annotation>` are present (rare in current Gemini rendering).

### Output

- Builds a Blob with `type: 'text/markdown'`, creates an object URL, triggers a download via `<a>` click, then cleans up.

## Key DOM Targets (current Gemini layout)

| Element | Role |
|---------|------|
| `user-query` | User message in conversation (inside `.conversation-container`) |
| `model-response` | Model response container |
| `.markdown-main-panel` | Rendered Markdown content inside `model-response` |
| `[data-math]` | LaTeX source attribute on `.math-block` (display) or `<span>` (inline) divs |
| `.katex` / `.katex-display` | KaTeX rendered spans (skipped during text extraction) |
| `.conversation-container` | Parent container for all turns |
| `code-block` | Gemini's code block container (custom element, NOT `<pre>`) |
| `.code-block-decoration` | Language label element inside `code-block` |
| `table-block` | Gemini's table container (custom element, NOT `<table>`) |

## Known Issues & Edge Cases

- **Duplicate `.conversation-container`**: There may be multiple elements with this class; the script uses `document.querySelectorAll` directly instead of scoping to a container.
- **Virtual scrolling**: Turns that are scrolled out of view may be removed from the DOM. Ensure all desired turns are visible before running the script.
- **Inline math inside `<p>`**: Handled by walking `childNodes` and replacing `[data-math]` elements with `$...$` while using `textContent` for other children.
- **Display math wrapped in parent div**: The `.math-block` is often inside a `<div data-path-to-node="...">` wrapper. `formatMarkdownPanel` detects `querySelector('[data-math]')` on children to find it.
- **Custom elements for code and tables**: Gemini uses `<code-block>` and `<table-block>` custom elements instead of standard `<pre>` and `<table>`. The script now handles both the custom elements and standard HTML elements as fallbacks.

## Testing

No test framework is set up. Manual testing:

1. Open `gemini.google.com` with a multi-turn conversation
2. Paste the IIFE into the browser console
3. Check the console for `[Done]` message and preview
4. Open the downloaded `.md` file in a Markdown viewer to verify LaTeX rendering

Run `node -c gemini-export.js` to check JS syntax.

## Conventions

- Keep the script as a single IIFE — no imports, no build step
- Avoid external dependencies (no CDN, no libraries)
- Use `'use strict'`
- Console log with `[Gemini Export]` prefix for debug messages
- Error messages should be descriptive for the end user
