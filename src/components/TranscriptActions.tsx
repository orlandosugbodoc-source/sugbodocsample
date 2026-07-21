import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "./ui/Button";

interface TranscriptActionsProps {
  transcript: string;
  onDownload: () => void;
  disabled?: boolean;
}

export function TranscriptActions({ transcript, onDownload, disabled = false }: TranscriptActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy transcript: ", err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full my-4">
      <Button
        variant="secondary"
        onClick={handleCopy}
        disabled={disabled || !transcript}
        fullWidth
        className="sm:flex-1"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600 stroke-[2.5]" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2 stroke-[2.5]" />
            Copy
          </>
        )}
      </Button>
      <Button
        variant="primary"
        onClick={onDownload}
        disabled={disabled || !transcript}
        fullWidth
        className="sm:flex-1"
      >
        <Download className="w-4 h-4 mr-2 stroke-[2.5]" />
        Download
      </Button>
    </div>
  );
}
