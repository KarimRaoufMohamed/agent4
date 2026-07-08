"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { MultiSelectComponent } from "@/types/screens";

const MultiSelect: React.FC<MultiSelectComponent> = ({
  subtitle,
  title,
  choices,
  redirect_link,
}) => {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEXTJS_API_URL}/api/update_user_info`,
        {
          method: "POST",
          body: JSON.stringify({
            table_name: "Users",
            ["FitnessGoals"]: selectedChoices,
          }),
        }
      );
      if (response.ok) {
        router.push(redirect_link);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const toggleChoicesSelection = (choice: string) => {
    setSelectedChoices((prev) =>
      prev.includes(choice)
        ? prev.filter((c) => c !== choice)
        : [...prev, choice]
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center flex-col gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600 text-lg">{subtitle}</p>
      </div>
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <Loader className="animate-spin size-12" />
          </div>
        ) : (
          <>
            {choices.length > 0 ? (
              choices.map((choice) => (
                <label
                  key={choice}
                  className={`cursor-pointer flex items-center px-6 py-4 text-lg rounded-xl border transition-all mb-4 w-full ${
                    selectedChoices.includes(choice)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-blue-600 border-blue-400 hover:bg-blue-100"
                  }`}
                >
                  <Input
                    type="checkbox"
                    className="w-5 h-5 mr-4 rounded border-blue-400 focus:ring-blue-500"
                    checked={selectedChoices.includes(choice)}
                    onChange={() => toggleChoicesSelection(choice)}
                  />
                  {choice}
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-lg">No choices available</p>
            )}

            <Button
              className={`mt-6 px-8 py-4 text-lg rounded-xl w-full font-bold transition-all h-14 ${
                selectedChoices.length > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={selectedChoices.length === 0}
              onClick={handleSaveChoices}
            >
              Let’s Go!
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
