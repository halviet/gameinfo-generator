export const presetRepository = "https://github.com/Sqooky/OptimizationLock";
const api = "https://api.github.com/repos/Sqooky/OptimizationLock";
const cacheKey = "gameinfo-generator:optimizationlock:v1";
const cacheLifetime = 60 * 60 * 1000;

export type RemotePreset = {
    path: string;
    folder: string;
    filename: string;
    sha: string;
};

type PresetCache = {fetchedAt: number; presets: RemotePreset[]};
let pending: Promise<{presets: RemotePreset[]; stale: boolean}> | undefined;

async function fetchPresets() {
    let cached: PresetCache | undefined;
    try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) cached = JSON.parse(stored) as PresetCache;
    } catch {
        // The picker can still fetch when browser storage is unavailable.
    }
    if (cached && Date.now() - cached.fetchedAt < cacheLifetime) {
        return {presets: cached.presets, stale: false};
    }

    try {
        const response = await fetch(`${api}/git/trees/HEAD?recursive=1`, {signal: AbortSignal.timeout(10000)});
        if (!response.ok) throw new Error("Could not load GitHub presets.");
        const data: {tree: {path: string; type: string; mode: string; sha: string}[]; truncated: boolean} = await response.json();
        if (data.truncated) throw new Error("GitHub returned an incomplete preset list.");
        const presets = data.tree.flatMap(({path, type, mode, sha}) => {
            if (type !== "blob" || !mode.startsWith("100") || !/^[a-f0-9]{40}$/.test(sha)) return [];
            const parts = path.split("/");
            const filename = parts.pop()!;
            if (!/^gameinfo(?:[-_.].+)?\.gi$/i.test(filename)) return [];
            return [{path, folder: parts.at(-1) ?? "OptimizationLock", filename, sha}];
        });
        try {
            localStorage.setItem(cacheKey, JSON.stringify({fetchedAt: Date.now(), presets}));
        } catch {
            // The current catalog is usable without a persistent cache.
        }
        return {presets, stale: false};
    } catch (error) {
        if (cached) return {presets: cached.presets, stale: true};
        throw error;
    }
}

export function listPresets() {
    pending ??= fetchPresets().finally(() => {pending = undefined;});
    return pending;
}

export async function readPreset(preset: RemotePreset) {
    const response = await fetch(`${api}/git/blobs/${preset.sha}`, {
        headers: {Accept: "application/vnd.github.raw+json"},
        cache: "force-cache",
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Could not download the GitHub preset.");
    return response.text();
}
