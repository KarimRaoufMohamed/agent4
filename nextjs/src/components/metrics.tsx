import { MetricsComponent } from "@/types/screens";
import CircularProgress from "./circle-progress";

export default function Metrics({ metrics, section_title }: MetricsComponent) {
  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8">
      <h2 className="text-xl font-bold m-4 text-center">{section_title}</h2>
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {metrics.map((metric, index) => {
          return (
            <div key={index} className="flex justify-center w-full sm:w-auto">
              <CircularProgress
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                percentage={metric.percentage}
                size={metric.size || "large"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
