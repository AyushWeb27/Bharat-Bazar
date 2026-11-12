import sanitizeHtml from "sanitize-html";

const svgTags = [
  "svg",
  "g",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "defs",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "filter",
  "feGaussianBlur",
  "feOffset",
  "feColorMatrix",
  "feBlend",
  "symbol",
  "use",
  "title",
  "desc",
];

const svgAttributes = {
  svg: ["xmlns", "viewBox", "width", "height", "fill", "stroke", "preserveAspectRatio"],
  g: ["id", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "transform", "opacity", "clip-path", "mask"],
  path: ["id", "d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule", "clip-rule", "transform", "opacity", "clip-path", "mask"],
  circle: ["id", "cx", "cy", "r", "fill", "stroke", "stroke-width", "transform", "opacity"],
  rect: ["id", "x", "y", "width", "height", "rx", "ry", "fill", "stroke", "stroke-width", "transform", "opacity"],
  line: ["id", "x1", "y1", "x2", "y2", "fill", "stroke", "stroke-width", "stroke-linecap", "transform", "opacity"],
  polyline: ["id", "points", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "transform", "opacity"],
  polygon: ["id", "points", "fill", "stroke", "stroke-width", "stroke-linejoin", "transform", "opacity"],
  ellipse: ["id", "cx", "cy", "rx", "ry", "fill", "stroke", "stroke-width", "transform", "opacity"],
  linearGradient: ["id", "x1", "x2", "y1", "y2", "gradientUnits", "gradientTransform", "href", "xlink:href"],
  radialGradient: ["id", "cx", "cy", "r", "fx", "fy", "gradientUnits", "gradientTransform", "href", "xlink:href"],
  stop: ["offset", "stop-color", "stop-opacity"],
  clipPath: ["id", "clipPathUnits", "transform"],
  mask: ["id", "x", "y", "width", "height", "maskunits", "maskcontentunits"],
  filter: ["id", "x", "y", "width", "height", "filterunits", "primitiveunits"],
  feGaussianBlur: ["in", "stddeviation"],
  feOffset: ["in", "dx", "dy"],
  feColorMatrix: ["in", "type", "values"],
  feBlend: ["in", "in2", "mode"],
  symbol: ["id", "viewBox", "preserveAspectRatio"],
  use: ["id", "href", "xlink:href", "x", "y", "width", "height", "transform", "fill", "stroke"],
  title: [],
  desc: [],
};

export function sanitizeGroupCategorySvg(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const source = value
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^```(?:svg|xml)?\s*/i, "")
    .replace(/^<\?xml[^?]*\?>\s*/i, "")
    .replace(/^```(?:svg|xml)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  if (!source) return "";
  if (
    source.length > 12_000 ||
    !/^<svg(?:\s|>)[\s\S]*<\/svg>$/i.test(source)
  ) {
    return null;
  }

  const safeSvg = sanitizeHtml(source, {
    allowedTags: svgTags,
    allowedAttributes: svgAttributes,
    allowedSchemes: [],
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
    transformTags: {
      "*": (tagName, attributes) => {
        const safeAttributes = { ...attributes };
        for (const attribute of ["fill", "stroke", "clip-path", "mask", "filter"]) {
          const value = safeAttributes[attribute] || "";
          if (
            /url\s*\(/i.test(value) &&
            !/^url\(\s*#[\w:.-]+\s*\)$/i.test(value)
          ) {
            delete safeAttributes[attribute];
          }
        }
        for (const attribute of ["href", "xlink:href"]) {
          if (safeAttributes[attribute] && !/^#[\w:.-]+$/.test(safeAttributes[attribute])) {
            delete safeAttributes[attribute];
          }
        }
        if (safeAttributes.id && !/^[\w:.-]+$/.test(safeAttributes.id)) {
          delete safeAttributes.id;
        }
        return { tagName, attribs: safeAttributes };
      },
    },
  });

  if (
    !/^<svg\b[\s\S]*<\/svg>$/i.test(safeSvg) ||
    !/<(?:path|circle|rect|line|polyline|polygon|ellipse)\b/i.test(safeSvg)
  ) {
    return null;
  }
  return safeSvg;
}
