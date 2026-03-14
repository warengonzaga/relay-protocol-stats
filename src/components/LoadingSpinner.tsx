import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const loadingMessages = [
  'Analyzing your cross-chain journey...',
  'Fetching transaction history...',
  'Calculating volume metrics...',
  'Identifying favorite chains...',
  'Processing transaction data...',
  'Gathering chain statistics...',
  'Computing success rates...',
  'Exploring blockchain records...',
  'Mapping cross-chain activity...',
  'Discovering transaction patterns...',
];

interface LoadingSpinnerProps {
  address?: string;
}

export default function LoadingSpinner({ address }: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(loadingMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        // Slow down as we approach completion
        const increment = prev < 50 ? 3 : prev < 80 ? 1.5 : 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 200);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % loadingMessages.length;
        setMessage(loadingMessages[next]);
        return next;
      });
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="w-full mx-auto py-8 sm:py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Loading Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center space-y-2">
          <p className="text-base sm:text-lg font-medium text-foreground animate-in fade-in duration-300" key={messageIndex}>
            {message}
          </p>
          {address && (
            <p className="text-xs sm:text-sm font-mono text-muted-foreground break-all px-4">
              {address}
            </p>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground">
            This may take a moment for wallets with many transactions
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
