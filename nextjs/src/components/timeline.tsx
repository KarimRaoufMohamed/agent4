import { TimelineComponent, TimelineEvent } from "@/types/screens";
import { currentUser } from "@clerk/nextjs/server";
import { CheckCircle, Clock, Calendar } from "lucide-react";

const Timeline: React.FC<TimelineComponent> = async ({
  filter_by_user_email,
}) => {
  let responseData: { data: TimelineEvent[] };
  if (filter_by_user_email) {
    const user = await currentUser();
    const response = await fetch(
      `${process.env.API_URL}/app/filter_table_by_user_email/Timeline/${user?.emailAddresses[0].emailAddress}`
    );

    responseData = await response.json();
  } else {
    const response = await fetch(
      `${process.env.API_URL}/app/list_data/Timeline`
    );
    responseData = await response.json();
  }

  if (!responseData.data || responseData.data.length === 0) {
    return <h2 className="text-lg font-semibold text-center">No data found</h2>;
  }
  return (
    <div className="flex flex-col items-start w-full max-w-3xl mx-auto">
      {responseData.data.map((event, index) => (
        <div className="flex gap-6 w-full" key={index}>
          <p className="text-gray-600 w-24 mt-3 text-right">{event.Date}</p>
          <div className="flex flex-col items-center">
            {getStatusIcon(event.Status)}
            {index !== responseData.data.length - 1 && (
              <div className="w-0.5 h-16 bg-border" />
            )}
          </div>
          <div className="flex-1 mt-2">
            <p className="font-semibold text-lg">{event.Title}</p>
            <p className="text-sm text-gray-500">{event.Description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <span className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="text-green-500" size={40} />
        </span>
      );
    case "upcoming":
      return (
        <span className="bg-yellow-100 p-3 rounded-full">
          <Calendar className="text-yellow-500" size={40} />
        </span>
      );
    case "pending":
      return (
        <span className="bg-gray-100 p-3 rounded-full">
          <Clock className="text-gray-500" size={40} />
        </span>
      );
    default:
      return null;
  }
};

export default Timeline;
