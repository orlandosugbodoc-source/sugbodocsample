import { useState } from "react";

export function Header() {
  const [imageError, setImageError] = useState(false);

  return (
    <header className="flex flex-col items-center text-center space-y-2 py-6 border-b border-gray-100 mb-8 select-none">
      <div className="flex items-center space-x-2">
        {!imageError ? (
          <img
            src="https://sugbodoc.com/public/assets/images/brand/logo.png"
            alt="SugboDoc Logo"
            className="h-10 w-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <svg viewBox="0 0 160 40" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stethoscope Chestpiece */}
            <path d="M 10 14 L 10 26" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 10 20 L 14 20" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
            {/* Stethoscope Tubing forming S */}
            <path d="M 14 20 C 20 20, 24 20, 24 16 C 24 11, 15 13, 15 9 C 15 5, 23 5, 23 7.5" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Earpiece Dot */}
            <circle cx="23" cy="7.5" r="1.5" fill="#2563EB" />
            {/* Brand Name Text */}
            <text x="32" y="25" fill="#2563EB" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18.5" letterSpacing="-0.02em">SugboDoc</text>
          </svg>
        )}
      </div>
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight mt-3">
        Medical Transcriptionist
      </h1>
      <p className="text-sm text-gray-500 font-medium">
        Secure Browser-Based Medical Conversation Transcription
      </p>
    </header>
  );
}
