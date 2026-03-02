import EmptyConfig from "@/components/empty-config.tsx";
import Header from "@/components/header.tsx";
import Dropzone from "@/components/ui/dropzone.tsx";
import Disclaimer from "@/components/disclaimer.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {parseGI} from "s2-gameinfo";
import Editor from "@/components/editor.tsx";
import SelectTemplate from "@/components/blocks/select-template.tsx";
import {toast} from "sonner";
import {type Template, TEMPLATE_DEFAULT} from "./types/template";

import {useConfig} from "@/hooks/useConfig.ts";


function App() {
    const {cfg, dispatch} = useConfig();

    const fetchGiFile = async (filename: string): Promise<string> => {
        const response = await fetch(`template/gi/${filename}.gi`);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.text();
    };

    const selectTemplate = (tmpl: Template) => {
        dispatch({
            type: "set.template",
            payload: tmpl,
        })

        fetchGiFile(tmpl).then((r) => {
            dispatch({
                type: "set.gi",
                payload: parseGI(r, {wrapDuplicates: true}),
            })
            dispatch({
                type: "set.useTemplate",
                payload: true
            })
        }).catch((err) => {
            toast.error(err.message);
            dispatch({
                type: "set.template",
                payload: TEMPLATE_DEFAULT,
            })
            dispatch({
                type: "set.useTemplate",
                payload: false
            })
        })
    }

    return (
        <div className="px-2 md:px-4 lg:px-0">
            <Header/>
            <main className="max-w-5xl w-full mx-auto h-full flex flex-col gap-8 justify-center items-center">
                <Disclaimer/>

                {cfg.giLoaded ?
                    <Editor selectTemplate={selectTemplate}/>
                    : <EmptyConfig>
                        <SelectTemplate selectTemplate={selectTemplate}/>
                        or
                        <Dropzone/>
                    </EmptyConfig>
                }

                <Toaster/>
            </main>
        </div>
    )
}

export default App
