import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useState} from "react";
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field.tsx";

interface Props {
    selectTemplate: (template: string) => void
}

export default function SelectTemplate({selectTemplate}: Props) {
    const [tmpl, setTmpl] = useState<string>("piggy")
    const [open, setOpen] = useState<boolean>(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button>Select template</Button>
            </DialogTrigger>

            <DialogContent>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        selectTemplate(tmpl);
                        setOpen(false);
                    }}
                >

                    <DialogHeader>
                        <DialogTitle>Choose a Template</DialogTitle>
                        <DialogDescription>
                            Templates provide a clean starting point with common optimizations and settings. You can
                            still
                            customize everything after selecting.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4">
                        <Field>
                            <FieldLabel>Template</FieldLabel>
                            <Select defaultValue="piggy" onValueChange={(e) => setTmpl(e)}>
                                <SelectTrigger className="min-w-60">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="piggy">Piggy</SelectItem>
                                        <SelectItem value="piggypidjan">Piggy's & pidjan</SelectItem>
                                        <SelectItem value="maihdenless">Maihdenless</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FieldDescription>Template description</FieldDescription>
                        </Field>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Select template</Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}