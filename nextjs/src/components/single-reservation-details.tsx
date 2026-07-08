import Link from "next/link";
import { Button } from "./ui/button";

interface SingleReservationDetailsProps {
  MeetLink: string;
}

const SingleReservationDetails: React.FC<SingleReservationDetailsProps> = ({
  MeetLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mt-4">Reservation Details</h1>
      <p className="text-gray-600 mt-2">
        Start a consultation session using Google Meet.
      </p>

      <Link href={MeetLink} target="_blank" rel="noopener noreferrer">
        <Button className="mt-4">Start Google Meet</Button>
      </Link>
      <Link href="/cards/home">
        <Button variant="secondary" className="mt-2">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default SingleReservationDetails;
