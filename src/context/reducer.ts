import type {Config, ConfigAction} from "@/types/context.ts";

export const initialConfig: Config = {
    gi: null,
    template: '',
    mods: true,
    modifyWholeGI: false,
    output: 'gameinfo'
}

export function configReducer(s: Config, a: ConfigAction): Config {
    switch (a.type) {
        case "set.gi":
            return { ...s, gi: a.payload };
        case "set.template":
            return { ...s, template: a.payload };
        case "set.mods":
            return { ...s, mods: a.payload };
        case "set.modifyWholeGI":
            return { ...s, modifyWholeGI: a.payload };
        case "set.output":
            return { ...s, output: a.payload };
        case 'reset':
            return initialConfig;
        default:
            return s;
    }
}