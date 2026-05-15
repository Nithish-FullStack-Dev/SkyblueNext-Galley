import { Metadata } from "next";
import ReportsClient from "./reports-client";

export const metadata: Metadata = {
  title: "Reports | Skyblue Galley",
  description: "View and download detailed reports for flights, inventory, and vendors.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
