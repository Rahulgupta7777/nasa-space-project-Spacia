import { Metadata } from "../types";

interface FooterProps {
    dataSources: string[];
    metadata: Metadata;
}

export default function Footer({ dataSources, metadata }: FooterProps) {
    return (
        <div className="text-center text-gray-500 text-xs mt-8 py-4 border-t border-gray-800">
            <p>
                Data Sources: {dataSources.join(", ")} • Next update at{" "}
                {new Date(metadata.nextUpdate).toLocaleTimeString()}
            </p>
            <p className="mt-2">
                Data Quality: {metadata.dataQuality.status} (Score: {metadata.dataQuality.score}%)
                {metadata.dataQuality.missing.length > 0 &&
                    ` • Missing: ${metadata.dataQuality.missing.join(", ")}`}
            </p>
        </div>
    );
}
