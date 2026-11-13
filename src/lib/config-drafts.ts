import type {GIDocument} from "s2-gameinfo";

export type ConfigDraft = {
    id: string;
    name: string;
    source: "preset" | "file";
    updatedAt: number;
    revision: number;
    document: GIDocument;
};

async function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("gameinfo-generator", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("drafts", {keyPath: "id"});
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
            reject(new Error("Draft storage is blocked by another tab."));
            request.onsuccess = () => request.result.close();
        };
    });
}

export async function listDrafts(): Promise<ConfigDraft[]> {
    const db = await openDatabase();
    try {
        return await new Promise((resolve, reject) => {
            const request = db.transaction("drafts").objectStore("drafts").getAll();
            request.onsuccess = () => resolve((request.result as ConfigDraft[]).sort((a, b) => b.updatedAt - a.updatedAt));
            request.onerror = () => reject(request.error);
        });
    } finally {
        db.close();
    }
}

export async function saveDraft(draft: ConfigDraft, previousRevision: number): Promise<void> {
    const db = await openDatabase();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction("drafts", "readwrite");
            const store = transaction.objectStore("drafts");
            const request = store.get(draft.id);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => reject(transaction.error ?? new Error("Could not save draft."));
            request.onsuccess = () => {
                const existing = request.result as ConfigDraft | undefined;
                if ((existing?.revision ?? 0) !== previousRevision) {
                    reject(new Error("This draft changed in another tab. Download this copy to keep your edits."));
                    transaction.abort();
                    return;
                }
                store.put(draft);
            };
        });
    } finally {
        db.close();
    }
}

export async function deleteDraft(id: string, revision: number): Promise<void> {
    const db = await openDatabase();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction("drafts", "readwrite");
            const store = transaction.objectStore("drafts");
            const request = store.get(id);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => reject(transaction.error ?? new Error("Could not delete draft."));
            request.onsuccess = () => {
                const draft = request.result as ConfigDraft | undefined;
                if (!draft) return;
                if (draft.revision !== revision) {
                    reject(new Error("This draft changed in another tab. Reopen it before deleting."));
                    transaction.abort();
                    return;
                }
                store.delete(id);
            };
        });
    } finally {
        db.close();
    }
}
