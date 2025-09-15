import { describe, expect, it } from "@jest/globals";
import type { Stats } from "fs";
import { failure, success } from "@jaybeeuu/utilities";
import type { FileInfo } from "../files/index.js";
import { getMetaFileContent, isPostMetaFile } from "./metafile.js";

// Mock the files module
jest.mock("../files/index.js", () => ({
  readJsonFile: jest.fn(),
}));

import { readJsonFile } from "../files/index.js";

const mockReadJsonFile = jest.mocked(readJsonFile);

describe("metafile", () => {
  describe("isPostMetaFile", () => {
    it("returns true for valid PostMetaFileData", () => {
      const validData = {
        title: "Test Title",
        abstract: "Test abstract",
        publish: true,
      };

      expect(isPostMetaFile(validData)).toBe(true);
    });

    it("returns false when title is missing", () => {
      const invalidData = {
        abstract: "Test abstract",
        publish: true,
      };

      expect(isPostMetaFile(invalidData)).toBe(false);
    });

    it("returns false when abstract is missing", () => {
      const invalidData = {
        title: "Test Title",
        publish: true,
      };

      expect(isPostMetaFile(invalidData)).toBe(false);
    });

    it("returns false when publish is missing", () => {
      const invalidData = {
        title: "Test Title",
        abstract: "Test abstract",
      };

      expect(isPostMetaFile(invalidData)).toBe(false);
    });

    it("returns false when title is not a string", () => {
      const invalidData = {
        title: 123,
        abstract: "Test abstract",
        publish: true,
      };

      expect(isPostMetaFile(invalidData)).toBe(false);
    });

    it("returns false when abstract is not a string", () => {
      const invalidData = {
        title: "Test Title",
        abstract: 123,
        publish: true,
      };

      expect(isPostMetaFile(invalidData)).toBe(false);
    });

    it("returns false when publish is not a boolean", () => {
      const invalidData = {
        title: "Test Title",
        abstract: "Test abstract",
        publish: "true",
      };

      expect(isPostMetaFile(invalidData)).toBe(false);
    });

    it("returns false for null input", () => {
      expect(isPostMetaFile(null)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(isPostMetaFile(undefined)).toBe(false);
    });

    it("returns false for non-object input", () => {
      expect(isPostMetaFile("not an object")).toBe(false);
    });
  });

  describe("getMetaFileContent", () => {
    const mockFileInfo: FileInfo = {
      absolutePath: "/path/to",
      fileName: "meta.json",
      filePath: "/path/to/meta.json",
      relativeFilePath: "meta.json",
      relativePath: ".",
      stats: {} as Stats,
    };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("returns success when readJsonFile succeeds", async () => {
      const expectedData = {
        title: "Test Title",
        abstract: "Test abstract",
        publish: true,
      };

      mockReadJsonFile.mockResolvedValue(success(expectedData));

      const result = await getMetaFileContent(mockFileInfo);

      expect(result).toEqual({
        success: true,
        value: expectedData,
      });

      expect(mockReadJsonFile).toHaveBeenCalledWith(
        mockFileInfo.filePath,
        isPostMetaFile,
      );
    });

    it("returns failure when readJsonFile fails with no access", async () => {
      mockReadJsonFile.mockResolvedValue(
        failure("no access", "Could not access file"),
      );

      const result = await getMetaFileContent(mockFileInfo);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("read metadata failed");
        expect(result.message).toBe(
          "Reading metadata file meta.json failed.\nno access: Could not access file",
        );
      }
    });

    it("returns failure when readJsonFile fails with parse error", async () => {
      mockReadJsonFile.mockResolvedValue(
        failure("parse error", "Invalid JSON syntax"),
      );

      const result = await getMetaFileContent(mockFileInfo);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("read metadata failed");
        expect(result.message).toBe(
          "Reading metadata file meta.json failed.\nparse error: Invalid JSON syntax",
        );
      }
    });

    it("returns failure when readJsonFile fails with validation failed", async () => {
      mockReadJsonFile.mockResolvedValue(
        failure("validation failed", "Data does not match expected structure"),
      );

      const result = await getMetaFileContent(mockFileInfo);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("read metadata failed");
        expect(result.message).toBe(
          "Reading metadata file meta.json failed.\nvalidation failed: Data does not match expected structure",
        );
      }
    });
  });
});
