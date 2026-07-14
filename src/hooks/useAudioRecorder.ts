import { useState, useEffect, useRef } from "react";

export type PermissionState = "prompt" | "granted" | "denied";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [permission, setPermission] = useState<PermissionState>("prompt");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Check initial permission status if supported by the browser
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((permissionStatus) => {
          setPermission(permissionStatus.state as PermissionState);
          permissionStatus.onchange = () => {
            setPermission(permissionStatus.state as PermissionState);
          };
        })
        .catch(() => {
          // Permissions query not supported or failed - will fall back during media capture
        });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream tracks immediately
      stream.getTracks().forEach((track) => track.stop());
      setPermission("granted");
      return true;
    } catch (error) {
      setPermission("denied");
      return false;
    }
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      setPermission("granted");

      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported in this browser");
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      // Collect data chunks periodically (e.g. 1000ms)
      recorder.start(1000);
      setIsRecording(true);
      setSeconds(0);

      // Start the timer
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error starting recording:", error);
      setPermission("denied");
      throw error;
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStream(null);
    setIsRecording(false);
  };

  const resetRecorder = () => {
    stopRecording();
    setSeconds(0);
    setAudioBlob(null);
    chunksRef.current = [];
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // Ignored
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setStream(null);
    };
  }, []);

  return {
    isRecording,
    seconds,
    permission,
    audioBlob,
    stream,
    startRecording,
    stopRecording,
    resetRecorder,
    requestPermission,
  };
}
