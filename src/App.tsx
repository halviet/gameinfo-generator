import EmptyConfig from "@/components/empty-config.tsx";
import Header from "@/components/header.tsx";
import Dropzone from "@/components/ui/dropzone.tsx";
import Disclaimer from "@/components/disclaimer.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {useState} from "react";
import {type KVObject} from "s2-gameinfo";
import Editor from "@/components/editor.tsx";
import SelectTemplate from "@/components/blocks/select-template.tsx";
import {toast} from "sonner";

function App() {
    const [gi, setGI] = useState<KVObject | null>(null)
    const [template, setTemplate] = useState<string>("")

    const selectTemplate = (tmpl: string) => {
        if (tmpl === "") {
            toast.error("No template was selected!");
            return;
        }

        setTemplate(tmpl);
        setGI({});
    }

    return (
        <div className="px-2 md:px-4 lg:px-0">
            <Header/>
            <main className="max-w-5xl w-full mx-auto h-full flex flex-col gap-8 justify-center items-center">
                <Disclaimer/>

                {(gi === null || gi === undefined) ?
                    <EmptyConfig>
                        <SelectTemplate selectTemplate={selectTemplate}/>
                        or
                        <Dropzone setGI={setGI}/>
                    </EmptyConfig>
                    : <Editor gi={gi} selectTemplate={selectTemplate} template={template}/>
                }

                <Toaster/>
            </main>
        </div>
    )
}

export default App
