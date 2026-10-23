// build.mjs loads .svg files as text: an import gives the SVG markup.
declare module '*.svg' {
  const svg: string;
  export default svg;
}
