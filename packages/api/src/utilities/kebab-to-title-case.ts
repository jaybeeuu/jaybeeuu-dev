export const kebabToTitleCase = (kebab: string):string => {
  return kebab.split("-").map((word) => {
    const firstLetter = word.substring(0,1);
    const rest = word.substring(1);
    return `${firstLetter.toUpperCase()}${rest}`;
  }).join(" ");
};