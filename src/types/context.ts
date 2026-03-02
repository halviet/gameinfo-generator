import type {KVObject} from "s2-gameinfo";
import type {Template} from "@/types/template.ts";

export interface Config {
    gi: KVObject;
    giLoaded: boolean;
    template: Template;
    useTemplate: boolean;
    mods: boolean;
    modifyWholeGI: boolean;
    output: string;
}