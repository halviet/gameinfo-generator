import type {Config, ConfigAction} from "@/types/context.ts";
import {createContext, useReducer, type ReactNode, useContext} from "react";
import {configReducer} from "./reducer";
import {initialConfig} from "@/context/reducer.ts";

interface ConfigContextType {
    cfg: Config;
    dispatch: (action: ConfigAction) => void;
    exportConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({children}: { children: ReactNode }) {
    const [cfg, dispatch] = useReducer(configReducer, initialConfig);

    const exportConfig = () => {
        const blob = new Blob([JSON.stringify(cfg, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = 'config.json';
        a.click();
    }

    return (
        <ConfigContext.Provider value={{cfg, dispatch, exportConfig}}>
            {children}
        </ConfigContext.Provider>
    )
}

export function useConfig() {
    const ctx = useContext(ConfigContext);
    if (!ctx) throw new Error('useConfig must be used within context');
    return ctx;
}