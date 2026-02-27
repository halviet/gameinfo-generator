'use client';

import type {KVObject, KVValue} from "s2-gameinfo";
import {useCallback, useMemo, useState} from "react";
import {ConVars} from "@/types/kv.ts";
import {formatKVValueToString} from "@/lib/utils.ts";
import {toast} from "sonner";


export interface CategoryKV {
    name: string;
    items: Map<string, string>;
}

export function useKVManager(initCV: KVObject) {
    const [cv, setCV] = useState<KVObject>(initCV);
    const categories = useMemo<CategoryKV[]>(() => {
        if (typeof cv !== "object" || Object.keys(cv).length === 0) {
            toast.error("Parsing error: Invalid or empty ConVars value. ConVars will be empty.");
            return [];
        }

        const cats: Map<string, Map<string, string>> = new Map();
        // cats.set("uncategorized", new Map());

        Object.entries(cv).forEach(([k, v]) => {
            const conVar = ConVars.find(c => c.name === k);
            const categoryName = conVar?.category ?? "uncategorized";

            if (!cats.has(categoryName)) {
                cats.set(categoryName, new Map());
            }

            cats.get(categoryName)!.set(k, formatKVValueToString(v));
        })

        return Array.from(cats.entries()).map(([name, items]) => ({
            name,
            items
        }));
    }, [cv])

    const addKV = useCallback((name: string, value?: string) => {
        setCV(prev => ({...prev, [name]: value ?? ""}))
    }, [])

    const removeKV = useCallback((name: string) => {
        setCV(prev => {
            const next = {...prev}
            delete next[name]
            return next
        })
    }, [])

    // Not yet implemented
    const moveKV = useCallback((name: string, category: string) => {
        (() => name)();
        (() => category)();
    }, [])

    const updateKV = useCallback((name: string, newValue: KVValue, newName?: string) => {
        setCV(prev => {
            if (newName && newName !== name) {
                const next = {...prev}
                delete next[name]
                next[newName] = newValue
                return next
            }

            return {...prev, [name]: newValue}
        })
    }, [])

    // Not yet implemented
    const serializeGI = () => {
    }

    return {
        cv,
        categories,

        addKV,
        removeKV,
        moveKV,
        updateKV,
        serializeGI,
    }
}