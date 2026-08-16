interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--panel-border)] p-8 text-center text-sm text-[var(--panel-text-secondary)]">
      {message}
    </div>
  );
}
