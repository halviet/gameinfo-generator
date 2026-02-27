import type React from "react";
import {useRef} from "react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Upload} from "lucide-react";
import {parseGI} from "s2-gameinfo";
import { toast } from "sonner";

import {useConfig} from "@/hooks/useConfig.ts";

export default function Dropzone() {
    const {dispatch} = useConfig();
    const filePickerRef = useRef<HTMLInputElement>(null);

    const openFilePicker = () => {
        filePickerRef.current?.click();
    };

    const onFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null) {
            toast.error("No files selected");
            return;
        }
        const file = event.target.files[0];

        if (!isValidFile(file)) {
            toast.error('Not a valid file.');
            return;
        }

        await setFile(file);
    };

    const onDropFiles = async (event: React.DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer.files === null) {
            toast.error("No files selected");
            return;
        }
        const file = event.dataTransfer.files[0];

        if (!isValidFile(file)) {
            toast.error('Not a valid file.');
            return;
        }

        await setFile(file);
    };

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const isValidFile = (file: File): boolean => {
        if (!file) return false;
        return file.name.toLowerCase().endsWith('.gi') || file.name.toLowerCase().endsWith('.json');
    }

    const setFile = async (file: File) => {
        const text = await file.text();

        if (file.name.toLowerCase().endsWith('.gi')) {
            dispatch({
                type: "set.gi",
                payload: parseGI(text)
            })
        }
        if (file.name.toLowerCase().endsWith('.json')) {
            dispatch({
                type: "set.gi",
                payload: JSON.parse(text)
            })
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-y-6">
            <Card
                className="group flex max-h-[200px] w-full flex-col items-center justify-center gap-4 py-8 border-dashed text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                onDragOver={onDragOver}
                onDrop={onDropFiles}
                onClick={openFilePicker}
            >
                <div className="grid space-y-3">
                    <div className="flex items-center gap-x-2 text-muted-foreground">
                        <Upload className="size-5"/>
                        <div>
                            Drop files here or{" "}
                            <Button
                                variant="link"
                                className="text-primary p-0 h-auto font-normal"
                                onClick={openFilePicker}
                            >
                                browse files
                            </Button>{" "}
                            to add
                        </div>
                    </div>
                </div>
                <input
                    ref={filePickerRef}
                    type="file"
                    className="hidden"
                    accept="application/json, text/plain, .gi"
                    multiple
                    onChange={onFileInputChange}
                />
                <span className="text-base/6 text-muted-foreground group-disabled:opacity-50 mt-2 block sm:text-xs">
          Supported: .gi, .json
        </span>
            </Card>
        </div>
    );
}
