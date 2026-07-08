"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";
import HeaderIcon from "../../public/header-icon.svg";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { Header as HeaderType } from "@/types/screens";

const Header: React.FC<HeaderType> = ({ back_btn_href, title }) => {
  const { isLoaded, user } = useUser();
  return (
    <div className="flex justify-between items-center mb-3 w-full mx-auto md:max-w-lg">
      {back_btn_href && (
        <Link href={back_btn_href}>
          <ChevronLeftIcon className="size-7" />
        </Link>
      )}
      {title ? (
        <h2 className="text-xl font-bold">{title}</h2>
      ) : (
        <div className="flex gap-2 items-center">
          Good Morning{" "}
          {isLoaded && user ? (
            `${user.firstName}`
          ) : (
            <Skeleton className="w-16 h-4" />
          )}
          <Image src={HeaderIcon} alt="Header Icon" />
        </div>
      )}
      {isLoaded ? (
        <UserButton appearance={{ elements: { avatarBox: "size-10" } }} />
      ) : (
        <Skeleton className="size-10 rounded-full" />
      )}
    </div>
  );
};

export default Header;
