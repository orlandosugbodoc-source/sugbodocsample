import { useState, useEffect, useRef } from "react";

export type RecognitionStatus = "idle" | "listening" | "processing" | "stopped" | "error";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState("fil-PH");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");
  const lastResultTimestampRef = useRef<number>(Date.now());

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
      setStatus("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setStatus("listening");
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }

      if (finalText) {
        const now = Date.now();
        const timeDiff = now - lastResultTimestampRef.current;
        lastResultTimestampRef.current = now;

        // If pause is longer than 3.5s, create a new paragraph
        if (accumulatedTranscriptRef.current && timeDiff > 3500) {
          accumulatedTranscriptRef.current = accumulatedTranscriptRef.current + "\n\n" + finalText.trim();
        } else {
          accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + " " + finalText.trim()).trim();
        }
        setTranscript(accumulatedTranscriptRef.current);
      }
      setInterimTranscript(interimText);
      setStatus("listening");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        return;
      }
      
      isListeningRef.current = false;
      
      let friendlyMessage = `Recognition error: ${event.error}`;
      if (event.error === "network") {
        friendlyMessage = "Speech recognition network error. Chrome's built-in transcription requires a stable internet connection to connect to Google's cloud servers. Please verify your connection or firewall rules.";
      } else if (event.error === "not-allowed") {
        friendlyMessage = "Microphone permission blocked or secure context required (HTTPS/localhost).";
      }
      
      setError(friendlyMessage);
      setStatus("error");
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to restart speech recognition:", e);
        }
      } else {
        setStatus((prev) => (prev === "error" ? "error" : "stopped"));
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      try {
        recognition.abort();
      } catch (e) {
        console.error("Failed to abort speech recognition during unmount:", e);
      }
    };
  }, []);

  const start = () => {
    if (!recognitionRef.current) {
      if (!error) {
        setError("Speech recognition is not initialized or supported.");
      }
      return;
    }

    isListeningRef.current = true;
    accumulatedTranscriptRef.current = "";
    lastResultTimestampRef.current = Date.now();
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setStatus("processing");

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setError("Failed to start speech recognition.");
      setStatus("error");
    }
  };

  const stop = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
    }
    setStatus("stopped");
    setInterimTranscript("");
  };

  const clear = () => {
    accumulatedTranscriptRef.current = "";
    lastResultTimestampRef.current = Date.now();
    setTranscript("");
    setInterimTranscript("");
    if (!isListeningRef.current) {
      setStatus("idle");
    }
  };

  const isSupported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Synchronize language shifts to the SpeechRecognition instance at runtime
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  return {
    transcript,
    interimTranscript,
    status,
    error,
    lang,
    setLang,
    start,
    stop,
    clear,
    isSupported,
  };
}
