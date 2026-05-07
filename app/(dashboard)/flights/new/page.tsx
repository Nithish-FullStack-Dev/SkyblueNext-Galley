// app\flights\new\page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import FlightOrderForm from "@/components/flight-order-form";

export default async function NewFlightPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
      <FlightOrderForm />
  );
}
