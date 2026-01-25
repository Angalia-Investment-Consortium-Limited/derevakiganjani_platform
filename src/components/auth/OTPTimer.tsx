import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface OTPTimerProps {
  duration?: number; // Duration in seconds
  onResend: () => void;
  disabled?: boolean;
}

export const OTPTimer: React.FC<OTPTimerProps> = ({
  duration = 300, // 5 minutes default
  onResend,
  disabled = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setCanResend(false);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    if (canResend && !disabled) {
      setTimeLeft(duration);
      setCanResend(false);
      onResend();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      {!canResend ? (
        <p className="text-muted-foreground">
          Resend OTP in <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span>
        </p>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={disabled}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Resend OTP
        </Button>
      )}
    </div>
  );
};
