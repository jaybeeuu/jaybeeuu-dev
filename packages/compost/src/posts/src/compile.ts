import { joinUrlPath } from"@bickley-wallace/utilities";
import highlight from "highlight.js";
import marked, { MarkedOptions, Slugger }  from "marked";
import sanitizeHtml, { IOptions } from "sanitize-html";
import { readTextFile } from "../../files";

interface RenderContext {
  hrefRoot: string;
  postSlug: string
}

class CustomRenderer extends marked.Renderer {
  private renderContext: RenderContext;
  constructor(renderContext: RenderContext, markedOptions?: MarkedOptions) {
    super(markedOptions);
    this.renderContext = renderContext;
  }

  code(code: string, language: string | undefined, isEscaped: any): string {
    const rendered = super.code(code, language, isEscaped);
    const adjusted = rendered.replace(/<pre>/, "<pre class=\"hljs\">");
    return adjusted;
  }

  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6, raw: string, slugger: Slugger): string {
    const escapedText = text.toLowerCase()
      .replace(/<.*?>/g, "")
      .replace(/[^ a-z]+/g, "")
      .replace(/[ ]/g, "-");

    const headerSlug = slugger.slug(escapedText);
    const href = `${joinUrlPath(
      this.renderContext.hrefRoot,
      this.renderContext.postSlug,
    )}#${headerSlug}`;

    return [
      "",
      `<h${level}>`,
      `  <a name="${headerSlug}" href="${href}"></a>`,
      `  ${text}`,
      `</h${level}>`
    ].join("\n");
  }
}

const markedOptions = {
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

export const compilePost = async (markdownFilePath: string, renderContext: RenderContext): Promise<string> => {
  const fileAsString = await readTextFile(markdownFilePath);
  const renderer = new CustomRenderer(renderContext);
  const html = marked(fileAsString, { renderer, ...markedOptions });
  return sanitizeHtml(html, sanitizeOptions);
};
