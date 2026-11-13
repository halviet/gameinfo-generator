import {useRef, type ReactNode} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";

export default function DeleteDraftDialog({name, trigger, onConfirm}: {
    name: string;
    trigger: ReactNode;
    onConfirm: () => void;
}) {
    const cancel = useRef<HTMLButtonElement>(null);

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent role="alertdialog" showCloseButton={false} onOpenAutoFocus={event => {
                event.preventDefault();
                cancel.current?.focus();
            }}>
                <DialogHeader>
                    <DialogTitle>Delete draft?</DialogTitle>
                    <DialogDescription className="wrap-anywhere">“{name}” will be removed from this browser. This can’t be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button ref={cancel} variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button variant="destructive" onClick={onConfirm}>Delete draft</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
