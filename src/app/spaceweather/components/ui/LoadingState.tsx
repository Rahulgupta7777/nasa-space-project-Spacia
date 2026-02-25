import { RefreshCw } from "lucide-react";

export default function LoadingState() {
    return (
        <div className="flex flex-col justify-center items-center py-32 text-space-text-muted">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-cyan-400" />
            <p className="text-lg">Loading Space Weather Data...</p>
        </div>
    );
}
