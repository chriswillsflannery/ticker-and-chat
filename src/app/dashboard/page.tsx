import DashboardUI from "./DashboardUI";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900 text-foreground">
      <main className="container mx-auto px-4 py-16 max-w-[960px]">
        <DashboardUI />
      </main>
    </div>
  );
}
