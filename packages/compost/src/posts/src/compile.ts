import sanitizeHtml, { IOptions } from "sanitize-html";
import highlight from "highlight.js";
import marked, { MarkedOptions }  from "marked";
import { readTextFile } from "../../files";

class CustomRenderer extends marked.Renderer {
  constructor(markedOptions?: MarkedOptions) {
    super(markedOptions);
  }

  code(code: string, language: string | undefined, isEscaped: any): string {
    const rendered = super.code(code, language, isEscaped);
    const adjusted = rendered.replace(/<pre>/, "<pre class=\"hljs\">");
    return adjusted;
  }
}

const markedOptions = {
  renderer: new CustomRenderer(),
  highlight: (code: string, language: string): string => {
    const validLanguage = highlight.getLanguage(language) ? language : "plaintext";
    const highlighted = highlight.highlight(validLanguage, code).value;
    return highlighted;
  },
  gfm: true,
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
    span: ["class"],
    pre: ["class"]
  }
};

export const compilePost = async (markdownFilePath: string): Promise<string> => {
  const fileAsString = await readTextFile(markdownFilePath);
  const html = marked(fileAsString, markedOptions);
  return sanitizeHtml(html, sanitizeOptions);
};
