import * as React from "react";

interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center h-full">{children}</div>
  );
};

export default AuthLayout;
