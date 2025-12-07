import React from "react";

export default function BusinessCTA() {
    return (
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <div className="mt-16 p-8 rounded-lg border border-space-border bg-space-section text-center">
                <h2 className="text-xl font-semibold text-white">Work With Us</h2>
                <p className="text-space-text-main mt-2">
                    Ready to explore how Spacia can support your mission? Let’s connect.
                </p>

                <div className="mt-6 flex justify-center gap-4">
                    <a
                        href="/dashboard"
                        className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-gray-200 transition"
                    >
                        View Dashboard
                    </a>
                    <a
                        href="mailto:hello@example.com"
                        className="px-6 py-2.5 border border-space-border bg-space-card text-white rounded font-medium hover:border-space-border-hover transition"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
