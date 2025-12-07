import { XCircle } from "lucide-react";

export default function ErrorState() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-red-400">
            <XCircle className="w-8 h-8 mb-4" />
            <p className="text-lg">Failed to load data.</p>
        </div>
    );
}
