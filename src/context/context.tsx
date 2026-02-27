import {type ReactNode, useReducer} from "react";
import {configReducer} from "./reducer";
import {initialConfig} from "@/context/reducer.ts";
import {composeGI, type KVObject} from "s2-gameinfo";
import { ConfigContext } from "@/hooks/useConfig";

export function ConfigProvider({children}: { children: ReactNode }) {
    const [cfg, dispatch] = useReducer(configReducer, initialConfig);

    const exportGI = () => {
        if (cfg.gi === null) return;

        const blob = new Blob([composeGI(cfg.gi as KVObject)], {
            type: ".gi",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = cfg.output + '.gi';
        a.click();
    }

    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(cfg.gi, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = cfg.output + '.json';
        a.click();
    }

    return (
        <ConfigContext.Provider value={{cfg, dispatch, exportGI, exportJSON}}>
            {children}
        </ConfigContext.Provider>
    )
}