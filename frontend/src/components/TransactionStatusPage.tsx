'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type TxStatus = 'pending' | 'confirmed' | 'failed';
type TxType = 'deposit' | 'withdraw' | 'harvest';

interface TransactionData {
  hash: string;
  status: TxStatus;
  type: TxType;
  amount: string;
  shares: string;
  timestamp: string; // ISO-8601
  explorerUrl?: string;
}

type PageState =
  | { phase: 'loading' }
  | { phase: 'not_found' }
  | { phase: 'error'; message: string }
  | { phase: 'loaded'; tx: TransactionData };

// ── Constants ─────────────────────────────────────────────────────────────────

const STELLAR_EXPLORER_BASE = 'https://stellar.expert/explorer/testnet/tx';
const POLL_INTERVAL_MS = 5_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Stellar tx hashes are 64 hex chars */
function isValidHash(hash: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(hash);
}

async function fetchTransaction(hash: string): Promise<TransactionData | null> {
  const res = await fetch(`/api/v1/vault/transactions/${hash}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  const data = json.data ?? json;
  return {
    hash: data.hash ?? hash,
    status: data.status ?? 'pending',
    type: data.type ?? data.operation_type ?? 'deposit',
    amount: data.amount ?? data.underlying_amount ?? '0',
    shares: data.shares ?? data.share_delta ?? '0',
    timestamp: data.timestamp ?? data.created_at ?? new Date().toISOString(),
    explorerUrl: data.explorer_url ?? `${STELLAR_EXPLORER_BASE}/${hash}`,
  };
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function shortHash(hash: string): string {
  return hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-8)}` : hash;
}

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for environments without Clipboard API
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'absolute';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TxStatus }) {
  const variants = {
    pending: {
      label: 'Pending',
      className:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      icon: (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ),
    },
    confirmed: {
      label: 'Confirmed',
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    failed: {
      label: 'Failed',
      className:
        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  } as const;

  const v = variants[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${v.className}`}
      role="status"
      aria-label={`Transaction status: ${v.label}`}
    >
      {v.icon}
      {v.label}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : label}
      title={copied ? 'Copied!' : label}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {copied ? (
        <>
          <svg
            className="h-3.5 w-3.5 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-32 shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="animate-pulse"
      aria-busy="true"
      aria-label="Loading transaction…"
    >
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFoundState({ hash }: { hash: string }) {
  return (
    <div
      className="text-center py-12"
      role="main"
      aria-label="Transaction not found"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <svg
          className="h-8 w-8 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Transaction Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
        No transaction was found for:
      </p>
      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
        {hash}
      </code>
      <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
        The transaction may not have been indexed yet, or the hash may be
        incorrect. Check the hash and try again.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TransactionStatusPage({ hash }: { hash: string }) {
  const [state, setState] = useState<PageState>({ phase: 'loading' });
  const [urlCopied, setUrlCopied] = useState(false);

  const load = useCallback(async () => {
    if (!isValidHash(hash)) {
      setState({ phase: 'not_found' });
      return;
    }
    try {
      const tx = await fetchTransaction(hash);
      if (!tx) {
        setState({ phase: 'not_found' });
      } else {
        setState({ phase: 'loaded', tx });
      }
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [hash]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Poll every 5s while pending
  useEffect(() => {
    if (state.phase !== 'loaded' || state.tx.status !== 'pending') return;
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [state, load]);

  const handleShareUrl = useCallback(async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : '';
    try {
      await copyToClipboard(url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to vault
        </a>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Transaction Status
          </h1>

          {/* Share URL button */}
          <button
            type="button"
            onClick={handleShareUrl}
            aria-label={
              urlCopied ? 'URL copied to clipboard' : 'Copy shareable URL'
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {urlCopied ? (
              <>
                <svg
                  className="h-4 w-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </>
            )}
          </button>
        </div>

        {/* States */}
        {state.phase === 'loading' && <LoadingSkeleton />}

        {state.phase === 'not_found' && <NotFoundState hash={hash} />}

        {state.phase === 'error' && (
          <div
            className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6"
            role="alert"
          >
            <h2 className="text-red-800 dark:text-red-300 font-semibold mb-1">
              Failed to load transaction
            </h2>
            <p className="text-red-700 dark:text-red-400 text-sm">
              {state.message}
            </p>
            <button
              type="button"
              onClick={load}
              className="mt-4 text-sm text-red-700 dark:text-red-400 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
            >
              Try again
            </button>
          </div>
        )}

        {state.phase === 'loaded' && (
          <article
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
            aria-label={`Transaction ${shortHash(state.tx.hash)}`}
          >
            {/* Status header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <StatusBadge status={state.tx.status} />
              {state.tx.status === 'pending' && (
                <span
                  className="text-xs text-gray-500 dark:text-gray-400"
                  aria-live="polite"
                >
                  Auto-refreshing every 5s…
                </span>
              )}
            </div>

            {/* Data rows */}
            <dl className="px-6 py-2">
              <DataRow label="Hash">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-xs break-all">
                    {state.tx.hash}
                  </code>
                  <CopyButton
                    text={state.tx.hash}
                    label="Copy transaction hash"
                  />
                </div>
              </DataRow>

              <DataRow label="Operation">
                <span className="capitalize font-medium">{state.tx.type}</span>
              </DataRow>

              <DataRow label="Amount">
                <span className="font-mono">
                  {parseFloat(state.tx.amount).toLocaleString()} tokens
                </span>
              </DataRow>

              <DataRow label="Shares">
                <span className="font-mono">
                  {parseFloat(state.tx.shares).toLocaleString()} shares
                </span>
              </DataRow>

              <DataRow label="Timestamp">
                <time dateTime={state.tx.timestamp}>
                  {formatDate(state.tx.timestamp)}
                </time>
              </DataRow>

              <DataRow label="Explorer">
                <a
                  href={
                    state.tx.explorerUrl ??
                    `${STELLAR_EXPLORER_BASE}/${state.tx.hash}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  View on Stellar Expert
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </DataRow>
            </dl>
          </article>
        )}
      </div>
    </main>
  );
}
