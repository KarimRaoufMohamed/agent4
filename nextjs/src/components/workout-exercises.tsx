import Image from "next/image";
import { Dumbbell, Timer, Weight } from "lucide-react";

interface WorkoutExerciseProps {
  data: {
    Name: string;
    Image: string;
    Duration: number;
    Weight: string;
    Repetitions: string;
    Sets: string;
    MuscleGroups?: string;
  }[];
}

const WorkoutExercises: React.FC<WorkoutExerciseProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {data?.map((item, index: number) => (
        <div
          key={index}
          className="p-12 bg-white-100 flex justify-center items-center"
        >
          <div className="bg-gray-100 p-8 rounded-2xl shadow-lg max-w-lg w-full">
            <h1 className="text-2xl font-bold mb-6 text-center">{item.Name}</h1>
            <div className="flex justify-center mb-6">
              <Image
                src={item.Image}
                alt={item.Name}
                width={250}
                height={250}
                className="rounded-lg"
              />
            </div>
            <p className="text-sm font-semibold mb-2">Exercise</p>
            <div className="bg-white p-6 rounded-lg mb-6 flex justify-around items-center">
              <div className="flex gap-4 items-center">
                <div>
                  <Weight className="text-3xl text-orange-500 bg-orange-100 rounded-full" />
                </div>
                <div>
                  <p className="text-xl font-bold">{item.Weight}kg</p>
                  <p className="text-xs">Weight</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div>
                  <Dumbbell className="text-3xl text-orange-500 bg-orange-100 rounded-full" />
                </div>
                <div>
                  <p className="text-xl font-bold">{item.Repetitions}</p>
                  <p className="text-xs">Reps</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div>
                  <Timer className="text-3xl text-orange-500 bg-orange-100 rounded-full" />
                </div>
                <div>
                  <p className="text-xl font-bold">{item.Sets}</p>
                  <p className="text-xs">Sets</p>
                </div>
              </div>
            </div>
            {item.MuscleGroups && (
              <div className="mb-6">
                <p className="text-sm font-semibold">Muscle Groups</p>
                <div className="flex justify-center gap-3 mt-3">
                  <span className="bg-blue-200 px-3 py-2 text-xs rounded-lg">
                    {item.MuscleGroups}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutExercises;
