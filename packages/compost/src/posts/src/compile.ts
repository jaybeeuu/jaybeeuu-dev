import path from "path";
import highlight from "highlight.js";
import type { MarkedOptions, Slugger } from "marked";
import marked  from "marked";
import type { IOptions } from "sanitize-html";
import sanitizeHtml from "sanitize-html";
import { assertIsNotNullish } from "@jaybeeuu/utilities";
import { canAccessSync, Mode, readTextFile, readTextFileSync } from "../../files/index.js";
import { getHash } from "../../hash.js";
import type { Result } from "../../results.js";
import { success, failure } from "../../results.js";

export interface RenderContext {
  hrefRoot: string;
  sourceFilePath: string;
}

export interface Assets {
  sourcePath: string;
  destinationPath: string;
}

const escapeText = (text: string): string => {
  return text.toLowerCase()
    .replace(/<.*?>/g, "")
    .replace(/[^ a-z]+/g, "")
    .replace(/[ ]/g, "-");
};

class CustomRenderer extends marked.Renderer {
  #renderContext: RenderContext;
  #assets: Assets[] = [];

  public get assets(): Assets[] {
    return this.#assets;
  }

  constructor(renderContext: RenderContext, markedOptions?: MarkedOptions) {
    super(markedOptions);
    this.#renderContext = renderContext;
  }

  code(code: string, language: string | undefined, isEscaped: any): string {
    const rendered = super.code(code, language, isEscaped);
    const adjusted = rendered.replace(/<pre>/, "<pre class=\"hljs\">");
    return adjusted;
  }

  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6, raw: string, slugger: Slugger): string {
    const escapedText = escapeText(text);
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

    if (href.startsWith("https:") || href.startsWith("http:")) {
      return super.image(href, title, text);
    }

    // TODO: consider http(s) and non relative paths.
    const resolvedImagePath = path.resolve(
      path.dirname(this.#renderContext.sourceFilePath),
      href
    );

    if (!canAccessSync(resolvedImagePath, Mode.read)) {
      throw new Error(`Unable to access image file: ${resolvedImagePath}`);
    }
    const imageFileContent = readTextFileSync(resolvedImagePath);
    const imageHash = getHash(imageFileContent);
    const [imageFileName, imageFileExtension] = path.basename(resolvedImagePath).split(".");
    const hashedFileName = `${imageFileName}-${imageHash}.${imageFileExtension}`;
    const transformedHref = path.posix.join(
      this.#renderContext.hrefRoot,
      hashedFileName
    );
    this.assets.push({
      sourcePath: resolvedImagePath,
      destinationPath: hashedFileName
    });
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

export type CompileFailureReason = `Failed to compile ${string}`;

export interface CompiledPost {
  html: string;
  assets: Assets[];
}

export const compilePost = async (
  renderContext: RenderContext
): Promise<Result<CompiledPost, CompileFailureReason>> => {
  try {
    const fileAsString = await readTextFile(renderContext.sourceFilePath);
    const renderer = new CustomRenderer(renderContext);
    const html = marked(fileAsString, { renderer, ...markedOptions });
    const sanitized = sanitizeHtml(html, sanitizeOptions);
    return success({
      html: sanitized,
      assets: renderer.assets
    });
  } catch (error) {
    return failure(`Failed to compile ${renderContext.sourceFilePath}`, error);
  }
};
