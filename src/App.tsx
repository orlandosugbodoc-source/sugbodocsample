import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { RecordingButton } from "./components/RecordingButton";
import { RecordingStatus } from "./components/RecordingStatus";
import type { StatusType } from "./components/RecordingStatus";
import { RecordingTimer } from "./components/RecordingTimer";
import { LiveTranscript } from "./components/LiveTranscript";
import { TranscriptActions } from "./components/TranscriptActions";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { AlertCircle, ShieldAlert, History, HelpCircle, FileText } from "lucide-react";
import { ClinicalSummary } from "./components/ClinicalSummary";
import { PatientDetails } from "./components/PatientDetails";
import { HistorySidebar } from "./components/HistorySidebar";
import { HelpModal } from "./components/HelpModal";
import { SampleSummaryModal } from "./components/SampleSummaryModal";
import type { HistoryItem } from "./components/HistorySidebar";
import type { PatientMetadata, SummaryType } from "./utils/gemini";

function App() {
  const {
    isRecording: isAudioRecording,
    seconds,
    permission: micPermission,
    stream: audioStream,
    startRecording,
    stopRecording,
    requestPermission,
  } = useAudioRecorder();

  const {
    transcript,
    interimTranscript,
    status: recognitionStatus,
    error: recognitionError,
    start: startSpeech,
    stop: stopSpeech,
    isSupported: isSpeechSupported,
    lang,
    setLang,
    setTranscript,
  } = useSpeechRecognition();

  const [status, setStatus] = useState<StatusType>("ready");

  // Patient & Visit Metadata State
  const [patientDetails, setPatientDetails] = useState<PatientMetadata>({
    name: "",
    age: "",
    gender: "",
    date: new Date().toISOString().split("T")[0]
  });

  // Local Storage Consultation History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("sugbodoc_consultation_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history:", e);
      return [];
    }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadedSummary, setLoadedSummary] = useState("");
  const [loadedSummaryType, setLoadedSummaryType] = useState<SummaryType>("soap");

  // Persist history updates to localStorage
  useEffect(() => {
    localStorage.setItem("sugbodoc_consultation_history", JSON.stringify(history));
  }, [history]);

  // Keep transcription status in sync with recorder hooks
  useEffect(() => {
    if (micPermission === "denied") {
      setStatus("error");
    } else if (isAudioRecording) {
      if (recognitionStatus === "listening") {
        setStatus("listening");
      } else if (recognitionStatus === "processing") {
        setStatus("processing");
      } else if (recognitionStatus === "error" || recognitionError) {
        setStatus("error");
      } else {
        setStatus("listening");
      }
    } else if (seconds > 0) {
      setStatus("stopped");
    } else {
      setStatus("ready");
    }
  }, [isAudioRecording, recognitionStatus, micPermission, seconds, recognitionError]);

  // Global Alt + R keyboard shortcut to toggle recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleToggleRecording();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioRecording, micPermission]);

  const handleToggleRecording = async () => {
    if (isAudioRecording) {
      stopRecording();
      stopSpeech();
    } else {
      if (micPermission !== "granted") {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;
      }

      try {
        await startRecording();
        startSpeech();
        // Clear active session since this is a new recording
        setActiveSessionId(null);
        setLoadedSummary("");
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `consultation_transcript_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save consultation to History (localStorage)
  const handleSaveHistory = (summaryText: string, type: string) => {
    if (!summaryText.trim()) return;

    if (activeSessionId) {
      // Update existing session
      setHistory(prev =>
        prev.map(item =>
          item.id === activeSessionId
            ? {
                ...item,
                patientDetails: { ...patientDetails },
                transcript,
                summary: summaryText,
                summaryType: type
              }
            : item
        )
      );
      setLoadedSummary(summaryText);
      setLoadedSummaryType(type as SummaryType);
    } else {
      // Create new session
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        patientDetails: { ...patientDetails },
        transcript,
        summary: summaryText,
        summaryType: type,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev]);
      setActiveSessionId(newItem.id);
      setLoadedSummary(summaryText);
      setLoadedSummaryType(type as SummaryType);
    }
  };

  // Load a consultation from History
  const handleSelectItem = (item: HistoryItem) => {
    setPatientDetails(item.patientDetails);
    setTranscript(item.transcript);
    setLoadedSummary(item.summary);
    setLoadedSummaryType(item.summaryType as SummaryType);
    setActiveSessionId(item.id);
    setIsHistoryOpen(false);
  };

  // Delete a single consultation from History
  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setLoadedSummary("");
    }
  };

  // Clear all consultation history
  const handleClearAll = () => {
    setHistory([]);
    setActiveSessionId(null);
    setLoadedSummary("");
  };

  // Check if current page state is saved to the active session history item
  const hasSavedThisSession = history.some(
    item =>
      item.id === activeSessionId &&
      item.transcript.trim() === transcript.trim() &&
      item.summary.trim() === loadedSummary.trim() &&
      JSON.stringify(item.patientDetails) === JSON.stringify(patientDetails)
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="w-full max-w-5xl flex flex-col flex-grow space-y-6">
        <Header />

        {/* Action bar for History and Help */}
        <div className="flex justify-between items-center w-full">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {activeSessionId ? "Viewing Loaded Session" : "New Consultation"}
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={() => setIsSampleOpen(true)}
              className="inline-flex items-center text-xs font-bold text-gray-700 hover:text-gray-900 gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-full transition-all cursor-pointer focus:outline-none shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              Sample Output
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-700 gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-full transition-all cursor-pointer focus:outline-none"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              How to Use
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-hover gap-1.5 px-4 py-2 bg-primary-light/50 hover:bg-primary-light/80 rounded-full transition-all cursor-pointer shadow-sm focus:outline-none"
            >
              <History className="w-3.5 h-3.5" />
              History ({history.length})
            </button>
          </div>
        </div>

        {/* Microphone Permission Warning */}
        {micPermission === "denied" && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 text-red-800 rounded-lg border border-red-100 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold">Microphone Access Blocked</h3>
              <p className="mt-1 text-red-700">
                Microphone permission was denied. Please update your browser site settings to allow microphone access.
              </p>
            </div>
          </div>
        )}

        {/* Browser Compatibility Alert */}
        {!isSpeechSupported && (
          <div className="flex items-start space-x-3 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold">Speech Recognition Unsupported</h3>
              <p className="mt-1 text-amber-700 font-medium">
                Your browser doesn't support local Speech Recognition. For a complete live transcript, use Google Chrome, Safari, or Microsoft Edge.
              </p>
            </div>
          </div>
        )}

        {/* Details & Recording Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
          <PatientDetails
            details={patientDetails}
            onChange={setPatientDetails}
            disabled={isAudioRecording}
          />

          {/* Recording Console */}
          <div className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm min-h-[300px]">
            <RecordingButton
              isRecording={isAudioRecording}
              onClick={handleToggleRecording}
              disabled={!isSpeechSupported}
            />
            <RecordingTimer seconds={seconds} />
            <AudioVisualizer stream={audioStream} isRecording={isAudioRecording} />
            <RecordingStatus status={status} />
            {recognitionError && (
              <div className="mt-2 text-xs text-red-600 font-medium text-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100 max-w-xs">
                {recognitionError}
              </div>
            )}
          </div>
        </div>

        {/* Transcript and Summarization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full flex-grow items-start">
          <div className="flex flex-col space-y-4 h-full">
            <LiveTranscript
              transcript={transcript}
              interimTranscript={interimTranscript}
              isRecording={isAudioRecording}
              selectedLanguage={lang}
              onLanguageChange={setLang}
            />
            <TranscriptActions
              transcript={transcript}
              onDownload={handleDownload}
              disabled={isAudioRecording}
            />
          </div>
          
          <ClinicalSummary
            transcript={transcript}
            isRecording={isAudioRecording}
            patientDetails={patientDetails}
            onSaveHistory={handleSaveHistory}
            hasSavedThisSession={hasSavedThisSession}
            initialSummary={loadedSummary}
            initialSummaryType={loadedSummaryType}
          />
        </div>

      </div>

      {/* History Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelectItem={handleSelectItem}
        onDeleteItem={handleDeleteItem}
        onClearAll={handleClearAll}
      />

      {/* Onboarding Help Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Sample Clinical Summary Output Modal */}
      <SampleSummaryModal
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
      />
    </div>
  );
}

export default App;
