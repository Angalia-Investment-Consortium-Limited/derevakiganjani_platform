import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'One lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'One number',
    test: (pwd) => /\d/.test(pwd),
  },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showRequirements = true,
}) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    const passed = requirements.filter((req) => req.test(password)).length;
    const score = (passed / requirements.length) * 100;

    let label = '';
    let color = '';

    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 25) {
      label = 'Weak';
      color = 'bg-destructive';
    } else if (score <= 50) {
      label = 'Fair';
      color = 'bg-orange-500';
    } else if (score <= 75) {
      label = 'Good';
      color = 'bg-yellow-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score, label, color };
  }, [password]);

  const metRequirements = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          {strength.label && (
            <span
              className={cn(
                'font-medium',
                strength.score <= 25 && 'text-destructive',
                strength.score > 25 && strength.score <= 50 && 'text-orange-500',
                strength.score > 50 && strength.score <= 75 && 'text-yellow-500',
                strength.score > 75 && 'text-green-500'
              )}
            >
              {strength.label}
            </span>
          )}
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full transition-all', strength.color)}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          {metRequirements.map((req, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs',
                req.met ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
