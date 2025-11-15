import path from "node:path";
import type { CheckedBy } from "@jaybeeuu/is";
import { is, isLiteral, isObject, isUnionOf } from "@jaybeeuu/is";
import type { BaseOutputMeta } from "../content/services/manifest/index.js";
import type { Manifest } from "../content/services/manifest/manifest-operations.js";
import type { ContentTypeDefinition } from "../content/content-types.js";

const techRadarQuadrantValidator = isUnionOf(
  isLiteral("languages"),
  isLiteral("tools"),
  isLiteral("techniques"),
  isLiteral("platforms"),
);
export type TechRadarQuadrant = CheckedBy<typeof techRadarQuadrantValidator>;

/**
 * Tech radar adoption rings indicating recommendation level.
 */
const techRadarRingValidator = isUnionOf(
  isLiteral("adopt"),
  isLiteral("trial"),
  isLiteral("assess"),
  isLiteral("hold"),
);
export type TechRadarRing = CheckedBy<typeof techRadarRingValidator>;

/**
 * Input metadata for tech radar files (from frontmatter/JSON).
 */
export const isTechRadarInputMetadata = isObject({
  title: is("string"),
  quadrant: techRadarQuadrantValidator,
  ring: techRadarRingValidator,
  description: is("string"),
  publish: is("boolean"),
} as const);
export type TechRadarInputMetadata = CheckedBy<typeof isTechRadarInputMetadata>;

/**
 * Output metadata for tech radar items (goes into manifest entries).
 */
export interface TechRadarOutputMetadata {
  title: string;
  quadrant: TechRadarQuadrant;
  ring: TechRadarRing;
  description: string;
}

/**
 * Complete metadata interface for compiled tech radar manifest entries.
 * Combines base output metadata with tech radar-specific output metadata.
 */
export type TechRadarManifestEntry = BaseOutputMeta & TechRadarOutputMetadata;

export type TechRadarManifest = Manifest<TechRadarOutputMetadata>;

/**
 * Content type definition for tech radar items.
 */
export const techRadarContentTypeDefinition = {
  contentType: "tech-radar",
  filePatterns: {
    frontmatter: [".tech.md", ".tech-radar.md"],
    jsonMetadata: [".md"],
    jsonSuffix: ".tech.json",
  },
  generateSlug: (filePath: string, sourceDir: string) => {
    const relativePath = path.relative(sourceDir, filePath);
    return path
      .basename(relativePath, path.extname(relativePath))
      .replace(/\.(tech|tech-radar)$/, "");
  },
  generateFileName: (slug: string) => {
    return `${slug}.html`;
  },
  validateInputMeta: (data: unknown): data is TechRadarInputMetadata => {
    return isTechRadarInputMetadata(data);
  },
  mapToOutputMeta: (input: TechRadarInputMetadata) => {
    return {
      title: input.title,
      quadrant: input.quadrant,
      ring: input.ring,
      description: input.description,
    };
  },
  requireOldManifest: false,
  manifestFileName: "tech-radar-manifest.json",
  sourceDir: "src",
  outputDir: "out",
  hrefRoot: "/",
  includeUnpublished: false,
  codeLineNumbers: false,
  removeH1: false,
} satisfies ContentTypeDefinition<
  "tech-radar",
  TechRadarInputMetadata,
  TechRadarOutputMetadata
>;
