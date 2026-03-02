import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle} from "../ui/popover";
import {PopoverTrigger} from "@/components/ui/popover.tsx";
import {
    IconDotsVertical,
    IconInfoCircle,
} from "@tabler/icons-react";
import {useMemo, useState} from "react";
import {cn, formatKVValueToString} from "@/lib/utils.ts";
import type {KVValue} from "s2-gameinfo";
import {CATEGORIES, ConVars} from "@/types/kv.ts";
import InlineCode from "@/components/typography/code.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "../ui/dropdown-menu";
import {DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useConfig} from "@/hooks/useConfig.ts";

interface Props {
    kvKey: string
    kvValue: KVValue
    valIndex?: number
    childOf?: string
    disabled?: boolean
}

export default function KeyValue({kvKey, kvValue, valIndex, childOf, disabled = false}: Props) {
    const {dispatch} = useConfig();

    const [intKey, setIntKey] = useState<string>(kvKey);
    const [intValue, setIntValue] = useState<string>(() => {
        // TODO: Formating KVValue
        return kvValue.toString();
    });

    const onKeyBlur = (newKey: string) => {
        if (newKey === kvKey) return;

        console.log(`onKeyBlur: ${newKey} ${intValue}, kvKey: ${kvKey}, valIndex: ${valIndex}, childOf: ${childOf}`);

        dispatch({
            type: "set.gi.convar",
            payload: {
                key: newKey,
                val: intValue,
                index: valIndex,
                childOf: childOf,
            }
        })

        dispatch({
            type: "remove.gi.convar",
            payload: {
                key: kvKey,
                index: valIndex,
                childOf: childOf,
            }
        })
    }

    const onValueBlur = (newValue: string) => {
        if (newValue === kvValue) return;

        dispatch({
            type: "set.gi.convar",
            payload: {
                key: intKey,
                val: intValue,
                index: valIndex,
                childOf: childOf,
            }
        })
    }

    const onRemoveKV = () => {
        dispatch({
            type: "remove.gi.convar",
            payload: {
                key: intKey,
                childOf: childOf,
            }
        })
    }

    const [kvDescription, kvDefault] = useMemo(() => {
        const desc = ConVars.find((v) => v.name === intKey)?.description
        const def = ConVars.find((v) => v.name === intKey)?.defaultVal

        return [desc, def]
    }, [intKey])

    return (
        <InputGroup className="w-fit min-w-0">
            {
                (typeof kvDescription != "undefined" || typeof kvDefault != "undefined") && (
                    <InputGroupAddon className="pl-0">
                        <Popover>
                            <PopoverTrigger asChild>
                                <InputGroupAddon>
                                    <InputGroupButton variant="secondary" size="icon-xs">
                                        <IconInfoCircle/>
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                className="flex flex-col gap-1 rounded-xl text-sm"
                            >
                                <PopoverHeader>
                                    <PopoverTitle>{intKey}</PopoverTitle>
                                    {typeof kvDescription != "undefined" && (
                                        <PopoverDescription>
                                            {kvDescription}
                                        </PopoverDescription>
                                    )}
                                </PopoverHeader>
                                {typeof kvDefault != "undefined" && (
                                    <p className="font-medium mt-2">Default: <InlineCode>{formatKVValueToString(kvDefault)}</InlineCode></p>
                                )}
                            </PopoverContent>
                        </Popover>
                    </InputGroupAddon>
                )
            }
            <InputGroupInput
                value={intKey}
                style={{width: `calc(${intKey.length}ch + 1.5rem)`}}
                className={cn(
                    "font-mono",
                )}
                onChange={e => setIntKey(e.target.value)}
                onBlur={e => onKeyBlur(e.target.value)}
                disabled={disabled}
            />
            <Separator orientation="vertical"/>
            <InputGroupInput
                value={intValue}
                style={{width: `calc(${intValue.length}ch + 1.5rem)`}}
                className={cn(
                    "font-mono text-center pr-3!",
                )}
                onChange={e => setIntValue(e.target.value)}
                onBlur={e => onValueBlur(e.target.value)}
                disabled={disabled}
            />

            <Separator orientation="vertical"/>

            <InputGroupAddon className="pl-0 pr-2" align="inline-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={disabled}>
                        <Button variant="ghost" className="rounded-tl-none rounded-bl-none">
                            <IconDotsVertical/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger disabled className="opacity-50">Move to</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {CATEGORIES.map((v) => (
                                        <DropdownMenuItem
                                            // onClick={() => onMoveKV(v)}
                                        >{v}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuItem
                            variant="destructive"
                            onClick={onRemoveKV}
                        >Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </InputGroupAddon>
        </InputGroup>
    )
}