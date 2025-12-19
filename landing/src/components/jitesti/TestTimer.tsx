import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export const TestTimer = ({ durationMinutes, onTimeUp, isPaused = false }: TestTimerProps) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // Convert to seconds
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        
        // Show warning when 5 minutes left
        if (prev === 300) {
          setShowWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 300; // 5 minutes or less

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-2 p-4 rounded-lg border-2 ${
          isLowTime
            ? 'border-red-500 bg-red-50 dark:bg-red-950'
            : 'border-primary bg-primary/5'
        }`}
      >
        <Clock className={`h-5 w-5 ${isLowTime ? 'text-red-600' : 'text-primary'}`} />
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground">
            {t('timeRemaining') || 'Time Remaining'}
          </div>
          <div className={`text-2xl font-bold ${isLowTime ? 'text-red-600' : 'text-primary'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {showWarning && isLowTime && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('timeWarning') || 'Only 5 minutes remaining! Please complete your test soon.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
