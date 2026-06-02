# Gemini to Markdown Exporter

A browser bookmarklet that exports Google Gemini conversations to Markdown files with preserved LaTeX math equations.

## Features

- Exports full multi-turn conversations (user queries + model responses)
- Captures LaTeX equations from `data-math` attributes as `$$...$$` or `$...$` blocks
- Preserves Markdown structure: headings, paragraphs, code blocks, tables, lists
- Downloads as a `.md` file compatible with Obsidian, Typora, GitHub, and other LaTeX-aware Markdown viewers
- Single-file, dependency-free bookmarklet (IIFE)

## How to Use

1. Copy the contents of `gemini-export.js`
2. In your browser, create a new bookmark and paste the code as the URL (prepend `javascript:` if your browser requires it)
3. Navigate to `gemini.google.com` and open a conversation
4. Click the bookmarklet
5. A `.md` file will download automatically

## Files

| File | Description |
|------|-------------|
| `gemini-export.js` | The bookmarklet script (IIFE) |
| `User_Instructions.md` | Step-by-step setup & usage guide |
| `AGENTS.md` | Developer notes for AI-assisted maintenance |

## Requirements

- Chrome, Edge, Firefox, or any modern browser with `document.querySelectorAll` and `Blob` API support
- A Google Gemini conversation page at `gemini.google.com`

## Limitations

- Requires the conversation to be loaded in the DOM (all turns visible)
- Inline LaTeX rendered as KaTeX HTML is captured from `data-math` attributes; if Gemini changes this structure, extraction may break
- Previously exported conversations are not re-importable
