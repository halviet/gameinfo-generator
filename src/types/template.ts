export const TEMPLATES = [
    "Piggy",
    "Piggy & pidjan",
    "Maihdenless",
    "test",
] as const;
export type Template = typeof TEMPLATES[number]
export const TEMPLATE_DEFAULT: Template = "test"