import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {IconCodePlus, IconFolderPlus} from "@tabler/icons-react";
import {ButtonGroup} from "@/components/ui/button-group.tsx";
import {useConfig} from "@/hooks/useConfig.ts";

export default function ButtonAddCV() {
    const {cfg, dispatch} = useConfig();

    return (
        <ButtonGroup>
            <TooltipProvider>
                <Popover>
                    <Tooltip>
                        <PopoverTrigger asChild>
                            <TooltipTrigger asChild className="cursor-pointer">
                                <Button variant="outline" className="cursor-pointer">
                                    <IconFolderPlus/>
                                </Button>
                            </TooltipTrigger>
                        </PopoverTrigger>

                        <TooltipContent>
                            <div className="flex items-center gap-2">
                                Add new Category
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <PopoverContent>
                        <p className="text-popover-foreground text-sm">
                            ConVars config options section
                        </p>
                    </PopoverContent>
                </Popover>
            </TooltipProvider>

            <TooltipProvider>
                <Popover>
                    <Tooltip>
                        <PopoverTrigger asChild>
                            <TooltipTrigger asChild className="cursor-pointer">
                                <Button variant="outline" className="cursor-pointer">
                                    <IconCodePlus/>
                                </Button>
                            </TooltipTrigger>
                        </PopoverTrigger>

                        <TooltipContent>
                            <div className="flex items-center gap-2">
                                Add new ConVar
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <PopoverContent>
                        <p className="text-popover-foreground text-sm">
                            ConVars config options section
                        </p>

                        <Button onClick={() => {
                            if (cfg.gi === null) return
                            if (cfg.gi["ConVars"] === null) return

                            dispatch({
                                type: "add.gi.convar",
                                payload: {key: "TESTING", val: "220"}
                            })
                        }}>
                            Add
                        </Button>
                    </PopoverContent>
                </Popover>
            </TooltipProvider>
        </ButtonGroup>
    )
}