"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ScheduleCoachComponent } from "@/types/screens";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/format-date";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Loader from "./loader";

interface Session {
  AvailabilityID: number;
  Date: string;
}

const ScheduleSession: React.FC<ScheduleCoachComponent> = ({
  apis,
  table_name,
  title,
  redirect_link,
}) => {
  const [sessionTimes, setSessionTimes] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.publicMetadata.CoachID) {
      setIsLoading(false);
      return;
    }
    const fetchSessionData = async () => {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEXTJS_API_URL}${
          apis.get_sessions
        }?table_name=${table_name}&filters=[{"filterColumn":"CoachID","filterValue":"${
          user?.publicMetadata.CoachID
        }"}, {"filterColumn":"IsBooked","filterValue":false}, {"filterColumn":"Date__gte","filterValue":"${
          new Date().toISOString().split("T")[0]
        }"}]`
      );

      const responseData = await response.json();
      const availableSessions = responseData.availableSessions;

      if (availableSessions && Array.isArray(availableSessions)) {
        setSessionTimes(availableSessions);
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [apis.get_sessions, table_name, user?.publicMetadata.CoachID]);

  const handleScheduleSession = async () => {
    if (!selectedSession) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEXTJS_API_URL}${apis.schedule_session}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            availability_id: selectedSession.AvailabilityID,
            coach_id: user?.publicMetadata.CoachID,
            date: selectedSession.Date,
            user_email: user?.emailAddresses[0].emailAddress,
          }),
        }
      );
      if (response.ok) {
        toast.success("Session scheduled successfully.");
        router.push(redirect_link);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full md:max-w-lg">
      <h2 className="text-lg font-bold text-center">{title}</h2>
      <Card className="flex flex-col items-center p-4 sm:p-6 rounded-2xl shadow-lg w-full">
        {isLoading ? (
          <Loader wrapperClassName="min-h-12" />
        ) : (
          <>
            {sessionTimes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {sessionTimes.map((session: Session) => {
                  const formattedDate = formatDate(session.Date);
                  return (
                    <label
                      key={session.AvailabilityID}
                      className={`cursor-pointer flex items-center px-4 justify-center w-full py-2 sm:py-3 text-base sm:text-lg rounded-xl border transition-all ${
                        selectedSession?.Date === session.Date
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-primary border-primary"
                      }`}
                    >
                      <Input
                        type="radio"
                        name="sessionTime"
                        className="hidden"
                        checked={selectedSession?.Date === session.Date}
                        onChange={() => setSelectedSession(session)}
                      />
                      {formattedDate}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-text/60 text-sm sm:text-lg">
                No sessions available
              </p>
            )}

            <Button
              className={`my-4 w-full text-base sm:text-lg rounded-xl font-bold transition-all h-12 sm:h-14`}
              disabled={!selectedSession}
              onClick={handleScheduleSession}
            >
              Let’s Go!
            </Button>

            <Link href="/my-day" className="text-primary hover:underline">
              Continue
            </Link>
          </>
        )}
      </Card>
    </div>
  );
};

export default ScheduleSession;
