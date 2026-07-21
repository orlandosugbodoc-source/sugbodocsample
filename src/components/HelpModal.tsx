import { X } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Configure & Set Up",
      description: "Ensure your browser microphone access is allowed. Choose your language: English, Tagalog, or Bisaya (Cebuano)."
    },
    {
      title: "Input Patient Details",
      description: "Type the patient's info. Try typing a birthdate or birth year in the Age/DOB field—it will auto-calculate their age!"
    },
    {
      title: "Record the Conversation",
      description: "Click the red microphone to record the consultation live. You will see a real-time transcript populate on screen."
    },
    {
      title: "Generate AI Summaries",
      description: "Select SOAP Note, Patient Instructions, or Clinical Memo, then click 'Generate AI Summary' to parse the dialogue."
    },
    {
      title: "Save & Archive",
      description: "Click 'Save to History' to keep a secure, local copy of the consultation in your history sidebar for future access."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              How to Use
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <span className="text-xs font-bold text-primary w-5 h-5 flex items-center justify-center bg-primary-light/50 rounded-full flex-shrink-0">
                {idx + 1}
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-gray-800">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
