import { Mic, Square } from "lucide-react";
import { cn } from "../utils/cn";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function RecordingButton({ isRecording, onClick, disabled = false }: RecordingButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 my-6">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-md",
          isRecording
            ? "border-[3px] border-danger text-danger bg-white hover:bg-danger-light focus:ring-danger/30 scale-105"
            : "bg-primary text-white hover:bg-primary-hover focus:ring-primary/30 hover:scale-105"
        )}
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isRecording ? (
          <Square className="w-8 h-8 fill-current stroke-[2.5]" />
        ) : (
          <Mic className="w-8 h-8 stroke-[2.5]" />
        )}
      </button>
      <span className="font-semibold text-sm text-gray-700 tracking-wide">
        {isRecording ? "Stop Recording" : "Start Recording"}
      </span>
    </div>
  );
}
