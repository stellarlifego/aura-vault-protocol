import type { Metadata } from 'next';
import TransactionStatusPage from '@/components/TransactionStatusPage';

export const metadata: Metadata = {
  title: 'Transaction Status — Aura Vault',
  description: 'View the status of any Aura Vault transaction by hash',
};

// Next.js 15 App Router: params is async in server components
export default async function TxPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  return <TransactionStatusPage hash={hash} />;
}
