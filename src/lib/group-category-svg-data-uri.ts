export function groupCategorySvgDataUri(svg: string, color: string): string {
  const coloredSvg = svg.replace(/\bcurrentColor\b/g, color);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(coloredSvg)}`;
}
