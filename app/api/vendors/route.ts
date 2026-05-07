// app\api\vendors\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: { menuItems: true, orders: true }
        }
      }
    });
    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error("GET VENDORS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch vendors",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        contactPerson: body.contactPerson || "",
        phone: body.phone || "",
        email: body.email,
        address: body.address || "",

        // ✅ SAFE ARRAYS
        serviceAirports: Array.isArray(body.serviceAirports)
          ? body.serviceAirports
          : [],
        deliveryOptions: Array.isArray(body.deliveryOptions)
          ? body.deliveryOptions
          : [],

        currency: body.currency || "INR",
        notes: body.notes || "",
        taxNotes: body.taxNotes || "",
      },
    });

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create vendor",
        details: error.message, // 🔥 shows real issue
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const updatedVendor = await prisma.vendor.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        contactPerson: body.contactPerson || "",
        phone: body.phone || "",
        email: body.email,
        address: body.address || "",

        serviceAirports: Array.isArray(body.serviceAirports)
          ? body.serviceAirports
          : [],

        deliveryOptions: Array.isArray(body.deliveryOptions)
          ? body.deliveryOptions
          : [],

        currency: body.currency || "INR",
        notes: body.notes || "",
        taxNotes: body.taxNotes || "",
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error: any) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update vendor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Vendor ID required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // REMOVE vendor references from order items

      await tx.orderItem.updateMany({
        where: {
          vendorId: id,
        },
        data: {
          vendorId: null,
        },
      });

      // REMOVE vendor references from flights

      await tx.flightOrder.updateMany({
        where: {
          vendorId: id,
        },
        data: {
          vendorId: null,
        },
      });

      // DELETE vendor menu items

      await tx.vendorMenuItem.deleteMany({
        where: {
          vendorId: id,
        },
      });

      // DELETE vendor

      await tx.vendor.delete({
        where: {
          id,
        },
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete vendor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}