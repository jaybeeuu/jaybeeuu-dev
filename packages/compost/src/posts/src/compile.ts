import path from "path";
import highlight from "highlight.js";
import type { MarkedOptions, Slugger } from "marked";
import marked  from "marked";
import type { IOptions } from "sanitize-html";
import sanitizeHtml from "sanitize-html";
import { assertIsNotNullish } from "@jaybeeuu/utilities";
import { readTextFile } from "../../files/index.js";

interface RenderContext {
  hrefRoot: string;
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
    const href = `#${headerSlug}`;

    return [
      "",
      `<h${level} id="${headerSlug}">`,
      `  ${text}`,
      `  <a class="hash-link" name="${headerSlug}" href="${href}"></a>`,
      `</h${level}>`
    ].join("\n");
  }

  image(href: string | null, title: string | null, text: string): string {
    assertIsNotNullish(href);
    //todo: consider http(s) and non relative paths.
    const transformedHref = `/${path.posix.join(this.renderContext.hrefRoot, href)}`;
    return super.image(transformedHref, title, text);
  }
}

const markedOptions = {
  highlight: (code: string, language: string): string => {
    const validLanguage = highlight.getLanguage(language) ? language : "text";
    const highlighted = highlight.highlight(code, { language: validLanguage }).value;
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
  allowedTags: [ ...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "span" ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["class", ...sanitizeHtml.defaults.allowedAttributes.a],
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
    img: ["alt", "src"],
    pre: ["class"],
    span: ["class"]
  }
};

export const compilePost = async (markdownFilePath: string, renderContext: RenderContext): Promise<string> => {
  const fileAsString = await readTextFile(markdownFilePath);
  const renderer = new CustomRenderer(renderContext);
  const html = marked(fileAsString, { renderer, ...markedOptions });
  return sanitizeHtml(html, sanitizeOptions);
};
