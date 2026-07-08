import { Header } from "@/components/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="px-9">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
