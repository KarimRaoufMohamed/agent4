import Loader from "@/components/loader";
import screensJSON from "../../../../screens.json";
import dynamic from "next/dynamic";
import { Screen, ScreensJSON } from "@/types/screens";

interface IStandalonePageProps {
  params: Promise<{ screen_name: string }>;
}

const StandalonePage: React.FC<IStandalonePageProps> = async ({ params }) => {
  const screen_name = (await params).screen_name;

  const screen: Screen | undefined = (screensJSON as ScreensJSON).screens.find(
    (screen) => screen.screen_name === screen_name
  );

  if (!screen) {
    throw new Error("Screen configuration not found");
  }

  return (
    <div className="flex flex-col items-center p-4 h-full">
      {screen.screen_title && (
        <h1 className="text-2xl font-bold mb-4">{screen.screen_title}</h1>
      )}
      <div className="flex flex-col items-center gap-5 w-full flex-1">
        {screen.components?.map((component) => {
          const DynamicComponent = dynamic(
            () => import(`@/components/${component.file_name}`),
            { loading: () => <Loader /> }
          );

          return <DynamicComponent key={component.file_name} {...component} />;
        })}
      </div>
    </div>
  );
};

export default StandalonePage;
