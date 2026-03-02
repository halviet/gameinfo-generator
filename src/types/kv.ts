import type { KVValue } from "s2-gameinfo";


export const CATEGORIES = [
    "HUD",
    "Shadows & Lightning",
] as const;
export type Category = typeof CATEGORIES[number]

export interface CV {
    name: string;
    defaultVal?: KVValue;
    description?: string;
    category?: Category;
}

export const ConVars: CV[] = [
    // HUD
    {
        name: "cl_test_hud",
        defaultVal: 0,
        description: "Test description for cl_test_hud",
        category: "HUD",
    },

    // Shadows & Lightning
    {
        name: "cl_test_sl",
        defaultVal: 0,
        description: "Test description for cl_test_sl",
        category: "Shadows & Lightning"
    },

    // Uncategorized
    {
        name: "cl_test_uncat",
        defaultVal: 0,
        description: "Test description for cl_test_uncat",
    }
]