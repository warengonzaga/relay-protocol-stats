import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatUsd, shortenAddress } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/services/leaderboardApi';

interface WalletRowProps {
  entry: LeaderboardEntry;
}

export default function WalletRow({ entry }: WalletRowProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed (e.g. permissions denied), silently ignore
    }
  };

  return (
    <tr className="border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/30">
      <td className="px-4 py-3 text-sm font-medium tabular-nums text-zinc-400">
        #{entry.rank}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-zinc-200">
            {shortenAddress(entry.wallet_address)}
          </span>
          <button
            type="button"
            onClick={copy}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700/50 hover:text-zinc-300"
            aria-label="Copy address"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums text-zinc-100">
        {formatUsd(entry.total_volume_usd)}
      </td>
      <td className="px-4 py-3 text-right text-sm tabular-nums text-zinc-400">
        {entry.total_tx.toLocaleString()}
      </td>
    </tr>
  );
}
