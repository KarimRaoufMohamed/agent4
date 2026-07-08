import Image from "next/image";
import { Button } from "./ui/button";
import { CoachCardComponent, CoachAction } from "@/types/screens";

interface CoachProps extends CoachCardComponent {
  actions?: CoachAction[];
}

const CoachCard: React.FC<CoachProps> = ({
  name,
  imageUrl,
  title,
  actions = [],
}) => {
  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <h2 className="text-xl font-bold text-center">{title}</h2>
      <div className="flex flex-col md:flex-row gap-4 bg-white shadow-lg rounded-xl p-6 w-full md:w-[400px] items-center">
        <Image
          src={imageUrl}
          alt={name}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-gray-300"
          width={160}
          height={160}
        />
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex flex-col w-full">
            {actions.map((action, index) => (
              <Button
                key={index}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-2 w-full md:min-w-[150px] hover:bg-blue-600 transition-all"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
