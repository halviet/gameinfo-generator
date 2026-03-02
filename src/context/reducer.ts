import type {Config} from "@/types/context.ts";
import {produce} from "immer";
import {
    createWrappedDuplicate,
    isKVCond,
    isKVWrappedDuplicate,
    type KVObject,
    type KVValue, type KVWrappedDuplicate,
    parseGI
} from "s2-gameinfo";
import {type Template, TEMPLATE_DEFAULT} from "@/types/template.ts";

export const initialConfig: Config = {
    gi: {},
    giLoaded: false,
    template: TEMPLATE_DEFAULT,
    useTemplate: false,
    mods: true,
    modifyWholeGI: false,
    output: 'gameinfo'
}

export type ConfigAction =
    | { type: 'set.gi'; payload: KVObject }
    | { type: 'reset.gi' }
    | { type: 'set.gi.convars'; payload: KVObject }
    | { type: 'set.gi.convar'; payload: { key: string, val: KVValue, index?: number, childOf?: string } }
    | { type: 'add.gi.convar'; payload: { key: string, val: KVValue, childOf?: string } }
    | { type: 'remove.gi.convar'; payload: { key: string, index?: number, childOf?: string } }
    | { type: 'set.template'; payload: Template }
    | { type: 'set.useTemplate'; payload: boolean }
    | { type: 'set.mods'; payload: boolean }
    | { type: 'set.modifyWholeGI'; payload: boolean }
    | { type: 'set.output'; payload: string }
    | { type: 'reset' };

export function configReducer(s: Config, a: ConfigAction): Config {
    return produce(s, draft => {
        switch (a.type) {
            case "set.gi":
                draft.gi = a.payload;
                draft.giLoaded = true;
                break;
            case "reset.gi":
                draft.gi = {}
                draft.giLoaded = false;
                break;
            case "set.gi.convars":
                if (draft.gi === null) {
                    draft.gi = {"ConVars": a.payload} as KVObject
                    break;
                }
                draft.gi["ConVars"] = a.payload;
                break;
            case "set.gi.convar": {
                console.log("set.gi.convar call:", a.payload)
                if (draft.gi === null) {
                    console.warn("set.gi.convar: draft.gi is null")
                    draft.gi = {"ConVars": {[a.payload.key]: a.payload.val}} as KVObject
                    break;
                }

                // If there is no ConVars
                if (draft.gi["ConVars"] === undefined) {
                    console.warn("set.gi.convar: conVars is undefined")
                    draft.gi["ConVars"] = {[a.payload.key]: a.payload.val};
                }

                let convars = (draft.gi["ConVars"] as KVObject);
                if (a.payload.childOf && typeof convars[a.payload.childOf] === 'object') {
                    console.log(`set.gi.convar: detected that ${a.payload.key} is child of ${a.payload.childOf}`)
                    convars = convars[a.payload.childOf] as KVObject;
                }

                // If key already exists
                if (a.payload.key in convars) {
                    console.log(`set.gi.convar: key "${a.payload.key}" exists in ConVars`);
                    console.info((s.gi["ConVars"] as KVObject)[a.payload.key])
                    // If value is a duplicate
                    if (isKVWrappedDuplicate(convars[a.payload.key])) {
                        console.log(`set.gi.convar: value of key ${a.payload.key} is KVDuplicate`);
                        if (a.payload.index === undefined) {
                            console.error(`set.gi.convar: No index given for Duplicate value on changing: ${a.payload.key}`)
                            // throw new Error(`No index given for Duplicate value on changing: ${a.payload.key}`);
                            break;
                        }

                        console.info("set.gi.convar: writing data to index");
                        (convars[a.payload.key] as KVWrappedDuplicate).values[a.payload.index] = a.payload.val;

                        if (isKVWrappedDuplicate(convars[a.payload.key])) {
                            console.info("STILL A KVDuplicate")
                        } else {
                            console.info("NO LONGER A KVDuplicate")
                        }

                        break;
                    }

                    // If value is a condition
                    if (isKVCond(convars[a.payload.key])) {
                        console.log(`set.gi.convar: value of key ${a.payload.key} is KVCond`);
                        convars[a.payload.key] = parseGI(`k\n{\n\tv ${a.payload.val}\n}`).v;
                        break;
                    }

                    console.warn("set.gi.convar: value is primitive or object, creating KVWrappedDuplicate");
                    convars[a.payload.key] = createWrappedDuplicate([convars[a.payload.key], a.payload.val]);
                    break;
                }

                console.info("set.gi.convar: writing data to key");
                convars[a.payload.key] = a.payload.val;
                break;
            }
            case "add.gi.convar": {
                if (draft.gi === null) {
                    draft.gi = {"ConVars": {[a.payload.key]: a.payload.val}} as KVObject
                    break;
                }
                // If there is no ConVars
                if (draft.gi["ConVars"] === undefined) {
                    draft.gi["ConVars"] = {[a.payload.key]: a.payload.val};
                }

                let convars = (draft.gi["ConVars"] as KVObject)
                if (a.payload.childOf && typeof convars[a.payload.childOf] === 'object') convars = convars[a.payload.childOf] as KVObject;

                if (a.payload.key in convars) {
                    // If value is a duplicate
                    if (isKVWrappedDuplicate(convars[a.payload.key])) {
                        (convars[a.payload.key] as KVWrappedDuplicate).values.push(a.payload.val)
                        break;
                    }

                    createWrappedDuplicate([convars[a.payload.key], a.payload.val])
                    break;
                }

                convars[a.payload.key] = a.payload.val;
                break;
            }
            case "remove.gi.convar": {
                console.log("remove.gi.convar call:", a.payload)
                if (draft.gi === null || draft.gi["ConVars"] === undefined || !((a.payload.key in (draft.gi["ConVars"] as KVObject)) || (a.payload.childOf && a.payload.key in (((draft.gi["ConVars"] as KVObject)[a.payload.childOf]) as KVObject)))) {
                    console.error(`remove.gi.convar: convar ${a.payload.key} is not found, childOf: ${a.payload.childOf}`);
                    // throw new Error("No ConVar exists to remove")
                    break;
                }

                let convars = (draft.gi["ConVars"] as KVObject)
                if (a.payload.childOf && typeof convars[a.payload.childOf] === 'object') convars = convars[a.payload.childOf] as KVObject;

                // If value is a duplicate
                if (isKVWrappedDuplicate(convars[a.payload.key])) {
                    if (a.payload.index === undefined) {
                        // throw new Error(`No index given for Duplicate value on changing: ${a.payload.key}`);
                        console.error(`No index given for Duplicate value on changing: ${a.payload.key}`)
                        break;
                    }

                    console.log("GI before deleting shit", s.gi)

                    console.log(`REMOVING ${a.payload.key} with index ${a.payload.index}`);

                    (convars[a.payload.key] as KVWrappedDuplicate).values.splice(a.payload.index, 1)
                    console.log("GI after deleting shit", s.gi)
                    break;
                }

                console.log("remove.gi.convar: convar deleted")
                delete convars[a.payload.key];
                break;
            }
            case "set.template":
                draft.template = a.payload;
                break;
            case "set.useTemplate":
                draft.useTemplate = a.payload;
                break;
            case "set.mods":
                draft.mods = a.payload;
                break;
            case "set.modifyWholeGI":
                draft.modifyWholeGI = a.payload;
                break;
            case "set.output":
                draft.output = a.payload;
                break;
            case 'reset':
                draft = initialConfig
                break
        }
    })
}