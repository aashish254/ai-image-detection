'use client';

import { jsPDF } from 'jspdf';
import { AnalysisResult } from '@/lib/types';
import { getVerdictLabel } from '@/lib/utils';
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

        // The report palette used on screen, flattened to print values
        const inkColor: [number, number, number] = [21, 23, 27];
        const graphiteColor: [number, number, number] = [74, 80, 88];
        const mutedColor: [number, number, number] = [94, 101, 110];
        const ruleColor: [number, number, number] = [210, 214, 220];
        const verifiedColor: [number, number, number] = [22, 105, 58];
        const flaggedColor: [number, number, number] = [163, 33, 27];
        const cautionColor: [number, number, number] = [138, 90, 0];
        const washColor: [number, number, number] = [247, 248, 249];
        const flaggedWash: [number, number, number] = [248, 236, 234];
        const verifiedWash: [number, number, number] = [234, 243, 237];

        const reportId = generateReportId();
        const isAI = result.verdict === 'AI_GENERATED' || result.verdict === 'LIKELY_AI';
        const confidence = result.confidence;
        const verdict = getVerdictLabel(result.verdict).label.toUpperCase();

        // Header
        doc.setFillColor(...inkColor);
        doc.rect(0, 0, pageWidth, 50, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('OriginLayer', margin, 25);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Examination report', margin, 35);

        doc.setFontSize(10);
        doc.text(`Report ${reportId}`, pageWidth - margin - 60, 25);
        doc.text(formatDate(new Date()), pageWidth - margin - 60, 35);

        yPosition = 70;

        // Verdict
        doc.setFillColor(...(isAI ? flaggedWash : verifiedWash));
        doc.roundedRect(margin, yPosition - 10, pageWidth - 2 * margin, 45, 5, 5, 'F');

        doc.setTextColor(...(isAI ? flaggedColor : verifiedColor));
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(verdict, margin + 10, yPosition + 8);

        doc.setTextColor(...inkColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Confidence: ${(confidence * 100).toFixed(1)}%`, margin + 10, yPosition + 22);

        if (result.calibration) {
            doc.setTextColor(...mutedColor);
            doc.setFontSize(11);
            doc.text(`Calibrated confidence (DACC): ${(result.calibration.calibratedScore * 100).toFixed(1)}%`, margin + 10, yPosition + 32);
        }

        yPosition += 55;

        // Read results
        doc.setTextColor(...inkColor);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Reads and scores', margin, yPosition);
        yPosition += 10;

        const detectors = [
            { name: 'HuggingFace classifier', score: result.detectors.huggingface?.score || 0, weight: `${(result.fusion.huggingfaceWeight * 100).toFixed(0)}%` },
            { name: 'Gemini vision review', score: result.detectors.visionLLM?.score || 0, weight: `${(result.fusion.visionLLMWeight * 100).toFixed(0)}%` },
            { name: 'DCT spectra', score: result.detectors.dctAnalysis?.score || 0, weight: `${(result.fusion.dctWeight * 100).toFixed(0)}%` },
        ];

        detectors.forEach((detector, index) => {
            const barY = yPosition + index * 25;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...inkColor);
            doc.text(`${detector.name} (${detector.weight})`, margin, barY);

            doc.setFillColor(...ruleColor);
            doc.roundedRect(margin, barY + 3, pageWidth - 2 * margin - 40, 8, 2, 2, 'F');

            const barWidth = (pageWidth - 2 * margin - 40) * detector.score;
            const scoreColor = detector.score >= 0.65 ? flaggedColor : detector.score >= 0.35 ? cautionColor : verifiedColor;
            doc.setFillColor(...scoreColor);
            doc.roundedRect(margin, barY + 3, Math.max(barWidth, 2), 8, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setTextColor(...graphiteColor);
            doc.text(`${(detector.score * 100).toFixed(1)}%`, pageWidth - margin - 35, barY + 9);
        });

        yPosition += 85;

        // Novel methods
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...inkColor);
        doc.text('Novel methods applied', margin, yPosition);
        yPosition += 12;

        const methodBlocks = [
            {
                title: 'DACC — Disagreement-Aware Confidence Calibration',
                line: `Trust score: ${((result.calibration?.trustScore || 0) * 100).toFixed(1)}% | Calibrated: ${((result.calibration?.calibratedScore || result.confidence) * 100).toFixed(1)}%`,
            },
            {
                title: 'SAM — Spatial Artifact Mapping',
                line: `Regions flagged: ${result.spatialAnalysis?.hotspots?.length || 0} | Likely composite: ${result.spatialAnalysis?.isLikelyComposite ? 'Yes' : 'No'}`,
            },
            {
                title: 'DRWF — Dynamic Reliability-Weighted Fusion',
                line: `Reliability weighting: ${result.fusion?.dynamicWeighting?.enabled ? 'Applied' : 'Not applied'} | ${result.fusion?.dynamicWeighting?.weightAdjustments || 'Base weights used'}`,
            },
        ];

        methodBlocks.forEach((block) => {
            doc.setFillColor(...washColor);
            doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...inkColor);
            doc.text(block.title, margin + 5, yPosition + 10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...mutedColor);
            doc.setFontSize(9);
            doc.text(block.line, margin + 5, yPosition + 19);
            yPosition += 30;
        });

        yPosition += 5;

        // Vision read
        if (result.detectors.visionLLM?.analysis?.overallAssessment) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...inkColor);
            doc.text('What the vision read said', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...graphiteColor);

            const lines = doc.splitTextToSize(result.detectors.visionLLM.analysis.overallAssessment, pageWidth - 2 * margin);
            doc.text(lines.slice(0, 4), margin, yPosition);
            yPosition += lines.slice(0, 4).length * 5 + 10;
        }

        // Footer
        const footerY = pageHeight - 20;
        doc.setDrawColor(...ruleColor);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.text('OriginLayer | research project', margin, footerY);
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
            className="btn btn-primary"
            aria-label="Download the PDF report"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download the PDF report</span>
        </button>
    );
}
