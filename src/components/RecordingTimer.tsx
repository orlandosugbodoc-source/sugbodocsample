interface RecordingTimerProps {
  seconds: number;
}

export function RecordingTimer({ seconds }: RecordingTimerProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-center my-1">
      <span className="text-2xl font-bold text-gray-800 tabular-nums tracking-wide">
        {formatTime(seconds)}
      </span>
    </div>
  );
}
