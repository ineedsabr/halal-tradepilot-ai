type TrustBadgeProps = {
  label: string;
  value?: string;
};

export function TrustBadge({ label, value }: TrustBadgeProps) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.74)] px-3 py-2">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--app-muted))]">
        {label}
      </p>
      {value ? (
        <p className="m-0 mt-1 text-sm font-semibold text-[rgb(var(--app-text))]">
          {value}
        </p>
      ) : null}
    </div>
  );
}
