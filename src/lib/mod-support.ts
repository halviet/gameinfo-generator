import {findGIEntry, type GIDocument, type GIEntry} from "s2-gameinfo";

const addonPaths = [
    ["Game", "citadel/addons"],
    ["AddonRoot", "citadel_addons"],
    ["OfficialAddonRoot", "citadel_community_addons"],
] as const;
const basePaths = ["citadel", "core"] as const;
const baseKeys = ["Mod", "Write"] as const;
const officialKey = "UseOfficialAddons";

function findAddonConfig(document: GIDocument) {
    return document.root.kind === "block" ? document.root.entries.find(entry =>
        entry.kind === "block" && entry.key === "AddonConfig" && !entry.condition) : undefined;
}

function matches(entry: GIEntry, key: string, value?: string) {
    return entry.kind === "value" && !entry.commentedOut && !entry.condition && entry.key === key
        && (value === undefined || String(entry.value) === value);
}

export function getModSupport(document: GIDocument) {
    const paths = findGIEntry(document, "FileSystem", "SearchPaths");
    const config = findAddonConfig(document);
    const entries = paths?.kind === "block" ? paths.entries : [];
    const canEnable = basePaths.every(path => entries.some(entry => matches(entry, "Game", path)));
    const addonsIndex = entries.findIndex(entry => matches(entry, ...addonPaths[0]));
    const enabled = canEnable && addonsIndex >= 0
        && addonsIndex < entries.findIndex(entry => matches(entry, "Game", "citadel"))
        && addonPaths.every(([key, path]) => entries.some(entry => matches(entry, key, path)))
        && basePaths.every(path => baseKeys.every(key => entries.some(entry => matches(entry, key, path))))
        && config?.kind === "block" && config.entries.some(entry => matches(entry, officialKey, "1"))
        && config.entries.every(entry => !matches(entry, officialKey) || matches(entry, officialKey, "1"));
    return {enabled, canEnable};
}

export function setModSupport(document: GIDocument, enabled: boolean) {
    const paths = findGIEntry(document, "FileSystem", "SearchPaths");
    if (paths?.kind !== "block" || document.root.kind !== "block") return;
    let config = findAddonConfig(document);

    if (!enabled) {
        paths.entries = paths.entries.filter(entry => !addonPaths.some(([key, path]) => matches(entry, key, path)));
        if (config?.kind === "block") {
            config.entries = config.entries.filter(entry => !matches(entry, officialKey, "1"));
            if (!config.entries.length && !config.leadingComments?.length && !config.inlineComments?.length
                && !config.beforeCloseComments?.length && !config.condition) {
                document.root.entries.splice(document.root.entries.indexOf(config), 1);
            }
        }
        return;
    }

    if (!getModSupport(document).canEnable) return;
    for (const path of basePaths) {
        const missing = baseKeys.filter(key => !paths.entries.some(entry => matches(entry, key, path)));
        const base = paths.entries.findIndex(entry => matches(entry, "Game", path));
        paths.entries.splice(base, 0, ...missing.map(key => ({kind: "value" as const, key, value: path})));
    }
    const addonsIndex = paths.entries.findIndex(entry => matches(entry, ...addonPaths[0]));
    const base = paths.entries.findIndex(entry => matches(entry, "Game", "citadel"));
    if (addonsIndex < 0) paths.entries.splice(base, 0, {kind: "value", key: "Game", value: "citadel/addons"});
    else if (addonsIndex > base) paths.entries.splice(base, 0, ...paths.entries.splice(addonsIndex, 1));

    for (const [key, value] of addonPaths.slice(1)) {
        if (!paths.entries.some(entry => matches(entry, key, value))) paths.entries.push({kind: "value", key, value});
    }
    if (!config) {
        config = {kind: "block", key: "AddonConfig", entries: []};
        document.root.entries.push(config);
    }
    if (config.kind === "block") {
        if (config.entries.some(entry => matches(entry, officialKey))) {
            config.entries = config.entries.map(entry => entry.kind === "value" && matches(entry, officialKey)
                ? {...entry, value: "1", numberSource: undefined} : entry);
        } else {
            config.entries.push({kind: "value", key: officialKey, value: "1"});
        }
    }
}
