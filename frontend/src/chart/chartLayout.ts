import { CHART_AXIS, CHART_FONT, CHART_TITLE } from "./defaults";

export function chartTitlePrimary(text: string) {
  return {
    display: true as const,
    text,
    color: CHART_TITLE.color,
    font: {
      family: CHART_FONT,
      size: CHART_TITLE.fontSize,
      weight: "bold" as const,
    },
    padding: {
      top: CHART_TITLE.paddingTop,
      bottom: CHART_TITLE.paddingBottom,
    },
  };
}

export function chartSubtitle(text: string) {
  return {
    display: true as const,
    text,
    color: CHART_AXIS.tick,
    font: { family: CHART_FONT, size: 11, weight: "normal" as const },
    padding: { bottom: 10 },
  };
}

export function chartAxisTitle(text: string) {
  return {
    display: true as const,
    text,
    color: CHART_AXIS.title,
    font: {
      family: CHART_FONT,
      size: CHART_AXIS.titleFontSize,
      weight: "bold" as const,
    },
    padding: { bottom: 6 },
  };
}
