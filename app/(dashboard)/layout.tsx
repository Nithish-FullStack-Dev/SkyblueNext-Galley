import DashboardLayout from "@/components/dashboard-layout";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
