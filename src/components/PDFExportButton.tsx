'use client';

import { jsPDF } from 'jspdf';
import { AnalysisResult } from '@/lib/types';
import { showToast } from './ToastProvider';

interface ReportData {
    result: AnalysisResult;
    imageUrl: string;
    imageName?: string;
}

function formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function generateReportId(): string {
    return `AFR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export async function generatePDFReport({ result, imageUrl, imageName }: ReportData): Promise<void> {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = margin;

        // Colors
        const primaryColor: [number, number, number] = [99, 102, 241];
        const textColor: [number, number, number] = [30, 41, 59];
        const mutedColor: [number, number, number] = [100, 116, 139];
        const successColor: [number, number, number] = [34, 197, 94];
        const dangerColor: [number, number, number] = [239, 68, 68];

        const reportId = generateReportId();
        const isAI = result.verdict === 'AI_GENERATED' || result.verdict === 'LIKELY_AI';
        const confidence = result.confidence;

        // Header Background
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 50, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Forensic Analyzer', margin, 25);

        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Analysis Report', margin, 35);

        // Report ID and Date
        doc.setFontSize(10);
        doc.text(`Report ID: ${reportId}`, pageWidth - margin - 60, 25);
        doc.text(formatDate(new Date()), pageWidth - margin - 60, 35);

        yPosition = 70;

        // Main Result Section
        doc.setFillColor(isAI ? 254 : 240, isAI ? 242 : 253, isAI ? 242 : 244);
        doc.roundedRect(margin, yPosition - 10, pageWidth - 2 * margin, 45, 5, 5, 'F');

        doc.setTextColor(...(isAI ? dangerColor : successColor));
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(isAI ? 'AI-GENERATED DETECTED' : 'LIKELY REAL IMAGE', margin + 10, yPosition + 8);

        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Confidence: ${(confidence * 100).toFixed(1)}%`, margin + 10, yPosition + 22);

        if (result.calibration) {
            doc.setTextColor(...mutedColor);
            doc.setFontSize(11);
            doc.text(`Calibrated Confidence (DACC): ${(result.calibration.calibratedScore * 100).toFixed(1)}%`, margin + 10, yPosition + 32);
        }

        yPosition += 55;

        // Detector Results Section
        doc.setTextColor(...textColor);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Detector Results', margin, yPosition);
        yPosition += 10;

        // Draw detector bars
        const detectors = [
            { name: 'HuggingFace AI Detector', score: result.detectors.huggingface?.score || 0, weight: `${(result.fusion.huggingfaceWeight * 100).toFixed(0)}%` },
            { name: 'Gemini Vision LLM', score: result.detectors.visionLLM?.score || 0, weight: `${(result.fusion.visionLLMWeight * 100).toFixed(0)}%` },
            { name: 'DCT Frequency Analysis', score: result.detectors.dctAnalysis?.score || 0, weight: `${(result.fusion.dctWeight * 100).toFixed(0)}%` },
        ];

        detectors.forEach((detector, index) => {
            const barY = yPosition + index * 25;

            // Label
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textColor);
            doc.text(`${detector.name} (${detector.weight})`, margin, barY);

            // Background bar
            doc.setFillColor(226, 232, 240);
            doc.roundedRect(margin, barY + 3, pageWidth - 2 * margin - 40, 8, 2, 2, 'F');

            // Score bar
            const barWidth = (pageWidth - 2 * margin - 40) * detector.score;
            const scoreColor = detector.score > 0.65 ? dangerColor : detector.score > 0.35 ? [245, 158, 11] as [number, number, number] : successColor;
            doc.setFillColor(...scoreColor);
            doc.roundedRect(margin, barY + 3, Math.max(barWidth, 2), 8, 2, 2, 'F');

            // Score text
            doc.setFontSize(10);
            doc.text(`${(detector.score * 100).toFixed(1)}%`, pageWidth - margin - 35, barY + 9);
        });

        yPosition += 85;

        // Novel Contributions Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textColor);
        doc.text('Novel Research Contributions', margin, yPosition);
        yPosition += 12;

        // DACC
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('DACC (Disagreement-Aware Confidence Calibration)', margin + 5, yPosition + 10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedColor);
        doc.setFontSize(9);
        doc.text(`Trust Score: ${((result.calibration?.trustScore || 0) * 100).toFixed(1)}% | Calibrated: ${((result.calibration?.calibratedScore || result.confidence) * 100).toFixed(1)}%`, margin + 5, yPosition + 19);
        yPosition += 30;

        // SAM
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('SAM (Spatial Artifact Mapping)', margin + 5, yPosition + 10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedColor);
        doc.setFontSize(9);
        const hotspotCount = result.spatialAnalysis?.hotspots?.length || 0;
        doc.text(`Hotspots Detected: ${hotspotCount} regions | Composite: ${result.spatialAnalysis?.isLikelyComposite ? 'Yes' : 'No'}`, margin + 5, yPosition + 19);
        yPosition += 30;

        // DRWF
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('DRWF (Dynamic Reliability-Weighted Fusion)', margin + 5, yPosition + 10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mutedColor);
        doc.setFontSize(9);
        doc.text(`Dynamic Weighting: ${result.fusion?.dynamicWeighting?.enabled ? 'Enabled' : 'Disabled'} | ${result.fusion?.dynamicWeighting?.weightAdjustments || 'Standard weights applied'}`, margin + 5, yPosition + 19);
        yPosition += 35;

        // Analysis Details
        if (result.detectors.visionLLM?.analysis?.overallAssessment) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textColor);
            doc.text('AI Analysis Summary', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...mutedColor);

            // Word wrap the assessment
            const lines = doc.splitTextToSize(result.detectors.visionLLM.analysis.overallAssessment, pageWidth - 2 * margin);
            doc.text(lines.slice(0, 4), margin, yPosition); // Limit to 4 lines
            yPosition += lines.slice(0, 4).length * 5 + 10;
        }

        // Footer
        const footerY = pageHeight - 20;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.text('AI Forensic Analyzer | Research Project', margin, footerY);
        doc.text('Team: Aashish Kumar Mahato, Rahul Yadav, Bibek Gami', margin, footerY + 5);
        doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin - 50, footerY);

        // Save the PDF
        const fileName = imageName
            ? `AI_Analysis_${imageName.replace(/\.[^/.]+$/, '')}_${reportId}.pdf`
            : `AI_Analysis_Report_${reportId}.pdf`;

        doc.save(fileName);
        showToast.download(`Report downloaded: ${fileName}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast.error('Failed to generate PDF report');
        throw error;
    }
}

// Export button component
export default function PDFExportButton({ result, imageUrl, imageName }: ReportData) {
    const handleExport = () => {
        generatePDFReport({ result, imageUrl, imageName });
    };

    return (
        <button
            onClick={handleExport}
            className="pdf-export-btn"
            aria-label="Download PDF Report"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download PDF Report</span>

            <style jsx>{`
        .pdf-export-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        .pdf-export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }

        .pdf-export-btn:active {
          transform: translateY(0);
        }
      `}</style>
        </button>
    );
}
