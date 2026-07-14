import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { cn } from "../utils/cn";

interface LiveTranscriptProps {
  transcript: string;
  interimTranscript: string;
  isRecording: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export function LiveTranscript({
  transcript,
  interimTranscript,
  isRecording,
  selectedLanguage,
  onLanguageChange
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new transcript content arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const hasContent = transcript.trim() || interimTranscript.trim();

  return (
    <Card className="w-full flex-grow flex flex-col h-[350px] md:h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>Live Transcript</CardTitle>
        <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-full border border-gray-100/80">
          <button
            onClick={() => onLanguageChange("en-US")}
            className={cn(
              "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
              selectedLanguage === "en-US"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange("fil-PH")}
            className={cn(
              "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
              selectedLanguage === "fil-PH"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Filipino / Taglish
          </button>
        </div>
      </CardHeader>
      <CardContent
        ref={scrollRef}
        className="flex-grow overflow-y-auto overflow-x-hidden p-6 select-text scroll-smooth"
      >
        {!hasContent ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-gray-400 italic text-sm">
              {isRecording ? "Listening for conversation..." : "Transcript will appear here..."}
            </p>
          </div>
        ) : (
          <div className="text-gray-800 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words">
            <span>{transcript}</span>
            {interimTranscript && (
              <span className="text-gray-400 italic">
                {" "}{interimTranscript}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
