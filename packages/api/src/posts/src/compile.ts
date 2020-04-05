import highlight from "highlight.js";
import fs from "fs";
import marked  from "marked";

const markedOptions = {
  renderer: new marked.Renderer(),
  highlight: (code: string, language: string): string => {
    const validLanguage = highlight.getLanguage(language) ? language : "plaintext";
    return highlight.highlight(validLanguage, code).value;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
};

export const compilePost = async (markdownFilePath: string): Promise<string> => {
  const fileAsString = await fs.promises.readFile(markdownFilePath, "utf8");
  return marked(fileAsString, markedOptions);
};
