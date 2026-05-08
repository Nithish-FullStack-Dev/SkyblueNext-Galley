// app/tracking/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TrackingClient from "./tracking-client";

export default async function TrackingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.flightOrder.findMany({
    where: {
      status: {
        not: "Draft",
      },
    },

    include: {
      vendor: true,

      creator: {
        select: {
          name: true,
        },
      },

      approver: {
        select: {
          name: true,
          role: true,
        },
      },

      rejector: {
        select: {
          name: true,
          role: true,
        },
      },

      items: {
        include: {
          vendor: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  return <TrackingClient orders={JSON.parse(JSON.stringify(orders))} />;
}
