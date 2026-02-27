'use client'

import type {KVObject} from "s2-gameinfo";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {IconInfoCircle} from "@tabler/icons-react";
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

interface Props {
    gi: KVObject;
    selectTemplate: (template: string) => void;
    template: string;
}

export default function Editor({gi, selectTemplate, template}: Props) {
    const {
        categories,
        // addKV,
        removeKV,
        updateKV,
    } = useKVManager(gi["ConVars"] as KVObject)

    console.log("Editor: gi:", gi["ConVars"])
    console.log("Editor: Categories from useKVManager:", categories)

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
                                {template != "" &&
                                    <Field>
                                        <FieldLabel>Template</FieldLabel>
                                        <Select defaultValue={template} onValueChange={(e) => selectTemplate(e)}>
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

                                <Field>
                                    <FieldLabel>Output file</FieldLabel>
                                    <Input id="output" type="text" defaultValue="gameinfo.gi"
                                           placeholder="gameinfo.gi"/>
                                    <FieldDescription>Template description</FieldDescription>
                                </Field>
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
                                                Focus is shared across devices, and turns off when you leave the
                                                app.
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
                                                Focus is shared across devices, and turns off when you leave the
                                                app.
                                            </FieldDescription>
                                        </FieldContent>
                                        <Switch id="fullgameinfo"/>
                                    </Field>
                                </FieldLabel>
                            </div>
                        </FieldGroup>
                    </FieldSet>
                </div>
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