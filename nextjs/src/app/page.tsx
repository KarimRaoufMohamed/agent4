import dynamic from "next/dynamic";
import screensJSON from "../../screens.json";
import Loader from "@/components/loader";
import {  ScreenHeader, ScreensJSON } from "@/types/screens";

const Page: React.FC = async () => {
  // const screen: Screen | undefined = (screensJSON as ScreensJSON).screens.find(
  //   (screen) => screen.screen_name === ""
  // );
 const screen = (screensJSON as ScreensJSON).screens.find(
    (screen) => screen.screen_name === "welcome" // or some default name
  ) ?? (screensJSON as ScreensJSON).screens[0]; // fallback to first screen
  if (!screen) {
    throw new Error("Screen configuration not found");
  }

  // Dynamically import the screen header if it exists
  const DynamicScreenHeader = screen.screen_header
    ? (dynamic(
        () => import(`@/components/${screen.screen_header?.file_name}`),
        {
          loading: () => <Loader />,
        }
      ) as React.ComponentType<ScreenHeader>)
    : null;

  return (
    <>
      {screen.screen_header && DynamicScreenHeader && (
        <DynamicScreenHeader {...screen.screen_header} />
      )}
      <div className="flex flex-col items-center gap-5 mb-5">
        {screen.components?.map((component) => {
          const DynamicComponent = dynamic(
            () => import(`@/components/${component.file_name}`),
            { loading: () => <Loader /> }
          );

          return <DynamicComponent key={component.file_name} {...component} />;
        })}
      </div>
    </>
  );
};

export default Page;
