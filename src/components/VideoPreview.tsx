import { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface VideoPreviewProps {
  videoPath?: string;
  exerciseName: string;
  machineName?: string;
  primaryMuscles?: string[];
  accentColor?: string;
  accentBg?: string;
}

export function VideoPreview({
  videoPath,
  exerciseName,
  machineName,
  primaryMuscles,
  accentColor = 'text-text-muted',
  accentBg = 'bg-surface-muted',
}: VideoPreviewProps) {
  const [hasError, setHasError] = useState(false);

  if (!videoPath || hasError) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-surface-muted to-surface-muted/60 flex flex-col items-center justify-center gap-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentBg}`}>
          <Dumbbell className={`w-6 h-6 ${accentColor}`} />
        </div>
        {machineName && (
          <p className="text-xs font-semibold text-text-secondary text-center px-4">{machineName}</p>
        )}
        {primaryMuscles && primaryMuscles.length > 0 && (
          <p className="text-xs text-text-muted text-center px-6">{primaryMuscles.join(' · ')}</p>
        )}
        {!machineName && (
          <p className="text-xs text-text-muted text-center px-4">{exerciseName}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface-muted">
      <img
        className="w-full h-full object-contain"
        src={videoPath}
        alt={`Preview ${exerciseName}`}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
