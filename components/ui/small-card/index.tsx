import { Progress } from "../progress";

export const SmallCard = ({
  icon,
  value,
  subtitle,
  progress,
  className,
}: {
  icon: React.ReactNode;
  value: string;
  subtitle: string;
  progress?: number;
  className?: string;
}) => (
  <div
    className={`flex flex-1 flex-col border-r last:border-none overflow-hidden ${className}`}
  >
    <span className="leading-none mb-2">{icon}</span>
    <span className="text-xl truncate text-foreground font-semibold leading-normal">
      {value}
    </span>
    {progress !== undefined ? (
      <Progress value={progress} className="mb-1 h-1.5 bg-white/10" />
    ) : (
      <span className="mb-3"></span>
    )}
    <span className="text-muted-foreground text-sm">{subtitle}</span>
  </div>
);
