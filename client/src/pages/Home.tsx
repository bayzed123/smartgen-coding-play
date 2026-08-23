// Editorial Instrument philosophy: this page behaves like a typeset technical workbench—an asymmetric tool index, warm paper surfaces, ink typography, cobalt actions, and saffron annotations.
import { useMemo, useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUpRight,
  Braces,
  Check,
  ChevronRight,
  Clipboard,
  Code2,
  Command,
  Download,
  FileCode2,
  FileText,
  Github,
  Hash,
  Keyboard,
  LockKeyhole,
  Menu,
  Minus,
  RefreshCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type ToolId = "text-html" | "markdown-html" | "html-markdown" | "html-text" | "text-markdown";
type Tool = {
  id: ToolId;
  number: string;
  label: string;
  from: string;
  to: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
  inputPlaceholder: string;
  sample: string;
  icon: typeof FileText;
  language: string;
};

const ASSETS = {
  logo: "/manus-storage/smartgen-mark_b095d25e.png",
  hero: "/manus-storage/editorial-instrument-reference_8e5f7d03.png",
  plates: "/manus-storage/format-plates_cba14278.png",
  grid: "/manus-storage/blueprint-grid_d70ab8a8.png",
};

const tools: Tool[] = [
  {
    id: "text-html",
    number: "01",
    label: "Plain Text → HTML",
    from: "Plain Text",
    to: "HTML",
    description: "Turn clean writing into semantic paragraphs without touching a server.",
    inputLabel: "Plain text input",
    outputLabel: "HTML output",
    inputPlaceholder: "Paste a plain-text draft here…",
    sample: "A clear idea deserves a clean container.\n\nSmartGen keeps the words close and the markup tidy.",
    icon: FileText,
    language: "html",
  },
  {
    id: "markdown-html",
    number: "02",
    label: "Markdown → HTML",
    from: "Markdown",
    to: "HTML",
    description: "Render headings, lists, links, emphasis, and code into ready-to-use HTML.",
    inputLabel: "Markdown input",
    outputLabel: "HTML output",
    inputPlaceholder: "Paste Markdown here…",
    sample: "# A small heading\n\nWrite **clearly** and ship with [less friction](https://smartgen.tools).\n\n- One focused idea\n- One clean output",
    icon: Hash,
    language: "html",
  },
  {
    id: "html-markdown",
    number: "03",
    label: "HTML → Markdown",
    from: "HTML",
    to: "Markdown",
    description: "Flatten HTML structure into readable Markdown for docs, notes, and content systems.",
    inputLabel: "HTML input",
    outputLabel: "Markdown output",
    inputPlaceholder: "Paste HTML here…",
    sample: "<h2>Keep the structure</h2>\n<p>Good markup should remain <strong>easy to edit</strong>.</p>\n<ul><li>Readable</li><li>Portable</li></ul>",
    icon: Braces,
    language: "markdown",
  },
  {
    id: "html-text",
    number: "04",
    label: "HTML → Plain Text",
    from: "HTML",
    to: "Plain Text",
    description: "Strip tags while preserving the readable order of the original content.",
    inputLabel: "HTML input",
    outputLabel: "Plain text output",
    inputPlaceholder: "Paste HTML here…",
    sample: "<article><h1>A readable export</h1><p>Remove the wrappers. Keep the meaning.</p><p>That is the whole point.</p></article>",
    icon: AlignLeft,
    language: "text",
  },
  {
    id: "text-markdown",
    number: "05",
    label: "Plain Text → Markdown",
    from: "Plain Text",
    to: "Markdown",
    description: "Prepare a plain-text draft for Markdown editors while keeping its natural rhythm.",
    inputLabel: "Plain text input",
    outputLabel: "Markdown output",
    inputPlaceholder: "Paste plain text here…",
    sample: "A good draft has room to breathe.\n\nKeep the paragraphs intact, then refine the hierarchy when you are ready.",
    icon: FileCode2,
    language: "markdown",
  },
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

function markdownToHtml(markdown: string) {
  if (!markdown.trim()) return "";
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let codeLines: string[] = [];
  let inCode = false;
  let codeLanguage = "";

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      output.push(`</${listType}>`);
      listType = null;
    }
  };
  const flushCode = () => {
    if (inCode) {
      output.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      codeLines = [];
      codeLanguage = "";
      inCode = false;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      closeList();
      if (inCode) flushCode();
      else {
        inCode = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushParagraph();
      closeList();
      output.push("<hr />");
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        output.push(`<${listType}>`);
      }
      output.push(`<li>${inlineMarkdown((unordered || ordered)?.[1] ?? "")}</li>`);
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph();
      closeList();
      output.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  closeList();
  flushCode();
  return output.join("\n");
}

function htmlToMarkdown(html: string) {
  if (!html.trim()) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const render = (node: Node, depth = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, " ") ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const element = node as HTMLElement;
    const content = Array.from(element.childNodes).map((child) => render(child, depth + 1)).join("");
    const tag = element.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return `\n\n${"#".repeat(Number(tag[1]))} ${content.trim()}\n\n`;
    if (tag === "p" || tag === "div" || tag === "section" || tag === "article") return `\n\n${content.trim()}\n\n`;
    if (tag === "br") return "\n";
    if (tag === "strong" || tag === "b") return `**${content.trim()}**`;
    if (tag === "em" || tag === "i") return `*${content.trim()}*`;
    if (tag === "code" && element.parentElement?.tagName.toLowerCase() !== "pre") return `\`${content.trim()}\``;
    if (tag === "pre") return `\n\n\`\`\`\n${element.textContent?.trim() ?? ""}\n\`\`\`\n\n`;
    if (tag === "a") return `[${content.trim()}](${element.getAttribute("href") ?? ""})`;
    if (tag === "li") return `\n- ${content.trim()}`;
    if (tag === "ul" || tag === "ol") return `\n\n${content}\n`;
    if (tag === "blockquote") return `\n\n> ${content.trim()}\n\n`;
    if (tag === "hr") return "\n\n---\n\n";
    if (tag === "img") return `![${element.getAttribute("alt") ?? ""}](${element.getAttribute("src") ?? ""})`;
    return content;
  };
  return render(doc.body).replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

function htmlToPlainText(html: string) {
  if (!html.trim()) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));
  doc.querySelectorAll("p, div, article, section, h1, h2, h3, h4, h5, h6, li, blockquote, pre").forEach((node) => {
    node.insertAdjacentText("afterend", "\n");
  });
  return (doc.body.textContent ?? "").replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n/g, "\n\n").trim();
}

function plainTextToHtml(text: string) {
  return text
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block) => `<p>${escapeHtml(block.trim()).replaceAll("\n", "<br />\n")}</p>`)
    .join("\n");
}

function plainTextToMarkdown(text: string) {
  return text.replaceAll("\r\n", "\n").split(/\n\s*\n/).filter((block) => block.trim()).map((block) => block.trim()).join("\n\n");
}

function convert(toolId: ToolId, value: string) {
  switch (toolId) {
    case "text-html":
      return plainTextToHtml(value);
    case "markdown-html":
      return markdownToHtml(value);
    case "html-markdown":
      return htmlToMarkdown(value);
    case "html-text":
      return htmlToPlainText(value);
    case "text-markdown":
      return plainTextToMarkdown(value);
  }
}

export default function Home() {
  const [activeId, setActiveId] = useState<ToolId>("text-html");
  const [input, setInput] = useState(tools[0].sample);
  const [copied, setCopied] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const activeTool = tools.find((tool) => tool.id === activeId) ?? tools[0];
  const output = useMemo(() => convert(activeTool.id, input), [activeTool.id, input]);
  const inputCount = input.length;
  const outputCount = output.length;

  const selectTool = (tool: Tool) => {
    setActiveId(tool.id);
    setInput(tool.sample);
    setCopied(false);
    setMobileToolsOpen(false);
  };

  const copyOutput = async () => {
    if (!output) {
      toast.error("There is no output to copy yet.");
      return;
    }
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Output copied to your clipboard.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadOutput = () => {
    if (!output) {
      toast.error("Add some source text before downloading.");
      return;
    }
    const extension = activeTool.language === "html" ? "html" : activeTool.language === "markdown" ? "md" : "txt";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smartgen-converted.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${extension.toUpperCase()} output.`);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark-wrap">
            <img className="brand-mark" src={ASSETS.logo} alt="" />
          </div>
          <div>
            <a className="brand-name" href="#top">SMARTGEN<span>.</span></a>
            <p className="brand-subtitle">TEXT CONVERTER SUITE</p>
          </div>
        </div>
        <div className="header-meta">
          <span className="header-note"><span className="status-dot" /> Browser-local processing</span>
          <a className="github-link" href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" rel="noreferrer">
            <Github size={15} /> Repository <ArrowUpRight size={13} />
          </a>
        </div>
        <button className="mobile-menu" type="button" onClick={() => setMobileToolsOpen((open) => !open)} aria-label="Toggle tools menu" aria-expanded={mobileToolsOpen}>
          {mobileToolsOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main id="top">
        <section className="hero-section">
          <img className="hero-art" src={ASSETS.hero} alt="" aria-hidden="true" />
          <div className="hero-rule" />
          <div className="hero-content">
            <p className="eyebrow"><span>01</span> Format utility / edition 01</p>
            <h1>Move between formats<br /><em>without losing the shape</em><br />of your words.</h1>
            <p className="hero-copy">Five focused converters for the moments when content needs a new container. Paste, refine, and take the clean result with you.</p>
            <div className="hero-actions">
              <a href="#workbench" className="primary-action">Open the workbench <ArrowDown size={16} /></a>
              <span className="hero-caption">No uploads. No accounts.<br />Just your browser.</span>
            </div>
          </div>
          <div className="hero-index" aria-hidden="true">
            <span>SG / 01</span>
            <span>EST. 2026</span>
          </div>
        </section>

        <section className="workbench-section" id="workbench">
          <aside className={`tool-rail ${mobileToolsOpen ? "is-open" : ""}`}>
            <div className="rail-heading">
              <p className="section-kicker">Select a plate</p>
              <span className="rail-count">{tools.length.toString().padStart(2, "0")} tools</span>
            </div>
            <nav aria-label="Conversion tools">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button key={tool.id} className={`tool-nav-item ${tool.id === activeId ? "is-active" : ""}`} onClick={() => selectTool(tool)} type="button">
                    <span className="tool-number">{tool.number}</span>
                    <span className="tool-nav-copy"><span className="tool-nav-label">{tool.label}</span><span className="tool-nav-detail">{tool.from} <ChevronRight size={11} /> {tool.to}</span></span>
                    <Icon className="tool-nav-icon" size={17} strokeWidth={1.7} />
                  </button>
                );
              })}
            </nav>
            <div className="rail-footer">
              <div className="privacy-seal"><LockKeyhole size={14} /><span>Local by design</span></div>
              <p>Source text stays on this device. SmartGen never sees the draft.</p>
            </div>
          </aside>

          <div className="workbench-main">
            <div className="workbench-intro">
              <div>
                <p className="section-kicker">The workbench</p>
                <h2>{activeTool.label}</h2>
              </div>
              <div className="workbench-intro-right">
                <p>{activeTool.description}</p>
                <span className="active-plate"><Sparkles size={13} /> Active plate {activeTool.number}</span>
              </div>
            </div>

            <div className="editor-shell">
              <div className="editor-toolbar">
                <div className="editor-tool-label"><span className="toolbar-dot" /> Live conversion</div>
                <div className="editor-actions">
                  <button type="button" onClick={() => setInput(activeTool.sample)} title="Load example"><RefreshCcw size={14} /> Example</button>
                  <button type="button" onClick={() => { setInput(""); setCopied(false); }} title="Clear input"><Trash2 size={14} /> Clear</button>
                </div>
              </div>
              <div className="editor-grid">
                <div className="editor-panel input-panel">
                  <div className="panel-label-row"><label htmlFor="source-input">{activeTool.inputLabel}</label><span className="format-chip">{activeTool.from}</span></div>
                  <textarea id="source-input" value={input} onChange={(event) => { setInput(event.target.value); setCopied(false); }} placeholder={activeTool.inputPlaceholder} spellCheck={false} />
                  <div className="panel-footer"><span>{inputCount.toLocaleString()} characters</span><span><Keyboard size={13} /> Paste or type</span></div>
                </div>
                <div className="conversion-arrow" aria-hidden="true"><span><ArrowDown size={16} /></span></div>
                <div className="editor-panel output-panel">
                  <div className="panel-label-row"><span className="output-label">{activeTool.outputLabel}</span><span className="format-chip format-chip-blue">{activeTool.to}</span></div>
                  <pre className="output-preview"><code>{output || "Your converted result will appear here…"}</code></pre>
                  <div className="panel-footer output-footer"><span>{outputCount.toLocaleString()} characters</span><div className="output-actions"><button type="button" onClick={copyOutput} disabled={!output}><Clipboard size={13} /> {copied ? "Copied" : "Copy"}</button><button type="button" onClick={downloadOutput} disabled={!output}><Download size={13} /> Save</button></div></div>
                </div>
              </div>
            </div>

            <div className="shortcut-bar"><span><Command size={13} /> Quick note</span><p>Everything updates as you type. For best results, start with a complete paragraph or block.</p><button type="button" onClick={() => { setInput(""); toast.success("Workbench cleared."); }}><Minus size={13} /> Reset stage</button></div>
          </div>
        </section>

        <section className="manifesto-section">
          <div className="manifesto-label"><span className="manifesto-number">02</span><span>Why it exists</span></div>
          <div className="manifesto-copy"><h2>A single shelf for<br /><em>the in-between work.</em></h2><p>Content rarely stays in one format. SmartGen makes the small, essential transformations feel considered — so you can move from a draft to a document, a snippet to a page, or an export to an editable source without opening another tab.</p><a href="#workbench" className="text-link">Choose a different tool <ChevronRight size={15} /></a></div>
          <div className="manifesto-art" aria-label="Editorial schematic showing text moving between formats"><div className="format-schematic"><span className="schematic-cross cross-one">+</span><span className="schematic-cross cross-two">+</span><div className="format-plate plate-one"><span className="plate-code">TXT</span><span className="plate-lines"><i /><i /><i /></span></div><ChevronRight className="schematic-arrow arrow-one" size={18} /><div className="format-plate plate-two"><span className="plate-code">MD</span><span className="plate-lines"><i /><i /><i /></span></div><ChevronRight className="schematic-arrow arrow-two" size={18} /><div className="format-plate plate-three"><span className="plate-code">HTML</span><span className="plate-lines"><i /><i /><i /></span></div></div></div>
        </section>

        <section className="principles-section">
          <div className="principles-heading"><p className="section-kicker">Built around three simple rules</p><h2>Quietly powerful.<br /><em>Deliberately private.</em></h2></div>
          <div className="principles-list">
            <article className="principle"><span className="principle-index">A</span><h3>Stay local</h3><p>Your source text never leaves the browser. There is no upload queue, account wall, or hidden processing step.</p></article>
            <article className="principle"><span className="principle-index">B</span><h3>Show the structure</h3><p>Inputs, outputs, counts, and format labels stay visible so you always know what is happening to the content.</p></article>
            <article className="principle"><span className="principle-index">C</span><h3>Leave with the result</h3><p>Copy directly into your workflow or save a clean file in one click. No unnecessary ceremony between you and the output.</p></article>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-grid" aria-hidden="true" />
          <div className="closing-inner"><div className="closing-mark"><img src={ASSETS.logo} alt="" /><span>SMARTGEN / 2026</span></div><h2>Your words, <em>in the right shape.</em></h2><a href="#workbench" className="primary-action">Convert the next draft <ArrowDown size={16} /></a></div>
        </section>
      </main>

      <footer className="site-footer"><span>© 2026 SmartGen Labs</span><span>Made for the work between ideas and publishing.</span><a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" rel="noreferrer">Open source repository <ArrowUpRight size={12} /></a></footer>
    </div>
  );
}
