import type { ContentResolverConfigMap } from "./content-resolver.js";
import type { ContentMetaDataMap, ContentType } from "./content-types.js";
import { isPostMetaData, isTechRadarMetaData } from "./content-types.js";

// Configuration for all supported content types
export const contentResolverConfig: ContentResolverConfigMap<
  ContentType,
  ContentMetaDataMap
> = {
  post: {
    contentType: "post",
    validator: isPostMetaData,
    filePatterns: {
      frontmatter: [".post.md"],
      jsonMetadata: [".md"],
      jsonSuffix: ".post.json",
    },
  },
  "tech-radar": {
    contentType: "tech-radar",
    validator: isTechRadarMetaData,
    filePatterns: {
      frontmatter: [".tech.md", ".tech-radar.md"],
      jsonMetadata: [".md"],
      jsonSuffix: ".tech.json",
    },
  },
};

// Example usage:
// const result = await resolveContent("./some-file.post.md", contentResolverConfig);
// if (result.success) {
//   result.value.type;      // "post" | "tech-radar"
//   result.value.metadata;  // PostMetaFileData | TechRadarMetaFileData
//   result.value.content;   // string
// }
