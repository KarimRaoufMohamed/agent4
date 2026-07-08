import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import CircularProgress from "./circle-progress";
import { currentUser } from "@clerk/nextjs/server";
import { WorkoutSessionsComponent } from "@/types/screens";

interface HistoryItem {
  SessionID: number;
  Title: string;
  Duration: number;
  Percentage: number;
  Image: string;
  Status: "completed" | "pending";
}

const WorkoutSessions: React.FC<WorkoutSessionsComponent> = async ({
  redirect_link,
  section_title,
}) => {
  const user = await currentUser();
  const response = await fetch(
    `${process.env.API_URL}/app/filter_table_by_user_email/WorkoutSessions/${user?.emailAddresses[0].emailAddress}`
  );

  const responseData = await response.json();

  if (!responseData.data || responseData.data.length === 0) {
    return <h2 className="text-lg font-semibold text-center">No data found</h2>;
  }

  return (
    <div className="w-full max-w-2xl mt-6 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{section_title}</h2>
        <Link href={`#`} className="text-blue-500 hover:underline">
          See all
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {responseData.data.map((item: HistoryItem) => (
          <Link
            key={item.SessionID}
            href={`${redirect_link}/${item.SessionID}`}
            className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <Image
              src={item.Image}
              alt={item.Title}
              width={80}
              height={80}
              className="rounded"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{item.Title}</p>
              <p className="text-xs text-gray-600">{item.Duration} Min</p>
            </div>
            {item.Status === "completed" ? (
              <span className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-500" size={24} />
              </span>
            ) : (
              <div className="relative">
                <CircularProgress percentage={item.Percentage} size="small" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowRight className="text-blue-500 text-lg" />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorkoutSessions;
