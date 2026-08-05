import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
export function renderBlogContent(markdown: string) { return sanitizeHtml(marked.parse(markdown, { async: false }) as string, { allowedTags: ["p", "h2", "h3", "strong", "em", "ul", "ol", "li", "blockquote", "a", "img", "br"], allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] }, allowedSchemes: ["http", "https", "mailto"] }); }
export function readingMinutes(content: string) { return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200)); }
