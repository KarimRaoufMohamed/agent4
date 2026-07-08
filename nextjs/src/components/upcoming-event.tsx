import { EventCardComponent } from "@/types/screens";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar } from "lucide-react";

const EventCard: React.FC<EventCardComponent> = async ({ section_title }) => {
  const user = await currentUser();
  const response = await fetch(
    `${process.env.API_URL}/app/get_nearest_upcoming_event/${user?.emailAddresses[0].emailAddress}`
  );

  const responseData = await response.json();

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-xl font-bold text-center sm:text-left">
        {section_title}
      </h2>
      {!responseData || !responseData.event ? (
        <h2 className="text-lg font-semibold text-center">No data found</h2>
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch border border-gray-300 rounded-xl overflow-hidden shadow-lg w-full transition-transform hover:scale-105">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-6 text-center w-full sm:w-32 flex flex-col items-center gap-3">
            <Calendar />
            <span className="text-xs sm:text-sm uppercase tracking-wide font-medium">
              {responseData.event.Date}
            </span>
          </div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-1 text-gray-900">
            <span className="font-bold text-lg">
              {responseData.event.Title}
            </span>
            <span className="text-sm">{responseData.event.Description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
