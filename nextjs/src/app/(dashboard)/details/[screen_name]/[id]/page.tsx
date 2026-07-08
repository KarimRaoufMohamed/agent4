import Loading from "@/components/loader";
import screensJSON from "../../../../../../screens.json";
import dynamic from "next/dynamic";
import { DetailsScreen, ScreensJSON } from "@/types/screens";
import { currentUser } from "@clerk/nextjs/server";
import { JSX } from "react";

interface IDetailsPageProps {
  params: Promise<{
    screen_name: string;
    id: string;
  }>;
}

const DetailsPage: React.FC<IDetailsPageProps> = async ({ params }) => {
  const { screen_name, id } = await params;
  const user = await currentUser();
  const screen = (screensJSON as ScreensJSON).screens.find(
    (s): s is DetailsScreen => s.screen_name === screen_name
  );

  if (!screen) {
    return <p className="text-red-500">Details screen configuration not found</p>;
  }

  let data: JSX.IntrinsicAttributes;
  let errorMessage = "";

  try {
    const apiUrl = screen.params
      ? `${process.env.API_URL}${screen.api_url}${screen.table_name}?${screen.params
          .map(
            (param) =>
              `${param.param_column}=${
                param.param_value === "id" ? id : param.param_value
              }`
          )
          .join("&")}&user_email=${user?.emailAddresses[0].emailAddress}`
      : `${process.env.API_URL}${screen.api_url}${screen.table_name}/${id}`;

    const response = await fetch(apiUrl);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "An error occurred while fetching data.");
    }

    data = responseData.data ? responseData.data[0] : responseData;

    if (!data) {
      return <p className="text-red-500 text-bold text-center text-xl">Data not found.</p>;
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred.";
    }
  }

  if (errorMessage) {
    return <p className="text-red-500 text-bold text-center text-xl">{errorMessage}</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{screen.screen_title}</h1>
      <div className="flex flex-col gap-5">
        {screen.components?.map((component) => {
          const DynamicComponent = dynamic(
            () => import(`@/components/${component.file_name}`),
            { loading: () => <Loading /> }
          );

          return (
            <DynamicComponent
              key={component.file_name}
              {...data}
              {...component}
            />
          );
        })}
      </div>
    </>
  );
};

export default DetailsPage;