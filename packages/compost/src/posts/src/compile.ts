import path from "path";
// import highlight from "highlight.js";
import type { Result } from "@jaybeeuu/utilities";
import {
  assertIsNotNullish,
  failure,
  joinUrlPath,
  success,
} from "@jaybeeuu/utilities";
import type { MarkedOptions } from "marked";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import type { SynchronousOptions } from "marked-highlight";
import { markedHighlight } from "marked-highlight";
import { mangle } from "marked-mangle";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import type { IOptions } from "sanitize-html";
import sanitizeHtml from "sanitize-html";
import { canAccessSync, readTextFileSync } from "../../files/index.js";
import { getHash } from "../../hash.js";
import { getSlug } from "./file-paths.js";

export interface RenderContext {
  codeLineNumbers: boolean;
  hrefRoot: string;
  removeH1: boolean;
  sourceFilePath: string;
  sourceFileText: string;
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
    .replace(/[^ \-a-z0-9]/g, "")
    .replace(/ /g, "-");
};

const markdownExtensionRegexp = /\.(md|markdown)$/;

const isPostHref = (href: string): href is string => {
  const isMarkdownFile = markdownExtensionRegexp.test(href);

  const canAccessMarkdown = canAccessSync(href, "read");

  if (!isMarkdownFile || !canAccessMarkdown) {
    return false;
  }

  const postMetaFilePath = href.replace(markdownExtensionRegexp, ".post.json");

  return canAccessSync(postMetaFilePath);
};

const getAssetDetails = (
  resolvedFilePath: string,
  hrefRoot: string,
): { hashedFileName: string; href: string } => {
  if (!canAccessSync(resolvedFilePath, "read")) {
    throw new Error(`Unable to access file: ${resolvedFilePath}`);
  }

  const fileContent = readTextFileSync(resolvedFilePath);
  const fileHash = getHash(fileContent);
  const { name: imageFileName, ext: imageFileExtension } =
    path.parse(resolvedFilePath);
  const hashedFileName = `${imageFileName}-${fileHash}${imageFileExtension}`;
  const href = joinUrlPath(hrefRoot, hashedFileName);

  return { href, hashedFileName };
};

class Slugger {
  slugCountMap = new Map<string, number>();

  slug(text: string): string {
    const slug = escapeText(text);
    const count = this.slugCountMap.get(slug) ?? 0;
    this.slugCountMap.set(slug, count + 1);

    return count === 0 ? slug : `${slug}-${count}`;
  }
}

class CustomRenderer extends marked.Renderer {
  readonly #assets: Assets[] = [];
  readonly #renderContext: RenderContext;
  readonly #slugger = new Slugger();

  // public readonly code: Renderer["code"];
  // public readonly image: Renderer["image"];

  public get assets(): Assets[] {
    return this.#assets;
  }

  constructor(renderContext: RenderContext, markedOptions?: MarkedOptions) {
    super(markedOptions);
    this.#renderContext = renderContext;

    this.code = function (...args) {
      return this.innerCode(...args);
    };
    this.image = function (...args) {
      return this.innerImage(...args);
    };
  }

  private innerCode(
    code: string,
    language: string | undefined,
    isEscaped: boolean,
  ): string {
    const rendered = super.code(code, language, isEscaped);

    const preClasses = [
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      `language-${language || "none"}`,
      this.#renderContext.codeLineNumbers && "line-numbers",
    ]
      .filter(Boolean)
      .join(" ");

    const adjusted = rendered.replace(/<pre>/, `<pre class="${preClasses}">`);

    if (this.#renderContext.codeLineNumbers) {
      const lineNumberRows = [
        '<span aria-hidden="true" class="line-number-rows">',
        ...Array.from(
          { length: code.split("\n").length },
          () => "<span></span>",
        ),
        "</span>",
      ].join("");

      return adjusted.replace(/<\/code>/, `${lineNumberRows}</code>`);
    }

    return adjusted;
  }

  private innerImage(
    href: string | null,
    title: string | null,
    text: string,
  ): string {
    assertIsNotNullish(href);

    if (href.startsWith("https:") || href.startsWith("http:")) {
      return super.image(href, title, text);
    }

    const resolvedImagePath = path.resolve(
      path.dirname(this.#renderContext.sourceFilePath),
      href,
    );

    const { href: transformedHref, hashedFileName } = getAssetDetails(
      resolvedImagePath,
      this.#renderContext.hrefRoot,
    );

    this.assets.push({
      sourcePath: resolvedImagePath,
      destinationPath: hashedFileName,
    });

    return super.image(transformedHref, title, text);
  }

  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6): string {
    if (level === 1 && this.#renderContext.removeH1) {
      return "";
    }
    const htmlContent = innerHTML(text);
    const escapedText = escapeText(htmlContent);
    const headerSlug = this.#slugger.slug(escapedText);
    const href = `#${headerSlug}`;

    return [
      "",
      `<h${level} id="${headerSlug}">`,
      `  ${text}`,
      `  <a class="hash-link" title="${htmlContent}" href="${href}"></a>`,
      `</h${level}>`,
    ].join("\n");
  }

  link(href: string, title: string | null, text: string): string {
    const resolvedHrefPath = path.resolve(
      path.dirname(this.#renderContext.sourceFilePath),
      href,
    );

    switch (true) {
      case isPostHref(resolvedHrefPath): {
        return super.link(
          joinUrlPath(this.#renderContext.hrefRoot, getSlug(resolvedHrefPath)),
          title,
          text,
        );
      }
      case href.startsWith("."): {
        const asset = getAssetDetails(
          resolvedHrefPath,
          this.#renderContext.hrefRoot,
        );

        this.assets.push({
          sourcePath: resolvedHrefPath,
          destinationPath: asset.hashedFileName,
        });

        return super.link(asset.href, title, text);
      }
      default:
        return super.link(href, title, text);
    }
  }
}

const markedOptions = {
  gfm: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
};

const markedHighlightOptions: SynchronousOptions = {
  highlight: (code: string, language: string): string => {
    if (!language) {
      return code;
    }

    loadLanguages(language);
    const prismLanguage = Prism.languages[language];
    assertIsNotNullish(prismLanguage);
    const highlighted = Prism.highlight(code, prismLanguage, "language");

    return highlighted;
  },
};

const sanitizeOptions: IOptions = {
  ...sanitizeHtml.defaults,
  disallowedTagsMode:
    process.env.NODE_ENV === "production" ? "discard" : "recursiveEscape",
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "h1",
    "h2",
    "span",
    "del",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["class", "title", ...(sanitizeHtml.defaults.allowedAttributes.a ?? [])],
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
    img: ["alt", ...(sanitizeHtml.defaults.allowedAttributes.img ?? [])],
    pre: ["class"],
    span: ["class", "aria-hidden"],
  },
};

export type CompileFailureReason = `Failed to compile ${string}`;

export interface CompiledPost {
  html: string;
  assets: Assets[];
}

marked.use(mangle(), gfmHeadingId(), markedHighlight(markedHighlightOptions));

export const compilePost = async (
  renderContext: RenderContext,
): Promise<Result<CompiledPost, CompileFailureReason>> => {
  try {
    const renderer = new CustomRenderer(renderContext);

    const html = await marked.parse(renderContext.sourceFileText, {
      renderer,
      ...markedOptions,
    });
    const sanitized = sanitizeHtml(html, sanitizeOptions);
    return success({
      html: sanitized,
      assets: renderer.assets,
    });
  } catch (error) {
    return failure(`Failed to compile ${renderContext.sourceFilePath}`, error);
  }
};
