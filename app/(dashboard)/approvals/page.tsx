// app/approvals/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ApprovalsClient from "./approvals-client";

export default async function ApprovalsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const pendingFlights = await prisma.flightOrder.findMany({
    where: {
      status: "Submitted",
    },
    include: {
      creator: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ApprovalsClient
      flights={JSON.parse(JSON.stringify(pendingFlights))}
      currentUser={session.user}
    />
  );
}
