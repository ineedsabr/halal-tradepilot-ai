type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, className = '' }: SectionHeaderProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--app-muted))]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="m-0 mt-1 text-2xl font-semibold tracking-normal text-[rgb(var(--app-text))]">
        {title}
      </h1>
      {description ? (
        <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
