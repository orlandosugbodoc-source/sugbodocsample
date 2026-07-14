import { cn } from "../utils/cn";

export type StatusType = "ready" | "listening" | "processing" | "stopped" | "error";

interface RecordingStatusProps {
  status: StatusType;
}

export function RecordingStatus({ status }: RecordingStatusProps) {
  const configs = {
    ready: { text: "Ready", dotColor: "bg-green-500" },
    listening: { text: "Listening...", dotColor: "bg-danger" },
    processing: { text: "Processing...", dotColor: "bg-primary" },
    stopped: { text: "Stopped", dotColor: "bg-gray-400" },
    error: { text: "Error", dotColor: "bg-red-500" },
  };

  const current = configs[status] || configs.ready;

  return (
    <div className="flex items-center justify-center space-x-2 my-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", current.dotColor)} />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {current.text}
      </span>
    </div>
  );
}
