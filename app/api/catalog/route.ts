// app\api\catalog\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust based on your prisma client location

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");

  const items = await prisma.catalogItem.findMany({
    where: {
      ...(type ? { type } : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (Array.isArray(body)) {
    const items = await prisma.catalogItem.createMany({
      data: body.map((item) => ({
        ...item,
        type: item.type?.toLowerCase()?.trim(),
        defaultQty: item.defaultQty
          ? parseInt(item.defaultQty)
          : null,
        price: Number(item.price) || 0,
        currency: item.currency || "INR",
        isAvailable:
          typeof item.isAvailable === "boolean"
            ? item.isAvailable
            : true,
      })),
    });
    return NextResponse.json(items);
  }
  const { id, ...data } = body;
  const item = await prisma.catalogItem.upsert({
    where: {
      id: id || "new-id",
    },
    update: {
      ...data,
      price: Number(data.price) || 0,
      currency: data.currency || "INR",
      isAvailable:
        typeof data.isAvailable === "boolean"
          ? data.isAvailable
          : true,
    },
    create: {
      ...data,
      price: Number(data.price) || 0,
      currency: data.currency || "INR",
      isAvailable:
        typeof data.isAvailable === "boolean"
          ? data.isAvailable
          : true,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.catalogItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}