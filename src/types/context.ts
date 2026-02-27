import type {KVObject} from "s2-gameinfo";
import type {Template} from "@/types/template.ts";

export interface Config {
    gi: KVObject | null;
    template: Template;
    mods: boolean;
    modifyWholeGI: boolean;
    output: string;
}

export type ConfigAction =
    | { type: 'set.gi'; payload: KVObject | null }
    | { type: 'set.template'; payload: Template}
    | { type: 'set.mods'; payload: boolean}
    | { type: 'set.modifyWholeGI'; payload: boolean}
    | { type: 'set.output'; payload: string}
    | { type: 'reset' };