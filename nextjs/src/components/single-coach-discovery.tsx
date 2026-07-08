import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

interface ISingleCoachDiscoveryProps {
  image: string;
  CoachName: string;
  CoachBio: string;
  Specialty: string;
  Rating: string;
  Availability: string;
  CoachID: string;
}

const SingleCoachDiscovery: React.FC<ISingleCoachDiscoveryProps> = ({
  Availability,
  CoachBio,
  CoachName,
  Rating,
  Specialty,
  image,
  CoachID,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="relative h-80">
        <Image
          src={image || "/default.jpg"}
          alt={CoachName}
          className="w-full h-full"
          width={500}
          height={500}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
          {CoachName}
        </h1>
      </div>

      <div className="p-8">
        <p className="text-lg text-gray-700 mb-6">{CoachBio}</p>

        <div className="space-y-4">
          <div className="flex items-center">
            <span className="text-xl text-purple-600 mr-3">🌟</span>
            <p className="text-gray-800">
              <span className="font-semibold">Specialty:</span> {Specialty}
            </p>
          </div>

          <div className="flex items-center">
            <span className="text-xl text-yellow-500 mr-3">⭐</span>
            <p className="text-gray-800">
              <span className="font-semibold">Rating:</span> {Rating}
            </p>
          </div>

          <div className="flex items-center">
            <span className="text-xl text-green-500 mr-3">📅</span>
            <p className="text-gray-800">
              <span className="font-semibold">Availability:</span>{" "}
              {Availability}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="mt-8 flex justify-end">
            <Link
              href={{
                pathname: "/form/reserve-consultation",
                query: { id: CoachID },
              }}
            >
              <Button variant="default" size="lg">
                Book a Session
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCoachDiscovery;
