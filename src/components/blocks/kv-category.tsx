import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {IconChevronDown} from "@tabler/icons-react";
import {Button} from "@/components/ui/button.tsx";
import {isKVWrappedDuplicate, type KVObject, type KVValue} from "s2-gameinfo";
import KeyValue from "@/components/blocks/kv.tsx";
import {nanoid} from "nanoid";
import type {CategoryKV} from "@/hooks/useKVManager.ts";
import {cn} from "@/lib/utils.ts";

interface Props {
    category: CategoryKV;
    childOf?: string;
    disabled?: boolean
}

export default function KVCategory({category, childOf, disabled = false}: Props) {
    return (
        <div className={cn(
            "w-full rounded-lg border-border border",
            disabled && "opacity-50",
        )}>
            <Collapsible>
                <CollapsibleTrigger className="w-full p-4 cursor-pointer" asChild>
                    <Button variant="ghost" className="group w-full justify-between p-4! h-auto rounded-b-none">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            {category.name}
                        </h3>
                        <IconChevronDown className="group-data-[state=open]:rotate-180"/>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-4 flex flex-wrap gap-4">
                    {Array.from(category.items.entries()).map(([k, v]) => {
                        if (isKVWrappedDuplicate(v)) {
                            return v.values.map((val, i) => {
                                if (typeof val === "object") {
                                    const items: Map<string, KVValue> = new Map();
                                    Object.entries(val as KVObject).forEach(([k, v]) => items.set(k, v))

                                    return <KVCategory category={{name: k, items: items}} childOf={k} disabled/>
                                }

                                return (
                                    <KeyValue key={nanoid(8)} kvKey={k} kvValue={val}
                                              valIndex={i} childOf={childOf}/>
                                )
                            })
                        }

                        if (typeof v === "object" && !Array.isArray(v)) {
                            const items: Map<string, KVValue> = new Map();
                            Object.entries(v as KVObject).forEach(([k, v]) => items.set(k, v))
                            return <KVCategory category={{name: k, items: items}} childOf={k} disabled/>
                        }

                        return <KeyValue key={nanoid(8)} kvKey={k} kvValue={v} childOf={childOf} disabled={disabled}/>
                    })}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}