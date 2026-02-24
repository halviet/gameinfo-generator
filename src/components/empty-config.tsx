import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {IconFilesFilled} from "@tabler/icons-react";

export default function EmptyConfig({children}: {children: React.ReactNode}) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <IconFilesFilled/>
                </EmptyMedia>

                <EmptyTitle>No config yet</EmptyTitle>

                <EmptyDescription>
                    You haven&apos;t created any projects yet. Get started by creating
                    your first project.
                </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="flex flex-col justify-center items-center">
                {children}
            </EmptyContent>
        </Empty>
    )
}