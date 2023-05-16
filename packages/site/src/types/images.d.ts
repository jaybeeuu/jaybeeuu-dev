interface ResponsiveImageOutput {
  src: string
  srcSet: string
  placeholder: string | undefined
  images: { path: string; width: number; height: number }[]
  width: number
  height: number
  toString: () => string
}

declare module "*.background.jpg" {
  const src: ResponsiveImageOutput;
  export default src;
}

declare module "*.jpg" {
  const fileUrl: string;
  export default fileUrl;
}

declare module "*.svg" {
  const svgUrl: string;
  export default svgUrl;
}
declare module "*.png" {
  const pngUrl: string;
  export default pngUrl;
}
