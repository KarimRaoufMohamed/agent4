"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { UserInformationComponent } from "@/types/screens";
import { useUser } from "@clerk/nextjs";
import Loader from "./loader";
import Title from "./title";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CircleCheck } from "lucide-react";

const UserInformation: React.FC<UserInformationComponent> = ({
  title,
  choices,
  redirect_link,
  apis,
  method,
  table_name,
  image,
}) => {
  const router = useRouter();

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as Record<string, string>;
      const { AgeGroup, Gender, ...rest } = metadata;
      setSelectedGender(Gender || null);
      setSelectedAgeGroup(AgeGroup || null);
      if (choices.inputs) {
        const formValuesToSet: { [key: string]: string } = {};
        choices.inputs.forEach((field) => {
          if (rest[field.input.name]) {
            formValuesToSet[field.input.name] = rest[field.input.name];
          }
        });

        setFormValues(formValuesToSet);
      }
    }
  }, [choices.inputs, isLoaded, user]);

  const handleSubmit = async () => {
    if (
      !selectedGender ||
      !selectedAgeGroup ||
      Object.values(formValues).some((value) => !value)
    )
      return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEXTJS_API_URL}${apis.update_user_info}`,
        {
          method: method,
          body: JSON.stringify({
            table_name: table_name,
            Gender: selectedGender,
            AgeGroup: selectedAgeGroup,
            ...formValues,
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

  const isButtonDisabled =
    !selectedGender ||
    !selectedAgeGroup ||
    (choices.inputs &&
      Object.keys(formValues).length !== choices.inputs.length) ||
    Object.values(formValues).some((value) => value.trim() === "");

  return (
    <div className="relative flex flex-col items-center max-w-lg gap-6 min-h-screen w-full py-10 px-5">
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Image
          src={image}
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          priority
          quality={100}
        />
      </div>
      <Title className="relative text-center">
        {title}
        <span className="absolute -z-10 inset-0 w-64 h-14 bg-primary rounded-full blur-3xl opacity-50" />
      </Title>
      {isLoading ? (
        <Loader wrapperClassName="h-[600px] w-full" />
      ) : (
        <div className="flex flex-col w-full gap-8">
          <div className="flex flex-col gap-3">
            <p>What&apos;s Your Gender :</p>
            <div className="flex flex-col gap-3">
              {choices?.gender?.map((option) => (
                <label
                  key={option}
                  className={`flex justify-between cursor-pointer py-2 px-5 w-full rounded-lg text-lg transition border  ${
                    selectedGender === option
                      ? "text-primary border-primary bg-primary-200"
                      : "border-muted"
                  }`}
                >
                  <Input
                    type="radio"
                    name="gender"
                    className={`hidden`}
                    checked={selectedGender === option}
                    onChange={() => setSelectedGender(option)}
                  />
                  {option}
                  {selectedGender === option && <CircleCheck />}
                </label>
              ))}
            </div>
          </div>

          {choices.inputs && (
            <div className="flex flex-col gap-8">
              {choices?.inputs?.map((field) => (
                <div className="flex flex-col gap-3" key={field.input.name}>
                  <label>{field.label}</label>
                  <div className="relative">
                    <Input
                      type={field.input.type}
                      className="px-6 h-12"
                      value={formValues[field.input.name] || ""}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [field.input.name]: e.target.value,
                        })
                      }
                    />
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[18px] text-text opacity-50">
                      {field.input.placeholder}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p>Select Your Age :</p>
            <div className="flex flex-col gap-3">
              {choices?.ageGroup?.map((age) => (
                <label
                  key={age}
                  className={`flex justify-between cursor-pointer py-2 px-5 w-full rounded-lg text-lg transition border  ${
                    selectedAgeGroup === age
                      ? "text-primary border-primary bg-primary-200"
                      : "border-muted"
                  }`}
                >
                  <Input
                    type="radio"
                    name="ageGroup"
                    className={`hidden`}
                    checked={selectedAgeGroup === age}
                    onChange={() => setSelectedAgeGroup(age)}
                  />
                  {age}
                  {selectedAgeGroup === age && <CircleCheck />}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className={`px-8 py-4 h-14`}
              disabled={isButtonDisabled}
              onClick={handleSubmit}
            >
              Confirm
            </Button>
            <Link
              href={"/my-day"}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "px-8 py-4 h-14 text-primary"
              )}
            >
              Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInformation;
