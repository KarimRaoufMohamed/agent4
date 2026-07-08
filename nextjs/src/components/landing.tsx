import Link from "next/link";
import { buttonVariants } from "./ui/button";

const Landing: React.FC = () => {
  return (
    <div className="mt-5">
      <Link href="/sign-in" className={buttonVariants()}>
        Sign In
      </Link>
    </div>
  );
};

export default Landing;
