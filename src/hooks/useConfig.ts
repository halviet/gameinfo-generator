import {createContext, useContext} from "react";
import type {Config, ConfigAction} from "@/types/context.ts";

export interface ConfigContextType {
    cfg: Config;
    dispatch: (action: ConfigAction) => void;
    exportGI: () => void;
    exportJSON: () => void;
}

export const ConfigContext = createContext<ConfigContextType | null>(null)

export function useConfig() {
    const ctx = useContext(ConfigContext);
    if (!ctx) throw new Error('useConfig must be used within context');
    return ctx;
}