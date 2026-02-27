import {type ReactNode} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {IconChevronDown} from "@tabler/icons-react";
import {Button} from "@/components/ui/button.tsx";

export default function KVCategory({name, children}: { name: string, children: ReactNode }) {
    return (
        <div className="w-full rounded-lg border-border border">
            <Collapsible>
                <CollapsibleTrigger className="w-full p-4 cursor-pointer" asChild>
                    <Button variant="ghost" className="group w-full justify-between p-4! h-auto rounded-b-none">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            {name}
                        </h3>
                        <IconChevronDown className="group-data-[state=open]:rotate-180"/>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-4 flex flex-wrap gap-4">
                    {children}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}