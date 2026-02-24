import InlineCode from "@/components/typography/code.tsx";

export default function Disclaimer() {
    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-muted">
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    This tool parses your <InlineCode className="bg-background">gameinfo.gi</InlineCode> file — the core
                    configuration file for Deadlock (and Source 2 games) and gives you a visual interface to tweak
                    ConVars (console variables). Edit performance settings, key bindings, or hidden engine parameters
                    without manually digging through KeyValues syntax.
                </p>
            </div>
            <div className="p-4 rounded-xl bg-orange-700/10">
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    ⚠️ Heads up: While this tool has been tested against standard Deadlock configs, it's not officially
                    affiliated with Valve. Always back up your original <InlineCode>gameinfo.gi</InlineCode> before
                    replacing it. Bad values <b>can cause crashes</b> or unexpected behavior — tweak responsibly.
                </p>
            </div>
        </div>
    )
}