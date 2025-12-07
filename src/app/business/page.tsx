"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import jsPDF from "jspdf";
import BusinessHero from "@/components/business/BusinessHero";
import BusinessOfferings from "@/components/business/BusinessOfferings";
import ReferenceMissions from "@/components/business/ReferenceMissions";
import PartnerEcosystem from "@/components/business/PartnerEcosystem";
import BusinessCTA from "@/components/business/BusinessCTA";
import ProposalGenerator from "@/components/business/ProposalGenerator";

interface FormState {
  projectName: string;
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
  partners: string[];
}

export default function BusinessPage(): React.ReactElement {
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<FormState>({
    projectName: "",
    projectType: "",
    description: "",
    budget: "",
    timeline: "",
    partners: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [error, setError] = useState<string>("");

  // -------------------------------------------
  // Handlers
  // -------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePartner = (partner: string) => {
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.includes(partner)
        ? prev.partners.filter((p) => p !== partner)
        : [...prev.partners, partner],
    }));
  };

  // -------------------------------------------
  // LLM Business Proposal Generator (OpenAI via /api/business)
  // -------------------------------------------

  const generateProposal = async () => {
    setIsGenerating(true);
    setError("");
    setLlmResponse("");

    try {
      const response = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: formData.projectName,
          projectType: formData.projectType,
          description: formData.description,
          budget: formData.budget,
          timeline: formData.timeline,
          partners: formData.partners,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate proposal");
      }

      const data = await response.json();
      setLlmResponse(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------
  // Client-side PDF Generator (jsPDF)
  // -------------------------------------------

  const generatePDF = () => {
    if (!llmResponse) {
      setError("Please generate a proposal first");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("LEO Commercialization Business Proposal", margin, yPosition);
      yPosition += 15;

      // Project Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Project Details", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project Name: ${formData.projectName || "N/A"}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Project Type: ${formData.projectType || "N/A"}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Budget: ${formData.budget || "N/A"}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Timeline: ${formData.timeline || "N/A"}`, margin, yPosition);
      yPosition += 6;

      if (formData.partners.length > 0) {
        doc.text(`Selected Partners: ${formData.partners.join(", ")}`, margin, yPosition);
        yPosition += 8;
      }

      yPosition += 5;

      // AI-Generated Proposal
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("AI-Generated Business Proposal", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(llmResponse, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(lines[i], margin, yPosition);
        yPosition += 5;
      }

      // Footer
      const timestamp = new Date().toISOString().split("T")[0];
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated by Spacia on ${timestamp}`, margin, pageHeight - 10);

      const safeName = formData.projectName.trim() || "Spacia_Proposal";
      doc.save(`${safeName.replace(/\s+/g, "_")}_Business_Proposal.pdf`);
    } catch (err) {
      setError(
        "Failed to generate PDF: " +
        (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------

  return (
    <div className="text-space-text-main pb-12">
      <BusinessHero />

      <ProposalGenerator
        formData={formData}
        handleChange={handleChange}
        isGenerating={isGenerating}
        llmResponse={llmResponse}
        error={error}
        onGenerate={generateProposal}
        onDownloadCDF={generatePDF}
        session={session}
        status={status}
      />

      <ReferenceMissions />

      <BusinessOfferings />

      <PartnerEcosystem
        selectedPartners={formData.partners}
        onToggle={togglePartner}
      />

      <BusinessCTA />
    </div>
  );
}
