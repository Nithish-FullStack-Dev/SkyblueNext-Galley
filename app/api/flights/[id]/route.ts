// app\api\flights\[id]\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const flight = await prisma.flightOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        creator: { select: { name: true, email: true } },
        vendor: true,
      },
    });
    if (!flight) return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    return NextResponse.json(flight);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch flight" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const {
      items,
      id,
      createdAt,
      updatedAt,
      creator,
      vendor,
      ...flightData
    } = body;

    // DELETE OLD ITEMS
    await prisma.orderItem.deleteMany({
      where: {
        orderId: params.id,
      },
    });

    // UPDATE FLIGHT
    const updatedFlight = await prisma.flightOrder.update({
      where: {
        id: params.id,
      },

      data: {
        ...flightData,

        paxCount: Number(flightData.paxCount),

        crewCount: Number(flightData.crewCount),

        date: flightData.date
          ? new Date(flightData.date)
          : undefined,

        items: {
          create: Array.isArray(items)
            ? items.map((item: any) => ({
              itemId: item.itemId || "custom",

              vendorId: item.vendorId || null,

              vendorName:
                item.vendorName ||
                item.vendor?.name ||
                null,

              name: item.name || "Custom Item",

              type: item.type || "custom",

              quantity: Number(item.quantity) || 1,

              notes: item.notes || "",

              unit: item.unit || "",

              price: Number(item.price) || 0,

              currency: item.currency || "INR",

              category: item.category || "",

              dietaryTags: Array.isArray(item.dietaryTags)
                ? item.dietaryTags
                : [],
            }))
            : [],
        },
      },

      include: {
        items: {
          include: {
            vendor: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFlight);

  } catch (error) {
    console.error("Failed to update flight:", error);

    return NextResponse.json(
      { error: "Failed to update flight" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Note: orderId on OrderItem has onDelete: Cascade in your schema, 
    // so this will automatically clean up the items.
    await prisma.flightOrder.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete flight:", error);
    return NextResponse.json({ error: "Failed to delete flight" }, { status: 500 });
  }
}