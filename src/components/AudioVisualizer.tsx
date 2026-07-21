import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export function AudioVisualizer({ stream, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Smoothing heights to prevent visual jitter
  const smoothHeightsRef = useRef<number[]>([]);
  const numBars = 36;
  const barWidth = 4;
  const barGap = 3;

  useEffect(() => {
    // Initialize smoothing array
    smoothHeightsRef.current = Array(numBars).fill(4);

    if (!isRecording || !stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      drawFlatLine();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      // FFT size determines the frequency resolution
      analyser.fftSize = 64; 
      analyser.smoothingTimeConstant = 0.8; // Built-in frequency domain smoothing
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const draw = () => {
        if (!isRecording) return;
        animationRef.current = requestAnimationFrame(draw);

        // Fetch frequency domain data instead of time domain
        analyser.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = "#F9FAFB"; // matches bg-gray-50/50
        ctx.fillRect(0, 0, width, height);

        const centerY = height / 2;
        const totalWidth = numBars * (barWidth + barGap) - barGap;
        const startX = (width - totalWidth) / 2;

        for (let i = 0; i < numBars; i++) {
          // Map index to the frequency array
          const dataIndex = Math.floor((i / numBars) * bufferLength);
          const value = dataArray[dataIndex] || 0;

          // Convert value (0-255) to a height percent
          const percent = value / 255;
          // Minimum bar height is 4px so it looks like a clean dot when silent
          const targetHeight = Math.max(4, percent * (height - 8));

          // Interpolation smoothing for premium, liquid animation feel
          smoothHeightsRef.current[i] = smoothHeightsRef.current[i] * 0.65 + targetHeight * 0.35;
          const currentHeight = smoothHeightsRef.current[i];

          const x = startX + i * (barWidth + barGap);
          const y = centerY - currentHeight / 2;

          ctx.fillStyle = "#2563EB"; // primary blue accent
          ctx.beginPath();
          if (ctx.roundRect) {
            // Draw smooth rounded pill bars
            ctx.roundRect(x, y, barWidth, currentHeight, 2);
          } else {
            ctx.rect(x, y, barWidth, currentHeight);
          }
          ctx.fill();
        }
      };

      draw();
    } catch (e) {
      console.error("Audio visualizer failed:", e);
      drawFlatLine();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [stream, isRecording]);

  const drawFlatLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#F9FAFB";
    ctx.fillRect(0, 0, width, height);

    const centerY = height / 2;
    const totalWidth = numBars * (barWidth + barGap) - barGap;
    const startX = (width - totalWidth) / 2;

    // Draw a series of small, static grey dots when idle (looks like Siri standby)
    ctx.fillStyle = "#D1D5DB"; // grey-300
    for (let i = 0; i < numBars; i++) {
      const x = startX + i * (barWidth + barGap);
      const y = centerY - 2; // centered 4px dot
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barWidth, 4, 2);
      } else {
        ctx.rect(x, y, barWidth, 4);
      }
      ctx.fill();
    }
  };

  useEffect(() => {
    drawFlatLine();
  }, []);

  return (
    <div className="w-full max-w-xs h-10 bg-gray-50/50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center my-1 select-none">
      <canvas 
        ref={canvasRef} 
        width={320} 
        height={40} 
        className="w-full h-full block"
      />
    </div>
  );
}
