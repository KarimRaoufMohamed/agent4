import { Metric } from "@/types/screens";

export default function CircularProgress({
  label = "",
  value = 0,
  unit = "",
  percentage = 0,
  size = "medium",
}: Metric) {
  const radius = size === "small" ? 30 : size === "large" ? 38 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${
          size === "small"
            ? "w-[60px] h-[60px]"
            : size === "large"
            ? "w-[120px] h-[120px]"
            : "w-[100px] h-[100px]"
        }`}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            // stroke="#e5e7eb"
            strokeWidth="12"
            className="stroke-[#FFFFFF40]"
          />
          {/* Progress Circle with Blur */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="url(#progress-gradient)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter="url(#blur-filter)"
          />
          <defs>
            <linearGradient
              id="progress-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="hsl(var(--linear))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
            <filter
              id="blur-filter"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        {/* Centered Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-text">
          <span className="text-lg font-semibold">{label}</span>
          {size === "large"?
            <div className=" text-xl font-bold">
              {value}
              <span className="text-lg"> {unit}</span>
            </div>
          :
          <div className=" text-base font-bold">
            {value}
            <span className="text-sm"> {unit}</span>
          </div>
          }
        </div>
      </div>
    </div>
  );
}
