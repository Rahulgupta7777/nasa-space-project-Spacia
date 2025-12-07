import { Info } from "lucide-react";
import { ReactNode } from "react";

interface InfoTooltipProps {
    title: string;
    children: ReactNode;
    width?: string;
}

export default function InfoTooltip({
    title,
    children,
    width = "w-72"
}: InfoTooltipProps) {
    return (
        <div className="group relative">
            <Info className="w-4 h-4 text-gray-500 hover:text-cyan-400 cursor-help transition-colors" />
            <div className={`absolute right-0 top-6 ${width} p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300`}>
                <p className="font-semibold text-cyan-400 mb-2">{title}</p>
                {children}
            </div>
        </div>
    );
}
