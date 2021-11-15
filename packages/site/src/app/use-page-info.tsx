import { useEffect } from "preact/hooks";

const initialTitle = document.title;

const metaElement = document.querySelector("meta[name=\"description\"]");
const initialDescription = metaElement?.getAttribute("content") ?? "";

export interface PageMeta {
  title: string;
  description: string;
}

export const usePageInfo = ({ title, description }: PageMeta): void => {
  useEffect(() => {
    document.title = `${initialTitle} - ${title}`;
    metaElement?.setAttribute("content", `${initialDescription} - ${description}`);

    return () => {
      document.title = initialTitle;
      metaElement?.setAttribute("content", initialDescription);
    };
  }, [title, description]);
};
