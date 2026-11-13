import {useEffect, useRef, useState, type ChangeEvent} from "react";
import {ArrowRight, ClipboardPaste, FileCode, Upload} from "lucide-react";
import ConfigEditor from "@/components/config-editor";
import Header from "@/components/header.tsx";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {listPresets, presetRepository, readPreset, type RemotePreset} from "@/lib/remote-presets";
import {parseGI} from "s2-gameinfo";
import {listDrafts, type ConfigDraft} from "@/lib/config-drafts";
import {parseConfigJSON} from "@/lib/config-json";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";

export default function App() {
    const fileInput = useRef<HTMLInputElement>(null);
    const [choice, setChoice] = useState<ConfigDraft>();
    const [presets, setPresets] = useState<RemotePreset[]>();
    const [presetStatus, setPresetStatus] = useState<"loading" | "ready" | "stale" | "error">("loading");
    const [presetAttempt, setPresetAttempt] = useState(0);
    const [drafts, setDrafts] = useState<ConfigDraft[]>([]);
    const [storageError, setStorageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState("");
    const [pasteOpen, setPasteOpen] = useState(false);
    const [pastedJSON, setPastedJSON] = useState("");
    const [pasteError, setPasteError] = useState("");

    useEffect(() => {
        let current = true;
        listPresets().then(result => {
            if (!current) return;
            setPresets(result.presets);
            setPresetStatus(result.stale ? "stale" : "ready");
        }).catch(() => {
            if (current) setPresetStatus("error");
        });
        return () => {current = false;};
    }, [presetAttempt]);

    const folderCounts = new Map<string, number>();
    for (const preset of presets ?? []) {
        const parent = preset.path.slice(0, -preset.filename.length);
        folderCounts.set(parent, (folderCounts.get(parent) ?? 0) + 1);
    }

    useEffect(() => {
        if (choice) return;
        let current = true;
        listDrafts().then(drafts => {
            if (!current) return;
            setDrafts(drafts);
            setStorageError(false);
        }).catch(() => {
            if (current) setStorageError(true);
        });
        return () => {current = false;};
    }, [choice]);

    async function openConfig(name: string, source: ConfigDraft["source"], read: () => Promise<string>, format: "gi" | "json" = "gi", paste = false) {
        setLoading(true);
        setFileError("");
        setPasteError("");
        try {
            const text = await read();
            const document = format === "json" ? parseConfigJSON(text) : parseGI(text);
            if (document.root.kind !== "block" || document.root.key.toLowerCase() !== "gameinfo") {
                throw new Error("Expected a GameInfo block.");
            }
            setChoice({id: crypto.randomUUID(), name, source, document, updatedAt: 0, revision: 0});
            setPasteOpen(false);
            setPastedJSON("");
        } catch (error) {
            const message = `Could not open ${name}. ${error instanceof Error ? error.message : ""}`;
            if (paste) setPasteError(message);
            else setFileError(message);
        } finally {
            setLoading(false);
        }
    }

    function chooseFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;

        const filename = file.name.toLowerCase();
        if (!filename.endsWith(".gi") && !filename.endsWith(".json")) {
            setFileError("Choose a file ending in .gi or .json.");
            return;
        }
        void openConfig(file.name, "file", () => file.text(), filename.endsWith(".json") ? "json" : "gi");
    }

    return (
        <div className="min-h-dvh px-4 sm:px-6">
            <Header/>
            {choice ? <ConfigEditor key={choice.id} config={choice} onBack={() => setChoice(undefined)}/> : (
            <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-10 sm:py-20">
                <div className="flex flex-col gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Choose a config</h1>
                    <p className="text-muted-foreground">Choose a starting point for your Deadlock gameinfo.gi.</p>
                </div>

                <Card className="gap-4">
                    <CardHeader>
                        <CardTitle><h2>Available configs</h2></CardTitle>
                        <CardDescription>Presets from <a className="underline underline-offset-4" href={presetRepository}>Sqooky’s OptimizationLock</a>.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {presetStatus === "loading" && <p role="status" className="text-sm text-muted-foreground">Loading presets…</p>}
                        {presetStatus === "ready" && !presets?.length && <p className="text-sm text-muted-foreground">No gameinfo presets found.</p>}
                        {(presetStatus === "error" || presetStatus === "stale") && (
                            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <p role="status">{presetStatus === "stale" ? "Showing cached presets. GitHub is unavailable." : "Could not load presets from GitHub."}</p>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setPresetStatus("loading");
                                    setPresetAttempt(attempt => attempt + 1);
                                }}>Retry</Button>
                            </div>
                        )}
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {presets?.map(preset => {
                                const showFilename = (folderCounts.get(preset.path.slice(0, -preset.filename.length)) ?? 0) > 1;
                                return (
                                    <li key={preset.path} className="min-w-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-full min-h-14 w-full justify-start gap-3 border px-3 py-2 text-left focus-visible:ring-inset"
                                            disabled={loading}
                                            onClick={() => void openConfig(
                                                showFilename ? `${preset.folder} · ${preset.filename}` : preset.folder,
                                                "preset", () => readPreset(preset),
                                            )}
                                        >
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                                                <FileCode aria-hidden="true"/>
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block whitespace-normal wrap-anywhere">{preset.folder}</span>
                                                {showFilename && <span className="block truncate font-mono text-xs font-normal text-muted-foreground">{preset.filename}</span>}
                                            </span>
                                            <ArrowRight aria-hidden="true" className="text-muted-foreground"/>
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                </Card>

                {drafts.length > 0 && (
                    <Card className="gap-4">
                        <CardHeader><CardTitle><h2>Your drafts</h2></CardTitle></CardHeader>
                        <CardContent>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {drafts.map(draft => (
                                    <li key={draft.id} className="min-w-0">
                                        <Button variant="ghost" disabled={loading} className="h-full min-h-14 w-full justify-between border px-3 py-2 text-left focus-visible:ring-inset"
                                            onClick={() => {setFileError(""); setChoice(draft);}}>
                                            <span className="min-w-0">
                                                <span className="block truncate">{draft.name}</span>
                                                <span className="block text-xs text-muted-foreground">{new Date(draft.updatedAt).toLocaleString()}</span>
                                            </span>
                                            <ArrowRight aria-hidden="true"/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <section aria-labelledby="upload-title" className="flex flex-col items-start gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h2 id="upload-title" className="text-sm font-medium">Have your own config?</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Import a .gi file or a GIDocument in JSON format.</p>
                    </div>
                    <input ref={fileInput} type="file" accept=".gi,.json" hidden onChange={chooseFile}/>
                    <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" disabled={loading} onClick={() => fileInput.current?.click()}>
                        <Upload data-icon="inline-start" aria-hidden="true"/>
                        Choose file
                    </Button>
                    <Dialog open={pasteOpen} onOpenChange={open => {setPasteOpen(open); setPasteError("");}}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" disabled={loading}><ClipboardPaste aria-hidden="true"/> Paste JSON</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90dvh] overflow-y-auto">
                            <form className="grid min-w-0 gap-4" onSubmit={event => {
                                event.preventDefault();
                                void openConfig("Pasted config", "file", async () => pastedJSON, "json", true);
                            }}>
                                <DialogHeader>
                                    <DialogTitle>Paste JSON</DialogTitle>
                                    <DialogDescription>Paste the full GIDocument exported by s2-gameinfo.</DialogDescription>
                                </DialogHeader>
                                <Textarea aria-label="GIDocument JSON" aria-invalid={!!pasteError} aria-describedby={pasteError ? "paste-error" : undefined}
                                    className="min-h-40 font-mono text-xs" value={pastedJSON}
                                    onChange={event => {setPastedJSON(event.target.value); setPasteError("");}}/>
                                {pasteError && <p id="paste-error" role="alert" className="text-sm wrap-anywhere text-destructive">{pasteError}</p>}
                                <DialogFooter><Button type="submit" disabled={loading || !pastedJSON.trim()}>Import JSON</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    </div>
                </section>

                {loading && <p role="status" className="text-sm text-muted-foreground">Opening config…</p>}
                {fileError && <p role="alert" className="text-sm text-destructive">{fileError}</p>}
                {storageError && <p role="status" className="text-sm text-muted-foreground">Saved drafts are unavailable in this browser.</p>}
            </main>
            )}
        </div>
    );
}
