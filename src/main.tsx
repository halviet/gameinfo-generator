import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import { ConfigProvider } from './context/context.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TooltipProvider>
            <ConfigProvider>
                <App/>
            </ConfigProvider>
        </TooltipProvider>
    </StrictMode>,
)
