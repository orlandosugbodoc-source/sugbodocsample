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
import { AlertCircle, ShieldAlert } from "lucide-react";
import { ClinicalSummary } from "./components/ClinicalSummary";

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
  } = useSpeechRecognition();

  const [status, setStatus] = useState<StatusType>("ready");

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

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="w-full max-w-5xl flex flex-col flex-grow space-y-6">
        <Header />

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

        {/* Recording Console */}
        <div className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-2xl bg-gray-50/50 shadow-sm">
          <RecordingButton
            isRecording={isAudioRecording}
            onClick={handleToggleRecording}
            disabled={!isSpeechSupported && micPermission !== "denied"}
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
          />
        </div>

        {/* Privacy Shield Info */}
        <div className="text-center text-xs text-gray-400 font-medium pt-4 pb-2 border-t border-gray-100">
          Privacy Protection: Audio recordings and transcripts remain local and are never uploaded to servers.
        </div>
      </div>
    </div>
  );
}

export default App;
