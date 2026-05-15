// app/api/vendors/[id]/pdf/route.tsx

import { NextRequest, NextResponse } from "next/server";

import { pdf } from "@react-pdf/renderer";

import prisma from "@/lib/prisma";

import VendorPdfDocument from "@/components/vendor-pdf-document";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const flightId = searchParams.get("flightId");

    if (!flightId) {
      return NextResponse.json(
        {
          error: "Flight ID required",
        },
        {
          status: 400,
        },
      );
    }

    const order = await prisma.flightOrder.findUnique({
      where: {
        id: flightId,
      },

      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          error: "Vendor not found",
        },
        {
          status: 404,
        },
      );
    }

    const pdfBuffer = await pdf(
      <VendorPdfDocument
        order={order}
        vendorId={vendor.id}
        vendorName={vendor.name}
      />,
    ).toBuffer();

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": `attachment; filename="${vendor.name}-order.pdf"`,
      },
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
      },
      {
        status: 500,
      },
    );
  }
}
