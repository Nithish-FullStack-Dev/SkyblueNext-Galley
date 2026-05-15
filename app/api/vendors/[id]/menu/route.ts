// app\api\vendors\[id]\menu\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const items = await prisma.vendorMenuItem.findMany({
    where: {
      vendorId: params.id,
    },
    orderBy: {
      category: "asc",
    },
  });
  return NextResponse.json(items);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updatedItem = await prisma.vendorMenuItem.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        description: body.description || "",
        price: Number(body.price) || 0,
        category: body.category || "",
        isAvailable:
          typeof body.isAvailable === "boolean"
            ? body.isAvailable
            : true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PATCH MENU ITEM ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update menu item",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const vendorId = params.id;

    if (Array.isArray(body)) {
      const vendor = await prisma.vendor.findUnique({
        where: {
          id: vendorId,
        },
      });

      if (!vendor) {
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 }
        );
      }

      const validItems = body
        .filter((item: any) => item.name && item.name.trim() !== "")
        .map((item: any) => ({
          name: item.name,

          category: item.category || "Uncategorized",

          description: item.description || "",

          price: parseFloat(item.price) || 0,

          currency: item.currency || vendor.currency || "INR",

          dietaryTags: item.dietaryTags
            ? item.dietaryTags.split(",").map((t: string) => t.trim())
            : [],

          allergens: item.allergens
            ? item.allergens.split(",").map((a: string) => a.trim())
            : [],

          isAvailable: true,

          vendorId: vendorId,
        }));

      if (validItems.length === 0) return NextResponse.json({ error: "No valid items" }, { status: 400 });

      const results = await prisma.vendorMenuItem.createMany({
        data: validItems,
        skipDuplicates: true,
      });
      return NextResponse.json(results);
    } else {
      const item = await prisma.vendorMenuItem.create({
        data: { ...body, vendorId },
      });
      return NextResponse.json(item);
    }
  } catch (error) {
    return NextResponse.json({ error: "Save Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.vendorMenuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}