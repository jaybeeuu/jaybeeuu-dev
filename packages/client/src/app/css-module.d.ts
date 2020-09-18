declare module "*.module.css" {
  interface CssExports {
    [className: string]: string;
  }
  const cssExports: CssExports;
  export default cssExports;
}
