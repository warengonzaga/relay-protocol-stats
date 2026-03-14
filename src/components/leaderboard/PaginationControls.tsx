import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
}

export default function PaginationControls({ page, totalPages, onPrev, onNext, disabled }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1 || disabled}
        className="gap-1.5"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="min-w-[120px] text-center text-sm text-zinc-400">
        Page <span className="font-medium text-zinc-200">{page}</span> of{' '}
        <span className="font-medium text-zinc-200">{totalPages}</span>
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages || disabled}
        className="gap-1.5"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
