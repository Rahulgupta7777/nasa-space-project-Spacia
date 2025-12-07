import { Activity } from "lucide-react";

interface HeaderProps {
    timestamp: string;
    dataSources: string[];
}

export default function Header({ timestamp, dataSources }: HeaderProps) {
    return (
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
                <h1 className="text-4xl font-bold text-white">Space Weather Dashboard</h1>
            </div>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Real-time data from {dataSources.join(", ")} — updated{" "}
                {new Date(timestamp).toLocaleString()}
            </p>
        </div>
    );
}
