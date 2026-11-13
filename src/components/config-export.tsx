import {useState} from "react";
import {ChevronDown, Copy, Download} from "lucide-react";
import {DropdownMenu} from "radix-ui";
import {composeGI, type GIDocument} from "s2-gameinfo";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";

export default function ConfigExport({document}: {document: GIDocument}) {
    const [filename, setFilename] = useState("gameinfo.gi");
    const [preview, setPreview] = useState("");
    const [message, setMessage] = useState("");
    const [previewError, setPreviewError] = useState("");

    function prepare(open: boolean) {
        if (!open) return;
        setMessage("");
        setPreviewError("");
        try {
            setPreview(composeGI(document));
        } catch {
            setPreview("");
            setPreviewError("Could not generate a .gi file from this config.");
        }
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(preview);
            setMessage("Copied to clipboard.");
        } catch {
            setMessage("Could not copy. Select the preview text to copy it manually.");
        }
    }

    function download(format: "gi" | "json") {
        const stem = filename.trim().replace(/\.(gi|json)$/i, "").trim() || "gameinfo";
        const content = format === "gi" ? preview : JSON.stringify(document, null, 2);
        const type = format === "gi" ? "text/plain;charset=utf-8" : "application/json";
        const url = URL.createObjectURL(new Blob([content], {type}));
        const link = window.document.createElement("a");
        link.href = url;
        link.download = `${stem}.${format}`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return (
        <Dialog onOpenChange={prepare}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Download aria-hidden="true"/> Export gameinfo.gi</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Export gameinfo.gi</DialogTitle>
                    <DialogDescription>Preview, copy, or download the current config.</DialogDescription>
                </DialogHeader>
                <label className="grid min-w-0 gap-2 text-sm">Filename
                    <Input value={filename} placeholder="gameinfo.gi" onChange={event => setFilename(event.target.value)}/>
                </label>
                <div className="grid min-w-0 gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">Preview</h3>
                        <Button variant="outline" size="icon-sm" aria-label="Copy preview to clipboard" title="Copy to clipboard"
                            disabled={!preview} onClick={() => void copy()}><Copy aria-hidden="true"/></Button>
                    </div>
                    {previewError ? <p role="alert" className="text-sm text-destructive">{previewError}</p>
                        : <pre tabIndex={0} aria-label="gameinfo.gi preview" className="max-h-[42dvh] overflow-auto rounded-md border bg-muted p-3 text-xs">{preview}</pre>}
                    <p role="status" className="text-sm text-muted-foreground empty:hidden">{message}</p>
                </div>
                <DialogFooter>
                    <div className="inline-flex self-end">
                        <Button className="rounded-r-none" disabled={!preview} onClick={() => download("gi")}>Download .gi</Button>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <Button className="rounded-l-none border-l border-primary-foreground/20" size="icon" aria-label="More export formats">
                                    <ChevronDown aria-hidden="true"/>
                                </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content align="end" sideOffset={4} className="z-[60] min-w-36 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                                    <DropdownMenu.Item className="cursor-default rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                                        onSelect={() => download("json")}>Download JSON</DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
