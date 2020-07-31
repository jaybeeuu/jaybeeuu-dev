import sanitizeHtml, { IOptions } from "sanitize-html";
import highlight from "highlight.js";
import marked  from "marked";
import { readTextFile } from "../../files";

const markedOptions = {
  renderer: new marked.Renderer(),
  highlight: (code: string, language: string): string => {
    const validLanguage = highlight.getLanguage(language) ? language : "plaintext";
    return highlight.highlight(validLanguage, code).value;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
};

const sanitizeOptions: IOptions = {
  ...sanitizeHtml.defaults,
  disallowedTagsMode: process.env.NODE_ENV === "production" ? "discard" : "recursiveEscape",
  allowedTags: [ ...sanitizeHtml.defaults.allowedTags, "h1", "h2", "span" ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    span: ["class"]
  }
};

export const compilePost = async (markdownFilePath: string): Promise<string> => {
  const fileAsString = await readTextFile(markdownFilePath);
  const html = marked(fileAsString, markedOptions);
  return sanitizeHtml(html, sanitizeOptions);
};
