import { RefreshCw } from "lucide-react";

export default function LoadingState() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-cyan-400" />
            <p className="text-lg">Loading Space Weather Data...</p>
        </div>
    );
}
