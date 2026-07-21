import { X, Calendar, User, Trash2, BookOpen } from "lucide-react";
import type { PatientMetadata } from "../utils/gemini";

export interface HistoryItem {
  id: string;
  patientDetails: PatientMetadata;
  transcript: string;
  summary: string;
  summaryType: string;
  timestamp: number;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export function HistorySidebar({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll
}: HistorySidebarProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white flex flex-col shadow-2xl border-l border-gray-100 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Saved Consultations</h2>
              <p className="text-xs text-gray-400 font-medium">History stored locally on your device</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="font-semibold text-sm text-gray-700">No saved sessions</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Completed summaries can be saved here for quick offline access.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="group relative border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  onClick={() => onSelectItem(item)}
                >
                  <div className="pr-8">
                    <span className="text-[10px] font-bold text-primary bg-primary-light/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.summaryType}
                    </span>
                    
                    <h4 className="font-bold text-gray-800 text-sm mt-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {item.patientDetails.name || "Unnamed Patient"}
                    </h4>

                    <div className="flex items-center text-xs text-gray-400 font-medium mt-1 gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      {formatDate(item.timestamp)}
                    </div>

                    {item.transcript && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-3 italic leading-relaxed">
                        "{item.transcript.slice(0, 100)}..."
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this consultation history?")) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
                    onClearAll();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
              
              <span className="text-xs text-gray-400 font-medium">
                {items.length} {items.length === 1 ? "session" : "sessions"}
              </span>
            </div>
          )}
        </div>
    </div>
  );
}
