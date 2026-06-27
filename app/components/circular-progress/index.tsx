interface Props {
  size: number;
  total: number;
  current: number;
  className?: string;
  strokeWidth?: number;
}

export const CircularProgress = (props: Props) => {
  const { size, total, current, className, strokeWidth = 6 } = props;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (current / total) * circumference;
  const halfSize = size / 2;

  const commonParams = {
    cx: halfSize,
    cy: halfSize,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      <circle {...commonParams} stroke="#ffffff" />
      <circle
        {...commonParams}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        transform={`rotate(-90 ${halfSize} ${halfSize})`}
        strokeLinecap="round"
      />
    </svg>
  );
};
