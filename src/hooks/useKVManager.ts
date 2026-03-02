'use client';

import {type KVObject, type KVValue} from "s2-gameinfo";
import {useMemo} from "react";
import {ConVars} from "@/types/kv.ts";
import {toast} from "sonner";
import {useConfig} from "@/hooks/useConfig.ts";


type KVItems = Map<string, KVValue>

export interface CategoryKV {
    name: string;
    items: KVItems;
}

export function useKVManager() {
    const {cfg} = useConfig()

    return useMemo<CategoryKV[]>(() => {
        const cv = cfg.gi["ConVars"] as KVObject;

        if (typeof cv !== "object" || Object.keys(cv).length === 0) {
            toast.error("Parsing error: Invalid or empty ConVars value. ConVars will be empty.");
            return [];
        }

        const cats: Map<string, KVItems> = new Map();

        Object.entries(cv).forEach(([k, v]) => {
            const categoryName = ConVars.find(c => c.name === k)?.name ?? "uncategorized";

            if (!cats.has(categoryName)) cats.set(categoryName, new Map());
            cats.get(categoryName)!.set(k, v);
        })

        return Array.from(cats.entries()).map(([name, items]) => ({
            name,
            items
        }));
    }, [cfg.gi])
}