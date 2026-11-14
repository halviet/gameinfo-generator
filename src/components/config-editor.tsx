import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ArrowLeft, Hash, Info, Pencil, Plus, Search, ToggleLeft, Trash2, TriangleAlert, Type} from "lucide-react";
import {Tooltip} from "radix-ui";
import {findConVar, findGIEntries, type GICommentLine, type GIDocument, type GIValueEntry} from "s2-gameinfo";
import conVarCatalog from "@/lib/convars.json";
import {getModSupport, setModSupport} from "@/lib/mod-support";
import ConfigExport from "@/components/config-export";
import DeleteDraftDialog from "@/components/delete-draft-dialog";
import {deleteDraft, saveDraft, type ConfigDraft} from "@/lib/config-drafts";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";

const knownConVarNames = Object.keys(conVarCatalog).sort();

const valueTypes = ["string", "number", "boolean"] as const;
type ValueType = typeof valueTypes[number];
const valueTypeIcons = {string: Type, number: Hash, boolean: ToggleLeft};
type EntryDraft = {index: number; key: string; value: string; above: string; inline: string; type: ValueType | "auto"; active: boolean};

function inferValueType(value: string): ValueType {
    if (value === "true" || value === "false") return "boolean";
    const number = Number(value);
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value) && Number.isFinite(number)
        && (!Number.isInteger(number) || Number.isSafeInteger(number))) return "number";
    return "string";
}

function commentText(comment: GICommentLine): string {
    return typeof comment === "object" && comment ? `/* ${comment.text} */` : comment ?? "";
}

function findConVars(document: GIDocument) {
    return findGIEntries(document, "ConVars").find(entry => entry.kind === "block");
}

export default function ConfigEditor({config, onBack}: {config: ConfigDraft; onBack: () => void}) {
    const [currentConfig, setCurrentConfig] = useState(config);
    const {document, name} = currentConfig;
    const [saveStatus, setSaveStatus] = useState(config.revision ? "Saved on this device." : "");
    const [saveError, setSaveError] = useState("");
    const [hasSavedDraft, setHasSavedDraft] = useState(config.revision > 0);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const revision = useRef(config.revision);
    const saveQueue = useRef(Promise.resolve());
    const lastQueued = useRef(config);
    const [query, setQuery] = useState("");
    const [hideInactive, setHideInactive] = useState(false);
    const [draft, setDraft] = useState<EntryDraft>();
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
    const returnFocus = useRef<HTMLButtonElement>(null);
    const addButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (lastQueued.current === currentConfig) return;
        lastQueued.current = currentConfig;
        saveQueue.current = saveQueue.current.then(async () => {
            try {
                await saveDraft({...currentConfig, updatedAt: Date.now(), revision: revision.current + 1}, revision.current);
                revision.current++;
                setHasSavedDraft(true);
                if (lastQueued.current === currentConfig) {
                    setSaveError("");
                    setSaveStatus("Saved on this device.");
                }
            } catch (error) {
                if (lastQueued.current === currentConfig) {
                    setSaveStatus("");
                    setSaveError(error instanceof Error && error.message.startsWith("This draft changed")
                        ? error.message : "Could not save on this device. Download the config to keep your changes.");
                }
            }
        });
    }, [currentConfig]);

    async function removeDraft() {
        setDeleting(true);
        setDeleteError("");
        try {
            await saveQueue.current;
            await deleteDraft(config.id, revision.current);
            onBack();
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Could not delete draft.");
            setDeleting(false);
        }
    }

    const entries = useMemo(() => findConVars(document)?.entries ?? [], [document]);
    const term = query.trim().toLowerCase();
    const conVarRows = useMemo(() => entries.flatMap((entry, index) => entry.kind === "value" ? [{entry, index}] : []), [entries]);
    const rows = useMemo(() => conVarRows.flatMap(({entry, index}) => {
        if (hideInactive && entry.commentedOut) return [];
        const key = entry.key.toLowerCase();
        const rank = key === term ? 0 : key.startsWith(term) ? 1 : key.includes(term) ? 2 : 3;
        return rank < 3 ? [{entry, index, rank}] : [];
    }).sort((a, b) => a.rank - b.rank), [conVarRows, hideInactive, term]);
    const {enabled: modsEnabled, canEnable: canEnableMods} = getModSupport(document);
    const original = draft && entries[draft.index];
    const originalValue = original?.kind === "value" ? original : undefined;
    const nameTerm = draft?.key.trim().toLowerCase();
    const nameSuggestions = !originalValue && nameTerm
        ? knownConVarNames.filter(name => name.toLowerCase().startsWith(nameTerm)).slice(0, 30)
        : [];
    const showSuggestions = suggestionsOpen && nameSuggestions.length > 0;
    const originalType = originalValue ? typeof originalValue.value : undefined;
    const inferredType = inferValueType(draft?.value ?? "");
    const unchanged = !!originalValue && draft?.value === String(originalValue.value) && draft?.type === originalType;
    const typeMismatch = !unchanged && (draft?.type === "number" || draft?.type === "boolean") && draft.type !== inferredType;
    const valueType = draft?.type === "auto" || typeMismatch ? inferredType : draft?.type;
    const valueError = draft && !unchanged && /\p{Cc}/u.test(draft.value)
        ? "Remove control characters from the value." : "";

    function updateConfig(changes: Partial<Pick<ConfigDraft, "name" | "document">>) {
        setSaveStatus("Saving…");
        setSaveError("");
        setCurrentConfig(current => ({...current, ...changes}));
    }

    function updateDocument(update: (copy: typeof document) => void) {
        const copy = structuredClone(document);
        update(copy);
        updateConfig({document: copy});
    }

    const openEntry = useCallback((trigger: HTMLButtonElement, index: number, entry?: GIValueEntry) => {
        returnFocus.current = trigger;
        setSuggestionsOpen(false);
        setHighlightedSuggestion(-1);
        setDraft({
            index,
            key: entry?.key ?? "",
            value: entry ? String(entry.value) : "",
            active: !entry?.commentedOut,
            type: typeof entry?.value === "number" ? "number" : typeof entry?.value === "boolean" ? "boolean" : entry ? "string" : "auto",
            above: entry?.leadingComments?.map(commentText).join("\n") ?? "",
            inline: entry?.inlineComments?.map(commentText).join(" ") ?? "",
        });
    }, []);

    function selectConVarName(name: string) {
        const info = findConVar(name);
        setDraft(current => current && {
            ...current,
            key: name,
            value: info?.defaultValue ?? current.value,
            inline: info?.description ?? current.inline,
            type: info ? "auto" : current.type,
        });
        setSuggestionsOpen(false);
        setHighlightedSuggestion(-1);
    }

    function saveEntry() {
        if (!draft || !draft.key.trim() || valueError) return;
        const value = unchanged ? originalValue.value : valueType === "number" ? Number(draft.value)
            : valueType === "boolean" ? draft.value === "true" : draft.value;
        const entry: GIValueEntry = {
            kind: "value",
            key: draft.key.trim(),
            value,
            condition: originalValue?.condition,
            commentedOut: draft.active ? undefined : true,
            numberSource: unchanged ? originalValue.numberSource : undefined,
            leadingComments: draft.above === originalValue?.leadingComments?.map(commentText).join("\n")
                ? originalValue.leadingComments : draft.above ? draft.above.split("\n").map(line => line || null) : undefined,
            inlineComments: draft.inline === originalValue?.inlineComments?.map(commentText).join(" ")
                ? originalValue.inlineComments : draft.inline ? [draft.inline] : undefined,
        };
        if (originalValue && entry.key === originalValue.key && entry.value === originalValue.value
            && draft.active === !originalValue.commentedOut
            && entry.numberSource === originalValue.numberSource && entry.leadingComments === originalValue.leadingComments
            && entry.inlineComments === originalValue.inlineComments) {
            setDraft(undefined);
            return;
        }
        updateDocument(copy => {
            const block = findConVars(copy);
            if (block) block.entries.splice(draft.index, 1, entry);
            else if (copy.root.kind === "block") copy.root.entries.push({kind: "block", key: "ConVars", entries: [entry]});
        });
        if (!originalValue) setQuery("");
        setDraft(undefined);
    }

    function deleteEntry(index: number) {
        updateDocument(copy => {
            findConVars(copy)?.entries.splice(index, 1);
        });
        returnFocus.current = addButton.current;
        setDraft(undefined);
    }

    function toggleMods(enabled: boolean) {
        updateDocument(copy => setModSupport(copy, enabled));
    }

    const conVarList = useMemo(() => rows.length ? (
        <Tooltip.Provider>
            <ul className="divide-y overflow-hidden rounded-lg border">
                {rows.map(({entry, index}) => {
                    const type = typeof entry.value as ValueType;
                    const ValueTypeIcon = valueTypeIcons[type];
                    const info = findConVar(entry.key);
                    const comments = [...(entry.leadingComments ?? []), ...(entry.inlineComments ?? [])]
                        .map(comment => typeof comment === "string" ? comment : comment?.text ?? "")
                        .filter(comment => comment.trim()).join("\n");
                    return (
                    <li key={index} className={`flex items-center pr-2 transition-colors hover:bg-accent focus-within:bg-accent dark:hover:bg-accent/50 dark:focus-within:bg-accent/50 ${entry.commentedOut ? "bg-muted/60 text-muted-foreground" : ""}`}>
                        <Button variant="ghost" className="h-auto min-h-14 min-w-0 flex-1 scroll-mt-48 justify-between gap-3 self-stretch rounded-none py-2 pr-1 pl-3 text-left hover:bg-transparent hover:text-current focus-visible:ring-inset dark:hover:bg-transparent"
                            aria-label={`Edit ${entry.key}${entry.condition ? ` [${entry.condition}]` : ""}, value ${entry.value}, type ${type}${entry.commentedOut ? ", inactive" : ""}`}
                            aria-describedby={comments ? `convar-comments-${index}` : undefined}
                            onClick={event => openEntry(event.currentTarget, index, entry)}>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-mono">
                                <span className="flex min-w-0 flex-wrap items-center gap-x-2">
                                    <span title={type} aria-hidden="true" className="text-muted-foreground"><ValueTypeIcon className="size-3.5"/></span>
                                    {entry.commentedOut && <span aria-hidden="true">//</span>}
                                    <span className="min-w-0 whitespace-normal wrap-break-word">{entry.key}</span>
                                    {entry.commentedOut && (
                                        <span className="rounded-full border border-muted-foreground/50 px-2 py-0.5 font-sans text-xs font-medium">Inactive</span>
                                    )}
                                </span>
                                {entry.condition && <span className="text-xs text-muted-foreground">[{entry.condition}]</span>}
                                {comments && (
                                    <span id={`convar-comments-${index}`} className="font-sans text-xs font-normal whitespace-pre-wrap wrap-anywhere text-muted-foreground">{comments}</span>
                                )}
                            </span>
                            <span className="flex min-w-0 max-w-[45%] items-center gap-3">
                                <span className="truncate font-mono text-muted-foreground">{String(entry.value)}</span>
                                <Pencil aria-hidden="true" className="text-muted-foreground"/>
                            </span>
                        </Button>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <Button type="button" variant="ghost" size="icon-sm"
                                    className={`scroll-mt-48 hover:bg-transparent hover:text-current dark:hover:bg-transparent ${info ? "text-muted-foreground" : "text-orange-700 dark:text-orange-400"}`}
                                    aria-label={info ? `About ${entry.key}` : `Warning about ${entry.key}`}>
                                    {info ? <Info aria-hidden="true"/> : <TriangleAlert aria-hidden="true"/>}
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content sideOffset={6} collisionPadding={12}
                                    className="z-50 max-w-[min(20rem,calc(100vw-1.5rem))] rounded-md bg-popover px-3 py-2 text-sm wrap-anywhere text-popover-foreground shadow-md ring-1 ring-border">
                                    {info ? (
                                        <>
                                            {info.description && <p>{info.description}</p>}
                                            <p className="text-muted-foreground">Default <code>{info.defaultValue || '""'}</code></p>
                                        </>
                                    ) : "Unknown ConVar. It may not work in the game."}
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </li>
                    );
                })}
            </ul>
        </Tooltip.Provider>
    ) : null, [rows, openEntry]);

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8 sm:py-12">
            <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" disabled={deleting || saveStatus === "Saving…"}
                        onClick={() => {
                            if (!saveError || window.confirm("Leave without saving this copy?")) onBack();
                        }}>
                        <ArrowLeft data-icon="inline-start" aria-hidden="true"/> Choose a config
                    </Button>
                    <ConfigExport document={document}/>
                </div>
                <h1 className="w-full min-w-0 text-3xl font-semibold tracking-tight">
                    <input aria-label="Config title" title="Click to rename" defaultValue={name} maxLength={256}
                        className="-mx-1 w-full rounded-md bg-transparent px-1 hover:bg-muted/40 focus:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring"
                        onBlur={event => {
                            const input = event.currentTarget;
                            const nextName = input.value.trim() || name;
                            input.value = nextName;
                            if (nextName !== name) updateConfig({name: nextName});
                        }}
                        onKeyDown={event => {
                            if (event.nativeEvent.isComposing) return;
                            if (event.key === "Escape") event.currentTarget.value = name;
                            if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
                        }}/>
                </h1>
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <p role="status" className="text-sm text-muted-foreground">{saveStatus}</p>
                    {hasSavedDraft && (
                        <DeleteDraftDialog name={name} onConfirm={() => void removeDraft()} trigger={
                            <Button variant="ghost" size="sm" className="text-muted-foreground" disabled={deleting || saveStatus === "Saving…"}>
                                <Trash2 aria-hidden="true"/> Delete draft
                            </Button>
                        }/>
                    )}
                </div>
                {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
                {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle><h2>Config options</h2></CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                    <div>
                        <label htmlFor="mods-support" className="text-sm font-medium">Enable mods support</label>
                        <p id="mods-description" className="text-sm text-muted-foreground">
                            {canEnableMods ? "Configure search paths for local and official add-ons." : "Requires both citadel and core game search paths."}
                        </p>
                    </div>
                    <Switch id="mods-support" aria-describedby="mods-description" disabled={!canEnableMods}
                        checked={modsEnabled} onCheckedChange={toggleMods}/>
                </CardContent>
            </Card>

            <Card className="gap-0 pt-0">
                <div className="sticky top-0 z-10 -mx-px -mt-3 bg-background pt-3">
                    <CardHeader className="rounded-t-xl border bg-card pt-6 pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle><h2>ConVars</h2></CardTitle>
                            <Button ref={addButton} size="sm" onClick={event => openEntry(event.currentTarget, entries.length)}>
                                <Plus data-icon="inline-start" aria-hidden="true"/> Add ConVar
                            </Button>
                        </div>
                        <div className="relative mt-1">
                            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                            <Input type="search" aria-label="Search ConVars" placeholder="Search ConVars…" className="pl-9" value={query} onChange={event => setQuery(event.target.value)}/>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="hide-inactive-convars" checked={hideInactive} onCheckedChange={setHideInactive}/>
                            <label htmlFor="hide-inactive-convars" className="text-sm font-medium">Hide inactive ConVars</label>
                        </div>
                        <CardDescription role="status">{rows.length} of {conVarRows.length} editable ConVars</CardDescription>
                    </CardHeader>
                </div>
                <CardContent className="pt-4">
                    {conVarList ?? <p className="py-5 text-center text-sm text-muted-foreground">{term || conVarRows.length ? "No matching ConVars." : "Add a ConVar to get started."}</p>}
                </CardContent>
            </Card>

            <Dialog open={!!draft} onOpenChange={open => {if (!open) setDraft(undefined);}}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto" onEscapeKeyDown={event => {
                    if (showSuggestions) {
                        event.preventDefault();
                        setSuggestionsOpen(false);
                        setHighlightedSuggestion(-1);
                    }
                }} onCloseAutoFocus={event => {
                    event.preventDefault();
                    (returnFocus.current?.isConnected ? returnFocus.current : addButton.current)?.focus();
                }}>
                    {draft && (
                        <form className="flex min-w-0 flex-col gap-5" onSubmit={event => {event.preventDefault(); saveEntry();}}>
                            <DialogHeader>
                                <DialogTitle>{originalValue ? "Edit ConVar" : "Add ConVar"}</DialogTitle>
                                <DialogDescription>
                                    {originalValue?.condition ? `Applies when [${originalValue.condition}].` : "Edit the value and its optional comments."}
                                </DialogDescription>
                            </DialogHeader>
                            {originalValue && (
                                <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/40 px-3 py-2">
                                    <div>
                                        <label htmlFor="convar-active" className="text-sm font-medium">Active</label>
                                        <p id="convar-active-description" className="text-sm text-muted-foreground">Inactive ConVars are saved as comments.</p>
                                    </div>
                                    <Switch id="convar-active" aria-describedby="convar-active-description"
                                        checked={draft.active} onCheckedChange={active => setDraft({...draft, active})}/>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex min-w-0 flex-col gap-2 text-sm">
                                    <label htmlFor="convar-name" className="flex h-7 items-center">Name</label>
                                    <div className="relative">
                                        <Input id="convar-name" required value={draft.key} autoComplete="off"
                                            role={originalValue ? undefined : "combobox"}
                                            aria-autocomplete={originalValue ? undefined : "list"}
                                            aria-expanded={originalValue ? undefined : showSuggestions}
                                            aria-controls={showSuggestions ? "known-convar-names" : undefined}
                                            aria-activedescendant={showSuggestions && highlightedSuggestion >= 0 ? `convar-suggestion-${highlightedSuggestion}` : undefined}
                                            onFocus={() => setSuggestionsOpen(!originalValue)}
                                            onBlur={() => {
                                                setSuggestionsOpen(false);
                                                setHighlightedSuggestion(-1);
                                            }}
                                            onChange={event => {
                                                setDraft({...draft, key: event.target.value});
                                                setSuggestionsOpen(!originalValue);
                                                setHighlightedSuggestion(-1);
                                            }}
                                            onKeyDown={event => {
                                                if (!nameSuggestions.length || event.nativeEvent.isComposing) return;
                                                if (event.key === "Enter" && showSuggestions && highlightedSuggestion >= 0) {
                                                    event.preventDefault();
                                                    selectConVarName(nameSuggestions[highlightedSuggestion]);
                                                }
                                                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                                                    event.preventDefault();
                                                    const last = nameSuggestions.length - 1;
                                                    const next = event.key === "ArrowDown" ? Math.min(highlightedSuggestion + 1, last)
                                                        : highlightedSuggestion < 0 ? last : Math.max(highlightedSuggestion - 1, 0);
                                                    setSuggestionsOpen(true);
                                                    setHighlightedSuggestion(next);
                                                }
                                            }}/>
                                        {showSuggestions && (
                                            <div id="known-convar-names" role="listbox" aria-label="Known ConVars"
                                                className="absolute inset-x-0 top-full z-10 mt-1 grid max-h-48 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                                                {nameSuggestions.map((name, index) => (
                                                    <Button key={name} id={`convar-suggestion-${index}`} type="button" role="option" tabIndex={-1}
                                                        aria-selected={index === highlightedSuggestion}
                                                        variant={index === highlightedSuggestion ? "secondary" : "ghost"} size="sm"
                                                        className="min-w-0 justify-start"
                                                        ref={element => {
                                                            if (index === highlightedSuggestion) element?.scrollIntoView({block: "nearest"});
                                                        }}
                                                        onMouseDown={event => event.preventDefault()} onClick={() => selectConVarName(name)}>
                                                        <span className="truncate">{name}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex min-w-0 flex-col gap-2 text-sm">
                                    <div className="flex h-7 items-center justify-between gap-1">
                                        <label htmlFor="convar-value">Value</label>
                                        <select aria-label="Value type" className="h-7 min-w-0 rounded-md border border-input bg-background pr-1 pl-2 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                                            value={draft.type} onChange={event => setDraft({...draft, type: event.target.value as EntryDraft["type"]})}>
                                            {!originalValue && <option value="auto">Auto ({inferredType})</option>}
                                            {valueTypes.map(type => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <Input id="convar-value" className="font-mono" value={draft.value} aria-invalid={!!valueError}
                                        aria-describedby={valueError ? "convar-value-error" : undefined}
                                        onChange={event => setDraft({...draft, value: event.target.value})}/>
                                </div>
                                {valueError && <p id="convar-value-error" className="col-span-2 text-xs text-destructive">{valueError}</p>}
                            </div>
                            <div role="status" className="empty:hidden">
                                {(typeMismatch || (originalType && valueType !== originalType)) && (
                                    <p className="rounded-md border bg-muted px-3 py-2 text-sm">
                                        {typeMismatch
                                            ? `This value doesn’t match the selected type (${draft.type}). It will be saved as ${valueType}.`
                                            : `Saving will change the value type from ${originalType} to ${valueType}.`}
                                    </p>
                                )}
                            </div>
                            <label className="grid gap-2 text-sm">Comment above
                                <Textarea placeholder="Shown on its own line above this ConVar" value={draft.above} onChange={event => setDraft({...draft, above: event.target.value})}/>
                            </label>
                            <label className="grid gap-2 text-sm">Inline comment
                                <Input placeholder="Shown after the value on the same line" value={draft.inline} onChange={event => setDraft({...draft, inline: event.target.value})}/>
                            </label>
                            <pre aria-label="ConVar preview" tabIndex={0} className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                                {draft.above.split("\n").filter(Boolean).map(line => `// ${line}\n`).join("")}
                                {!draft.active && "// "}
                                {draft.key || "convar_name"} {unchanged && originalValue.numberSource
                                    ? originalValue.numberSource : valueType === "string" ? JSON.stringify(draft.value) : draft.value}
                                {originalValue?.condition && ` [${originalValue.condition}]`}
                                {draft.inline && ` // ${draft.inline}`}
                            </pre>
                            <DialogFooter>
                                {originalValue && <Button type="button" variant="destructive" className="sm:mr-auto" onClick={() => deleteEntry(draft.index)}>Delete</Button>}
                                <Button type="button" variant="outline" onClick={() => setDraft(undefined)}>Cancel</Button>
                                <Button type="submit" disabled={!draft.key.trim() || !!valueError}>{originalValue ? "Save changes" : "Add ConVar"}</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
