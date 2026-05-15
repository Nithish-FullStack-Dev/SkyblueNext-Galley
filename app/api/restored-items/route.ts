// app/api/restored-items/route.ts

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const flightOrderId = searchParams.get("flightOrderId");

    const itemId = searchParams.get("itemId");

    const restoredItems = await prisma.restoredItem.findMany({
      where: {
        ...(flightOrderId && {
          flightOrderId,
        }),

        ...(itemId && {
          itemId,
        }),
      },

      include: {
        flightOrder: {
          select: {
            id: true,
            flightNumber: true,
            departure: true,
            arrival: true,
            date: true,
            status: true,
          },
        },
      },

      orderBy: {
        restoredAt: "desc",
      },
    });

    return NextResponse.json(restoredItems);
  } catch (error) {
    console.error("GET RESTORED ITEMS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch restored items",
      },
      {
        status: 500,
      },
    );
  }
}
