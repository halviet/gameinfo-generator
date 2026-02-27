import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {IconFilesFilled} from "@tabler/icons-react";
import InlineCode from "@/components/typography/code.tsx";
import type {ReactNode} from "react";

export default function EmptyConfig({children}: {children: ReactNode}) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <IconFilesFilled/>
                </EmptyMedia>

                <EmptyTitle>No config loaded</EmptyTitle>

                <EmptyDescription className="flex flex-col gap-4">
                    <p>Choose a pre-made template to get started quickly, or upload your existing <InlineCode>gameinfo.gi</InlineCode> file.</p>
                </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="flex flex-col justify-center items-center">
                {children}
            </EmptyContent>
        </Empty>
    )
}