import path from "path";
// import highlight from "highlight.js";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import type {
  Renderer,
  Slugger
} from "marked";
import { marked } from "marked";
import type { IOptions } from "sanitize-html";
import sanitizeHtml from "sanitize-html";
import { assertIsNotNullish } from "@jaybeeuu/utilities";
import { canAccessSync, readTextFile, readTextFileSync } from "../../files/index.js";
import { getHash } from "../../hash.js";
import type { Result } from "../../results.js";
import { success, failure } from "../../results.js";

export interface RenderContext {
  codeLineNumbers: boolean;
  hrefRoot: string;
  removeH1: boolean;
  sourceFilePath: string;
}

export interface Assets {
  sourcePath: string;
  destinationPath: string;
}

const innerHTML = (text: string): string => {
  return text.replace(/<.*?>/g, "");
};

const escapeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^ a-z0-9]+/g, "")
    .replace(/[ ]/g, "-");
};

class CustomRenderer extends marked.Renderer {
  readonly #assets: Assets[] = [];
  readonly #renderContext: RenderContext;

  public readonly code: Renderer["code"];
  public readonly image: Renderer["image"];

  public get assets(): Assets[] {
    return this.#assets;
  }

  constructor(renderContext: RenderContext, markedOptions?: marked.MarkedOptions) {
    super(markedOptions);
    this.#renderContext = renderContext;

    const that: CustomRenderer = this;

    this.code = function (this: marked.RendererThis, ...args) {
      return that.innerCode(this, ...args);
    };
    this.image = function (this: marked.RendererThis, ...args) {
      return that.innerImage(this, ...args);
    };
  }

  private innerCode(
    rendererThis: marked.RendererThis,
    code: string,
    language: string | undefined,
    isEscaped: boolean
  ): string {
    const rendered = super.code.call(
      rendererThis,
      code,
      language,
      isEscaped
    );

    const preClasses = [
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      `language-${language || "none"}`,
      this.#renderContext.codeLineNumbers && "line-numbers"
    ].filter(Boolean).join(" ");

    const adjusted = rendered.replace(/<pre>/, `<pre class="${preClasses}">`);

    if (this.#renderContext.codeLineNumbers) {
      const lineNumberRows = [
        "<span aria-hidden=\"true\" class=\"line-number-rows\">",
        ...Array.from({ length: code.split("\n").length }, () => "<span></span>"),
        "</span>"
      ].join("");

      return adjusted.replace(/<\/code>/, `${lineNumberRows}</code>`);
    }

    return adjusted;
  }

  private innerImage(
    rendererThis: marked.RendererThis,
    href: string | null,
    title: string | null,
    text: string
  ): string {
    assertIsNotNullish(href);

    if (href.startsWith("https:") || href.startsWith("http:")) {
      return super.image.call(
        rendererThis,
        href,
        title,
        text
      );

    }

    const resolvedImagePath = path.resolve(
      path.dirname(this.#renderContext.sourceFilePath),
      href
    );

    if (!canAccessSync(resolvedImagePath, "read")) {
      throw new Error(`Unable to access image file: ${resolvedImagePath}`);
    }
    const imageFileContent = readTextFileSync(resolvedImagePath);
    const imageHash = getHash(imageFileContent);
    const { name: imageFileName, ext: imageFileExtension } = path.parse(resolvedImagePath);
    const hashedFileName = `${imageFileName}-${imageHash}${imageFileExtension}`;
    const transformedHref = path.posix.join(
      this.#renderContext.hrefRoot,
      hashedFileName
    );
    this.assets.push({
      sourcePath: resolvedImagePath,
      destinationPath: hashedFileName
    });
    return super.image.call(
      rendererThis,
      transformedHref,
      title,
      text
    );
  }

  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6, raw: string, slugger: Slugger): string {
    if (level === 1 && this.#renderContext.removeH1) {
      return "";
    }
    const htmlContent = innerHTML(text);
    const escapedText = escapeText(htmlContent);
    const headerSlug = slugger.slug(escapedText);
    const href = `#${headerSlug}`;

    return [
      "",
      `<h${level} id="${headerSlug}">`,
      `  ${text}`,
      `  <a class="hash-link" title="${htmlContent}" href="${href}"></a>`,
      `</h${level}>`
    ].join("\n");
  }
}

const markedOptions = {
  highlight: (code: string, language: string): string => {

    if (!language ) {
      return code;
    }
    loadLanguages(language);
    const prismLanguage = Prism.languages[language];
    assertIsNotNullish(prismLanguage);
    const highlighted = Prism.highlight(code, prismLanguage, "language");
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
  allowedTags: [ ...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "span", "del" ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["class", "title", ...sanitizeHtml.defaults.allowedAttributes.a ?? []],
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
    img: ["alt", ...sanitizeHtml.defaults.allowedAttributes.img ?? []],
    pre: ["class"],
    span: ["class", "aria-hidden"]
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
