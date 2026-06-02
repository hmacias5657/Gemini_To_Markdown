# Gemini to Markdown Exporter — User Instructions

## What This Does

This bookmarklet exports your Gemini conversation to a Markdown (`.md`) file that you can open in any note-taking app, Markdown viewer, or text editor. Math equations are preserved as LaTeX (`$$...$$` and `$...$`) so they render correctly in apps like Obsidian, Typora, or on GitHub.

## Setup

### Step 1: Copy the script

Open `gemini-export.js` in a text editor and select **all** of its contents, then copy (`Ctrl+C` / `Cmd+C`).

### Step 2: Create the bookmarklet

In Chrome (or Edge / Firefox):

1. Open the **Bookmarks Manager**:
   - Chrome: `Ctrl+Shift+O` (Windows/Linux) or `Cmd+Shift+O` (Mac)
   - Alternatively, click the star icon → "Bookmark this tab" → "More..." → copy the URL and replace it
2. Create a **New Bookmark** (right-click the bookmarks bar → "Add page" / "New bookmark")
3. Give it a name like `Gemini Export`
4. For the **URL** field, paste the entire script content you copied in Step 1
5. If your browser requires a `javascript:` prefix, add it at the very beginning: `javascript:` followed by the script

   Example:
   ```
   javascript:(function() { 'use strict'; ...
   ```

6. Save the bookmark

## How to Use

1. Go to **gemini.google.com** and open an existing conversation
2. Make sure all the messages you want to export are loaded and visible on screen (scroll through the entire conversation so nothing is lazy-loaded)
3. Click the **Gemini Export** bookmarklet
4. A `.md` file will download automatically to your computer
5. Open the `.md` file in your favorite Markdown viewer

## What to Expect

- **Console output**: A preview of the first 2000 characters is logged to the browser's DevTools console
- **File name**: `gemini-conversation-YYYYMMDDTHHMMSS.md` (timestamped)
- **Math equations**: Display math renders as `$$\n...\n$$` and inline math as `$...$`

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Nothing happens when clicking the bookmark | Script not pasted correctly | Re-copy the file contents and update the bookmark URL |
| Only one turn exported | Some turns scrolled out of view / not loaded | Scroll through the full conversation, then run the bookmarklet again |
| Equations show as raw LaTeX like `$$...$$` | Your Markdown viewer doesn't support LaTeX | Use Obsidian, Typora, or another LaTeX-aware viewer |
| Error in console: "No user-query/model-response elements found" | Not on a Gemini conversation page | Make sure you are at `gemini.google.com` with a conversation open |
| Console shows duplicate math or missing text | Gemini's DOM structure changed | Check for an updated version of the script |

## Supported Markdown Viewers

These apps render LaTeX equations from `.md` files correctly:

- **Obsidian** (with MathJax or KaTeX plugin)
- **Typora**
- **GitHub** (README preview)
- **VS Code** (with Markdown+Math extension)
- **Jupyter Notebook** (`.md` cells)
- **HackMD / CodiMD**
