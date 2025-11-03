import { is, isLiteral, isObject, isUnionOf } from "@jaybeeuu/is";
import type { PostMetaFileData } from "./processors/posts/types.js";

/**
 * Metadata interface for tech radar entries.
 *
 * Defines the structure for technology items on a tech radar,
 * including their position (quadrant/ring) and descriptive information.
 */
export interface TechRadarMetaFileData {
  /** Display name of the technology */
  title: string;

  /** Technology category quadrant */
  quadrant: "languages" | "tools" | "techniques" | "platforms";

  /** Adoption recommendation level */
  ring: "adopt" | "trial" | "assess" | "hold";

  /** Detailed description of the technology and recommendation */
  description: string;

  /** Whether this entry should be published */
  publish: boolean;
}

/**
 * Type-safe mapping of content type identifiers to their metadata interfaces.
 *
 * This ensures that each content type has a well-defined metadata structure
 * and enables type-safe content resolution.
 */
export interface ContentMetaDataMap {
  /** Blog post content type */
  post: PostMetaFileData;

  /** Tech radar entry content type */
  "tech-radar": TechRadarMetaFileData;
}

/** Union type of all supported content type identifiers */
export type ContentType = keyof ContentMetaDataMap;

// Validators for each content type
export const isPostMetaData = isObject<PostMetaFileData>({
  abstract: is("string"),
  publish: is("boolean"),
  title: is("string"),
});

export const isTechRadarMetaData = isObject<TechRadarMetaFileData>({
  title: is("string"),
  quadrant: isUnionOf(
    isLiteral("languages"),
    isLiteral("tools"),
    isLiteral("techniques"),
    isLiteral("platforms"),
  ),
  ring: isUnionOf(
    isLiteral("adopt"),
    isLiteral("trial"),
    isLiteral("assess"),
    isLiteral("hold"),
  ),
  description: is("string"),
  publish: is("boolean"),
});
