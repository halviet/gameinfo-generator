import {composeGI, parseGI, type GICommentLine, type GIDocument, type GIEntry} from "s2-gameinfo";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validComments(value: unknown, allowBlankLines = false): value is GICommentLine[] | undefined {
    return value === undefined || (Array.isArray(value) && value.every(comment =>
        typeof comment === "string" || (allowBlankLines && comment === null)
        || (isRecord(comment) && comment.style === "block" && typeof comment.text === "string")));
}

function validEntry(entry: unknown, depth = 0): entry is GIEntry {
    if (depth > 512 || !isRecord(entry) || typeof entry.key !== "string"
        || !validComments(entry.leadingComments, true) || !validComments(entry.inlineComments)
        || (entry.condition !== undefined && typeof entry.condition !== "string")) return false;

    if (entry.kind === "flag") return entry.condition === undefined;
    if (entry.kind === "block") {
        return validComments(entry.beforeCloseComments, true) && Array.isArray(entry.entries)
            && entry.entries.every(child => validEntry(child, depth + 1));
    }
    return entry.kind === "value" && ["string", "number", "boolean"].includes(typeof entry.value)
        && (entry.numberSource === undefined || (typeof entry.numberSource === "string" && entry.numberSource === entry.value));
}

export function parseConfigJSON(text: string): GIDocument {
    const data: unknown = JSON.parse(text);
    if (!isRecord(data) || !validEntry(data.root) || data.root.kind !== "block"
        || !validComments(data.trailingComments, true)) {
        throw new Error("Expected a GIDocument with a root block and an entries array.");
    }
    const document: GIDocument = {root: data.root, trailingComments: data.trailingComments};
    parseGI(composeGI(document));
    return document;
}
