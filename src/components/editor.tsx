import type {KVObject} from "s2-gameinfo";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {IconInfoCircle} from "@tabler/icons-react";

interface Props {
    gi: KVObject;
    setGI: React.Dispatch<React.SetStateAction<KVObject | null>>;
}

export default function Editor({gi, setGI}: Props) {
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
            </section>

            <section>
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
            </section>
        </div>
    )
}