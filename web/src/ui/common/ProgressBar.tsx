const PROGRESS_COLORS: [number, string][] = [
  [0, "#F00"],
  [0.33, "#F90"],
  [0.66, "#FF0"],
  [0.99, "#9F0"],
  [1, "#0F0"],
];

export default function ProgressBar({
  value,
  max,
  size = "sm",
}: {
  value: number;
  max: number;
  size?: "sm" | "md";
}) {
  const pct = max > 0 ? value / max : 0;
  const barColor = "bg-gold";
  const height = size === "md" ? "h-2.5" : "h-1.5";
  const progress = Math.min(pct * 100, 100);
  const color = PROGRESS_COLORS.find(([threshold, color]) => {
    console.log(threshold >= progress / 100);
    return threshold >= progress / 100 ? color : null;
  })?.[1];
  console.log(PROGRESS_COLORS);
  return (
    <span
      className={`flex ${height} rounded-full overflow-hidden w-full bg-black/70`}
    >
      <span
        className={`block ${height} rounded-full transition-all ${barColor} `}
        style={{
          width: `${Math.min(pct * 100, 100)}%`,
          backgroundColor: color,
        }}
      />
    </span>
  );
}
