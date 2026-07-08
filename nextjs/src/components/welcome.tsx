import { WelcomeComponent } from "@/types/screens";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

const Welcome: React.FC<WelcomeComponent> = async ({ title ,redirect_link,api_url}) => {
  const user = await currentUser();
  
  const response = await fetch(`${process.env.API_URL}${api_url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: user?.emailAddresses[0].emailAddress }),
  });

  const responseData = await response.json();
  console.log(responseData);

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-sm sm:max-w-md">
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-green-600">{title}</h1>
      </div>
   
       <Link href={redirect_link}>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Go to Dashboard
        </button>
      </Link> 
    </div>
  );
};

export default Welcome;
