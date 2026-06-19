(function() {
  'use strict';

  function formatMathML(el, isTopLevel) {
    const TEX_REPLACE = {
      '\u2192': '\\to ',
      '\u2190': '\\leftarrow ',
      '\u21D2': '\\Rightarrow ',
      '\u21D4': '\\Leftrightarrow ',
      '\u03B1': '\\alpha ',
      '\u03B2': '\\beta ',
      '\u03B3': '\\gamma ',
      '\u0394': '\\Delta ',
      '\u03B4': '\\delta ',
      '\u03B8': '\\theta ',
      '\u03BB': '\\lambda ',
      '\u03C0': '\\pi ',
      '\u03C3': '\\sigma ',
      '\u03C6': '\\phi ',
      '\u03C9': '\\omega ',
      '\u221E': '\\infty ',
      '\u2248': '\\approx ',
      '\u2260': '\\neq ',
      '\u2264': '\\leq ',
      '\u2265': '\\geq ',
      '\u00B1': '\\pm ',
      '\u00D7': '\\times ',
      '\u00F7': '\\div ',
      '\u2211': '\\sum ',
      '\u220F': '\\prod ',
      '\u222B': '\\int ',
      '\u2202': '\\partial '
    };

    if (el.nodeType === Node.TEXT_NODE) return el.textContent;

    const tag = el.tagName.toLowerCase();

    if (isTopLevel === undefined) isTopLevel = true;

    if (isTopLevel && tag === 'math') {
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      if (annotation) {
        const display = el.getAttribute('display');
        const tex = annotation.textContent.trim();
        if (display === 'block' || display === 'display') {
          return '$$\n' + tex + '\n$$';
        }
        return '$' + tex + '$';
      }
    }

    if (tag === 'mi' || tag === 'mn' || tag === 'mo' || tag === 'mtext') {
      let t = el.textContent;
      for (const [k, v] of Object.entries(TEX_REPLACE)) {
        t = t.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), v);
      }
      return t;
    }

    if (tag === 'math') {
      const display = el.getAttribute('display');
      let content = '';
      for (const child of el.childNodes) {
        content += formatMathML(child, false);
      }
      content = content.replace(/\s+/g, ' ').trim();
      if (display === 'block' || display === 'display') {
        return '$$\n' + content + '\n$$';
      }
      return '$' + content + '$';
    }

    if (tag === 'semantics') {
      if (el.children.length > 0) return formatMathML(el.children[0], false);
      return '';
    }

    if (tag === 'annotation') return '';

    const children = Array.from(el.childNodes).filter(c =>
      !(c.nodeType === Node.ELEMENT_NODE && c.tagName.toLowerCase() === 'annotation')
    );

    if (tag === 'mrow') {
      return children.map(c => formatMathML(c, false)).join(' ').replace(/\s+/g, ' ').trim();
    }

    if (tag === 'msup' && el.children.length >= 2) {
      return formatMathML(el.children[0], false) + '^{' + formatMathML(el.children[1], false) + '}';
    }

    if (tag === 'msub' && el.children.length >= 2) {
      return formatMathML(el.children[0], false) + '_{' + formatMathML(el.children[1], false) + '}';
    }

    if (tag === 'msubsup' && el.children.length >= 3) {
      return formatMathML(el.children[0], false) + '_{' + formatMathML(el.children[1], false) + '}^{' + formatMathML(el.children[2], false) + '}';
    }

    if (tag === 'mfrac' && el.children.length >= 2) {
      return '\\frac{' + formatMathML(el.children[0], false) + '}{' + formatMathML(el.children[1], false) + '}';
    }

    if (tag === 'msqrt') {
      let inner = children.map(c => formatMathML(c, false)).join(' ').replace(/\s+/g, ' ').trim();
      return '\\sqrt{' + inner + '}';
    }

    if (tag === 'mover' && el.children.length >= 2) {
      return '\\overset{' + formatMathML(el.children[1], false) + '}{' + formatMathML(el.children[0], false) + '}';
    }

    if (tag === 'munder' && el.children.length >= 2) {
      return '\\underset{' + formatMathML(el.children[1], false) + '}{' + formatMathML(el.children[0], false) + '}';
    }

    if (tag === 'munderover' && el.children.length >= 3) {
      return '\\overset{' + formatMathML(el.children[2], false) + '}_{' + formatMathML(el.children[1], false) + '}{' + formatMathML(el.children[0], false) + '}';
    }

    return el.textContent;
  }

  function formatContent(el) {
    const tag = el.tagName.toLowerCase();
    const text = el.textContent.trim();
    if (!text && !el.hasAttribute('data-math')) return '';

    if (el.hasAttribute('data-math')) {
      const tex = el.getAttribute('data-math').trim();
      const cls = el.className || '';
      if (cls.includes('math-block') || cls.includes('display')) {
        return '$$\n' + tex + '\n$$\n\n';
      }
      return '$' + tex + '$\n\n';
    }

    if (tag === 'p') return text + '\n\n';
    if (tag === 'li') {
      const parent = el.parentNode;
      const parentTag = parent ? parent.tagName.toLowerCase() : '';
      if (parentTag === 'ul' || parentTag === 'ol') return '- ' + text + '\n';
      return text + '\n';
    }
    if (tag === 'blockquote') return '> ' + text.replace(/\n/g, '\n> ') + '\n\n';
    if (tag === 'pre') {
      const code = el.querySelector('code');
      const lang = code && code.className ? code.className.replace(/.*language-/, '') : '';
      const content = code ? code.textContent : el.textContent;
      return '\n```' + lang + '\n' + content.trim() + '\n```\n\n';
    }
    if (tag === 'table') {
      let result = '\n';
      const rows = el.querySelectorAll('tr');
      rows.forEach((row, ri) => {
        const cells = row.querySelectorAll('td, th');
        const vals = [];
        cells.forEach(c => vals.push(c.textContent.trim()));
        if (vals.length) result += '| ' + vals.join(' | ') + ' |\n';
        if (ri === 0) result += '| ' + vals.map(() => '---').join(' | ') + ' |\n';
      });
      return result + '\n';
    }
    if (['h1','h2','h3','h4','h5','h6'].includes(tag)) {
      return '#'.repeat(parseInt(tag[1])) + ' ' + text + '\n\n';
    }
    if (tag === 'hr') return '---\n\n';
    if (tag === 'img') {
      const alt = el.getAttribute('alt');
      if (alt) return alt + '\n\n';
      return '';
    }
    if (tag === 'math') return formatMathML(el);

    return text + '\n\n';
  }

  function extractUserText(el) {
    const lines = el.querySelectorAll('.query-text-line');
    if (lines.length) {
      const texts = [];
      lines.forEach(l => { const t = l.textContent.trim(); if (t) texts.push(t); });
      return texts.join('\n');
    }
    return el.textContent.trim();
  }

  function formatMarkdownPanel(panel) {
    let result = '';
    for (const child of panel.children) {
      const tag = child.tagName.toLowerCase();
      if (child.hasAttribute('data-math')) {
        result += formatContent(child);
      } else if (child.querySelector('[data-math]')) {
        let inner = '';
        for (const c of child.childNodes) {
          if (c.nodeType === Node.TEXT_NODE) {
            inner += c.textContent;
          } else if (c.nodeType === Node.ELEMENT_NODE) {
            if (c.hasAttribute('data-math')) {
              inner += formatContent(c).replace(/\n+$/, '');
            } else {
              inner += c.textContent;
            }
          }
        }
        const cleaned = inner.trim();
        if (cleaned) result += cleaned + '\n\n';
      } else if (tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' ||
                 tag === 'blockquote' || tag === 'hr' || tag === 'pre' || tag === 'table' || tag === 'img') {
        result += formatContent(child);
      } else if (tag === 'code-block' || child.querySelector('code-block')) {
        const block = tag === 'code-block' ? child : child.querySelector('code-block');
        const code = block.querySelector('code');
        const deco = block.querySelector('.code-block-decoration');
        const lang = deco ? deco.textContent.trim().toLowerCase() :
                     (code && code.className ? code.className.replace(/.*language-/, '') : '');
        const content = code ? code.textContent : block.textContent;
        result += '```' + lang + '\n' + content.trim() + '\n```\n\n';
      } else if (tag === 'table-block' || child.querySelector('table-block')) {
        const block = tag === 'table-block' ? child : child.querySelector('table-block');
        const table = block.querySelector('table');
        if (table) result += formatContent(table);
      } else if (tag === 'ul' || tag === 'ol') {
        for (const li of child.children) {
          if (li.tagName.toLowerCase() === 'li') result += formatContent(li);
        }
      } else if (tag === 'div' && child.textContent.trim()) {
        const txt = child.textContent.replace(/\u200B/g, '').replace(/\s+/g, ' ').trim();
        if (txt) result += txt + '\n\n';
      }
    }
    return result.replace(/\n{4,}/g, '\n\n\n');
  }

  function buildConversation() {
    const allEls = document.querySelectorAll('user-query, model-response');
    if (allEls.length === 0) throw new Error('No user-query/model-response elements found. Are you on a Gemini chat page?');

    const turns = [];
    let currentModelBuffer = [];

    for (const node of allEls) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'user-query') {
        if (currentModelBuffer.length > 0) {
          turns.push({ role: 'model', nodes: currentModelBuffer });
          currentModelBuffer = [];
        }
        turns.push({ role: 'user', nodes: [node] });
      } else if (tag === 'model-response') {
        if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
          currentModelBuffer.push(node);
        }
      }
    }
    if (currentModelBuffer.length > 0) {
      turns.push({ role: 'model', nodes: currentModelBuffer });
    }
    if (turns.length === 0) throw new Error('Could not extract conversation turns.');

    const ts = new Date().toLocaleString();
    let md = '# Google Gemini Conversation Export\n\n> Exported on: ' + ts + '\n\n---\n\n';

    for (const turn of turns) {
      const label = turn.role === 'user' ? '**You**' : '**Gemini**';
      md += '### ' + label + '\n\n';
      if (turn.role === 'user') {
        md += extractUserText(turn.nodes[0]) + '\n\n';
      } else {
        const seen = new Set();
        for (const node of turn.nodes) {
          const panel = node.querySelector('.markdown-main-panel');
          if (panel) {
            const content = formatMarkdownPanel(panel);
            if (content.trim()) {
              const key = content.trim().substring(0, 40);
              if (!seen.has(key)) {
                md += content;
                seen.add(key);
              }
            }
          }
        }
        md += '\n';
      }
      md += '---\n\n';
    }

    return md;
  }

  try {
    const markdown = buildConversation();
    const ts = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = 'gemini-conversation-' + ts + '.md';

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('%c[Done] Exported to: ' + filename, 'color: green; font-weight: bold;');
    console.log('%cPreview:', 'color: blue;');
    console.log(markdown.slice(0, 2000) + '...');
  } catch (err) {
    console.error('%c[Error] ' + err.message, 'color: red; font-weight: bold;');
  }
})();
