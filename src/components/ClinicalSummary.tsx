import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import type { SummaryType, PatientMetadata } from "../utils/gemini";
import { Download, Copy, Check, Edit2, Save, X, Bookmark } from "lucide-react";
import { MarkdownRenderer } from "./ui/MarkdownRenderer";
import { initLocalEngine, isLocalEngineReady, generateLocalClinicalSummary, clearLocalCache } from "../utils/webllm";

interface ClinicalSummaryProps {
  transcript: string;
  isRecording: boolean;
  patientDetails: PatientMetadata;
  onSaveHistory: (summary: string, summaryType: string) => void;
  hasSavedThisSession: boolean;
  initialSummary?: string;
  initialSummaryType?: SummaryType;
}

export function ClinicalSummary({
  transcript,
  isRecording,
  patientDetails,
  onSaveHistory,
  hasSavedThisSession,
  initialSummary = "",
  initialSummaryType = "soap"
}: ClinicalSummaryProps) {
  const [summaryType, setSummaryType] = useState<SummaryType>(initialSummaryType);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(initialSummary);

  const [localInitStatus, setLocalInitStatus] = useState<string>("");
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [resettingCache, setResettingCache] = useState(false);

  const handleResetCache = async () => {
    setResettingCache(true);
    setError(null);
    try {
      await clearLocalCache();
      setError("Local AI cache cleared. Please click \"Generate AI Summary\" to retry downloading the model.");
    } catch (err: any) {
      setError(err.message || "Failed to clear cache.");
    } finally {
      setResettingCache(false);
    }
  };

  // Sync with initialSummary prop when loading a saved session
  useEffect(() => {
    setSummary(initialSummary);
    setEditedSummary(initialSummary);
    setIsEditing(false);
  }, [initialSummary]);

  // Sync with initialSummaryType prop when loading a saved session
  useEffect(() => {
    setSummaryType(initialSummaryType);
  }, [initialSummaryType]);

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

    setError(null);
    try {
      // Local AI Provider - lazy load model if not ready
      if (!isLocalEngineReady()) {
        setLocalLoading(true);
        try {
          await initLocalEngine((report) => {
            setLocalInitStatus(`${report.text} (${Math.round(report.progress * 100)}%)`);
          });
        } catch (err: any) {
          setError(err.message || "Failed to load local AI model.");
          setLocalLoading(false);
          return;
        } finally {
          setLocalLoading(false);
        }
      }

      setLoading(true);
      const result = await generateLocalClinicalSummary(transcript, summaryType, patientDetails);
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
          Clinical Summary (Offline AI)
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
              <option value="encounter">FHIR Patient Encounter</option>
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
          {localLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/90">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
              <p className="text-sm font-semibold text-gray-700">Loading Local AI Model...</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs">{localInitStatus}</p>
              <p className="text-[10px] text-gray-400 mt-3 italic max-w-xs">(Requires downloading ~1.2GB of model weights, cached locally for offline use)</p>
            </div>
          ) : loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/80">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm font-medium text-gray-600">Analyzing medical transcript...</p>
              <p className="text-xs text-gray-400 mt-1">Generating your structured {summaryType.toUpperCase()} note.</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-100 text-xs">
              <h5 className="font-semibold">Error Generating Note</h5>
              <p className="mt-1">{error}</p>
              {(error.toLowerCase().includes("cache") ||
                error.toLowerCase().includes("download") ||
                error.toLowerCase().includes("network") ||
                error.toLowerCase().includes("hugging face")) && (
                <button
                  onClick={handleResetCache}
                  disabled={resettingCache}
                  className="mt-2.5 px-3 py-1.5 bg-red-100 text-red-900 border border-red-200 rounded-lg font-semibold text-[10px] cursor-pointer hover:bg-red-200/75 transition-all disabled:opacity-60"
                >
                  {resettingCache ? "Clearing..." : "Reset local AI Cache"}
                </button>
              )}
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
            <div className="text-gray-800 leading-relaxed text-sm select-text markdown-content">
              <MarkdownRenderer content={summary} />
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
                onClick={() => onSaveHistory(isEditing ? editedSummary : summary, summaryType)}
                disabled={hasSavedThisSession}
                variant={hasSavedThisSession ? "secondary" : "primary"}
                className="h-8 px-3.5 text-xs"
              >
                <Bookmark className="w-3.5 h-3.5 mr-1" />
                {hasSavedThisSession ? "Saved" : "Save to History"}
              </Button>
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
