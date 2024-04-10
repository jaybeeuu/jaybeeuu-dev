interface ResponsiveImageOutput {
  src: string;
  srcSet: string;
  placeholder: string;
  images: { path: string; width: number; height: number }[];
  width: number;
  height: number;
  toString: () => string;
}

declare module "*.jpg?placeholder" {
  const src: string;
  export default src;
}
declare module "*.jpg?background" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const fileUrl: string;
  export default fileUrl;
}

declare module "*.png" {
  const fileUrl: string;
  export default fileUrl;
}

declare module "*.jpg" {
  const fileUrl: string;
  export default fileUrl;
}
