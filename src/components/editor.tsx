'use client'

import type {KVObject} from "s2-gameinfo";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {IconChevronDown, IconInfoCircle} from "@tabler/icons-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldTitle
} from "@/components/ui/field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Switch} from "./ui/switch";
import KeyValue from "@/components/blocks/kv.tsx";
import KVCategory from "@/components/blocks/kv-category.tsx";
import {useKVManager} from "@/hooks/useKVManager.ts";
import {ButtonGroup} from "@/components/ui/button-group.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import SelectTemplate from "@/components/blocks/select-template.tsx";
import type {Template} from "@/types/template.ts";
import {useMemo} from "react";

import {useConfig} from "@/hooks/useConfig.ts";

interface Props {
    selectTemplate: (template: Template) => void;
}

export default function Editor({selectTemplate}: Props) {
    const {cfg, dispatch, exportGI, exportJSON} = useConfig();
    const conVars = useMemo(() => {
        if (cfg.gi === null) return {} as KVObject
        return cfg.gi["ConVars"] as KVObject
    }, [cfg.gi]);

    const {
        categories,
        // addKV,
        removeKV,
        updateKV,
    } = useKVManager(conVars)

    return (
        <div className="w-full flex flex-col gap-8">
            <section className="w-full flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Basic</h1>
                    <Popover>
                        <PopoverTrigger>
                            <IconInfoCircle/>
                        </PopoverTrigger>

                        <PopoverContent>
                            <p className="text-popover-foreground text-sm">
                                Basic config options section
                            </p>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col gap-8">
                    <FieldSet>
                        <FieldGroup>
                            <div className="grid grid-cols-2 gap-4">
                                {cfg.template != "" &&
                                    <Field>
                                        <FieldLabel>Template</FieldLabel>
                                        <Select defaultValue={cfg.template} onValueChange={(e) => selectTemplate(e as Template)}>
                                            <SelectTrigger>
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
                                }
                            </div>
                        </FieldGroup>
                    </FieldSet>

                    <FieldSet>
                        <FieldGroup>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldLabel htmlFor="mods">
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle>Enable mods support</FieldTitle>
                                            <FieldDescription>
                                                Adds path for mods in SearchPaths
                                            </FieldDescription>
                                        </FieldContent>
                                        <Switch id="mods" defaultChecked/>
                                    </Field>
                                </FieldLabel>

                                <FieldLabel htmlFor="fullgameinfo">
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle>Modify whole gameinfo.gi</FieldTitle>
                                            <FieldDescription>
                                                Allows to modify values outside of a ConVars scope.
                                            </FieldDescription>
                                        </FieldContent>
                                        <Switch id="fullgameinfo" disabled/>
                                    </Field>
                                </FieldLabel>
                            </div>
                        </FieldGroup>
                    </FieldSet>
                </div>
            </section>

            <section className="w-full flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Exporting</h1>
                </div>

                <FieldSet>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Output file</FieldLabel>
                            <Input id="output" type="text" defaultValue={cfg.output}
                                   placeholder={cfg.output}/>
                            <FieldDescription>Template description</FieldDescription>
                        </Field>
                    </FieldGroup>

                    <Field className="w-full flex items-end justify-end">
                        <ButtonGroup>
                            <ButtonGroup>
                                <Button variant="destructive" className="cursor-pointer" onClick={() => dispatch({type: 'set.gi', payload: null})}>Reset</Button>
                            </ButtonGroup>

                            {cfg.template ===  "" && (
                                <ButtonGroup>
                                    <SelectTemplate selectTemplate={selectTemplate} variant="outline"/>
                                </ButtonGroup>
                            )}

                            <ButtonGroup>
                                <Button onClick={exportGI}>Export</Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="!pl-2">
                                            <IconChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={exportJSON}>As JSON</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </ButtonGroup>
                        </ButtonGroup>
                    </Field>
                </FieldSet>
            </section>

            <section className="w-full flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">ConVars</h1>
                    <Popover>
                        <PopoverTrigger>
                            <IconInfoCircle/>
                        </PopoverTrigger>

                        <PopoverContent>
                            <p className="text-popover-foreground text-sm">
                                ConVars config options section
                            </p>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="w-full flex flex-col gap-4">
                    {categories.map(category => (
                        <KVCategory name={category.name} key={category.name}>
                            {Array.from(category.items.entries()).map(([k, v]) => (
                                <KeyValue key={k} kvKey={k} kvValue={v} updateKV={updateKV} removeKV={removeKV}/>
                            ))}
                        </KVCategory>
                    ))}
                </div>
            </section>
        </div>
    )
}