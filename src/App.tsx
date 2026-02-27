import EmptyConfig from "@/components/empty-config.tsx";
import Header from "@/components/header.tsx";
import Dropzone from "@/components/ui/dropzone.tsx";
import Disclaimer from "@/components/disclaimer.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {parseGI} from "s2-gameinfo";
import Editor from "@/components/editor.tsx";
import SelectTemplate from "@/components/blocks/select-template.tsx";
import {toast} from "sonner";
import type {Template} from "./types/template";
import {useConfig} from "@/context/context.tsx";


function App() {
    const {cfg, dispatch} = useConfig();

    const fetchGiFile = async (filename: string): Promise<string> => {
        const response = await fetch(`template/gi/${filename}.gi`);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.text(); // Get raw string content
    };

    const selectTemplate = (tmpl: Template) => {
        if (tmpl === "") {
            toast.error("No template was selected!");
            return;
        }
        dispatch({
            type: "set.template",
            payload: tmpl,
        })

        fetchGiFile(tmpl).then((r) => {
            dispatch({
                type: "set.gi",
                payload: parseGI(r)
            })
        }).catch((err) => {
            toast.error(err.message);
            dispatch({
                type: "set.template",
                payload: '',
            })
        })
    }

    return (
        <div className="px-2 md:px-4 lg:px-0">
            <Header/>
            <main className="max-w-5xl w-full mx-auto h-full flex flex-col gap-8 justify-center items-center">
                <Disclaimer/>

                {(cfg.gi === null || cfg.gi === undefined) ?
                    <EmptyConfig>
                        <SelectTemplate selectTemplate={selectTemplate}/>
                        or
                        <Dropzone/>
                    </EmptyConfig>
                    : <Editor selectTemplate={selectTemplate}/>
                }

                <Toaster/>
            </main>
        </div>
    )
}

export default App
