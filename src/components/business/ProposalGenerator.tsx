import React from "react";
import { signIn } from "next-auth/react";

interface FormState {
    projectName: string;
    projectType: string;
    description: string;
    budget: string;
    timeline: string;
    partners: string[];
}

interface ProposalGeneratorProps {
    formData: FormState;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    isGenerating: boolean;
    llmResponse: string;
    error: string;
    onGenerate: () => void;
    onDownloadCDF: () => void;
    session: any; // Using any for session type to avoid deep next-auth dependency issues in simple component
    status: "loading" | "authenticated" | "unauthenticated";
}

export default function ProposalGenerator({
    formData,
    handleChange,
    isGenerating,
    llmResponse,
    error,
    onGenerate,
    onDownloadCDF,
    session,
    status,
}: ProposalGeneratorProps) {
    const projectTypes = [
        "Communication Constellation",
        "Earth Observation",
        "Navigation / PNT",
        "Space Manufacturing",
        "Orbital Debris Removal",
        "In-Orbit Servicing",
        "Space Tourism & Hospitality",
        "R&D Missions",
        "Technology Demonstration",
        "Other",
    ];

    const formDisabled = !session;

    return (
        <div className="mt-10 mx-auto max-w-6xl px-4">
            <div className="rounded-lg border border-space-border bg-space-section p-8">
                <h2 className="text-2xl font-semibold text-space-text-heading">
                    AI-Powered LEO Project Proposal Generator
                </h2>
                <p className="text-sm text-space-text-muted mt-1">
                    Generate a detailed commercial mission blueprint using our AI engine
                    (OpenAI GPT-4o).
                </p>

                {/* Authentication Check */}
                {!session && status !== "loading" && (
                    <div className="mt-6 p-6 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400">
                                    Authentication Required
                                </h3>
                                <p className="text-yellow-200 mt-1">
                                    Please sign in to use the AI-powered business proposal
                                    generator. This feature requires authentication to ensure secure
                                    access and prevent abuse.
                                </p>
                                <button
                                    onClick={() => signIn("github")}
                                    className="mt-4 px-6 py-2.5 bg-white text-black font-medium rounded hover:bg-gray-200 transition"
                                >
                                    Sign In with GitHub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div
                    className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 ${formDisabled ? "opacity-50 pointer-events-none" : ""
                        }`}
                >
                    {/* Project Name */}
                    <div>
                        <label className="text-sm text-space-text-muted mb-2 block">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleChange}
                            placeholder="e.g., IndiaComm Constellation"
                            disabled={formDisabled}
                            className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white 
              focus:border-space-border-hover outline-none disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Project Type */}
                    <div>
                        <label className="text-sm text-space-text-muted mb-2 block">
                            Project Type *
                        </label>
                        <select
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleChange}
                            disabled={formDisabled}
                            className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white 
              focus:border-space-border-hover outline-none disabled:cursor-not-allowed"
                        >
                            <option value="">Select project type…</option>
                            {projectTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="text-sm text-space-text-muted mb-2 block">
                            Budget (USD)
                        </label>
                        <input
                            type="text"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="$50M – $100M"
                            disabled={formDisabled}
                            className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white 
              focus:border-space-border-hover outline-none disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Timeline */}
                    <div>
                        <label className="text-sm text-space-text-muted mb-2 block">
                            Timeline
                        </label>
                        <input
                            type="text"
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleChange}
                            placeholder="24–36 months"
                            disabled={formDisabled}
                            className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white 
              focus:border-space-border-hover outline-none disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-space-text-muted mb-2 block">
                            Mission Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Describe mission objectives, target market, constellation design, operational goals..."
                            disabled={formDisabled}
                            className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white 
              focus:border-space-border-hover outline-none resize-none disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Generate + PDF Buttons */}
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={onGenerate}
                        disabled={
                            formDisabled ||
                            isGenerating ||
                            !formData.projectName ||
                            !formData.projectType ||
                            !formData.description
                        }
                        className="px-6 py-2.5 bg-white text-black font-medium rounded hover:bg-gray-200 transition 
            disabled:bg-space-border disabled:text-space-text-muted disabled:cursor-not-allowed"
                    >
                        {isGenerating ? "Generating Proposal…" : "Generate Proposal with AI"}
                    </button>

                    {llmResponse && (
                        <button
                            onClick={onDownloadCDF}
                            disabled={formDisabled}
                            className="px-6 py-2.5 bg-space-card border border-space-border text-white font-medium rounded 
              hover:border-space-border-hover transition disabled:bg-space-border disabled:text-space-text-muted disabled:cursor-not-allowed"
                        >
                            Download PDF
                        </button>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded text-red-200">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* LLM Response Display */}
                {llmResponse && (
                    <div className="mt-6 p-6 bg-space-card border border-space-border rounded">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-space-section border border-space-border flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-space-text-main"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Generated Business Proposal
                                </h3>
                            </div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-space-text-main leading-relaxed">
                                {llmResponse}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
