import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { generateClinicalSummary } from "../utils/gemini";
import type { SummaryType } from "../utils/gemini";
import { Download, Copy, Check, Edit2, Save, X } from "lucide-react";

interface ClinicalSummaryProps {
  transcript: string;
  isRecording: boolean;
}

export function ClinicalSummary({ transcript, isRecording }: ClinicalSummaryProps) {
  const [summaryType, setSummaryType] = useState<SummaryType>("soap");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");

  // Clear summary when a new recording begins
  useEffect(() => {
    if (isRecording) {
      setSummary("");
      setEditedSummary("");
      setError(null);
      setIsEditing(false);
    }
  }, [isRecording]);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError("Please record a consultation or produce a transcript first.");
      return;
    }

    // Retrieve API key from Vite environment variable or localStorage
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("sugbodoc_gemini_api_key") || "").trim();
    if (!apiKey) {
      setError("Gemini API Key is not configured. Please define VITE_GEMINI_API_KEY in your environment.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateClinicalSummary(transcript, summaryType, apiKey);
      setSummary(result);
      setEditedSummary(result);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = isEditing ? editedSummary : summary;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    const textToDownload = isEditing ? editedSummary : summary;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `clinical_summary_${summaryType}_${dateStr}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full flex-grow flex flex-col h-[480px] md:h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-1.5 text-gray-900">
          Clinical Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col p-6 overflow-hidden min-h-0">
        {/* Configuration Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-50 mb-4 flex-shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-gray-500">Format:</span>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value as SummaryType)}
              className="bg-white border border-gray-200 rounded-lg text-xs font-medium px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="soap">SOAP Note</option>
              <option value="patient">Patient Instructions</option>
              <option value="memo">Clinical Memo</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || isRecording || !transcript.trim()}
            variant="primary"
            className="h-9 px-4 text-xs shadow-sm cursor-pointer"
          >
            {loading ? "Generating..." : "Generate AI Summary"}
          </Button>
        </div>

        {/* Content Display/Edit Area */}
        <div className="flex-grow overflow-y-auto min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/80">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm font-medium text-gray-600">Analyzing medical transcript...</p>
              <p className="text-xs text-gray-400 mt-1">Generating your structured {summaryType.toUpperCase()} note.</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-100 text-xs">
              <h5 className="font-semibold">Error Generating Note</h5>
              <p className="mt-1">{error}</p>
            </div>
          ) : !summary ? (
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-gray-400 italic text-sm">
                {!transcript.trim() 
                  ? "Record a consultation first to enable summarization."
                  : isRecording
                    ? "Waiting for recording to complete..."
                    : "Click \"Generate AI Summary\" to create clinical notes."}
              </p>
            </div>
          ) : isEditing ? (
            <textarea
              className="w-full h-full p-3 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
            />
          ) : (
            <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap select-text markdown-content">
              {summary}
            </div>
          )}
        </div>

        {/* Summary Actions Footer */}
        {summary && !loading && (
          <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4 flex-shrink-0">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => {
                      setSummary(editedSummary);
                      setIsEditing(false);
                    }}
                    variant="primary"
                    className="h-8 px-3.5 text-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditedSummary(summary);
                      setIsEditing(false);
                    }}
                    variant="secondary"
                    className="h-8 px-3.5 text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  className="h-8 px-3.5 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="secondary"
                className="h-8 px-3.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="secondary"
                className="h-8 px-3.5 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
