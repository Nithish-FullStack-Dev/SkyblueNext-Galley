// app/api/flights/[id]/restore/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        const body = await req.json();

        const { items } = body;

        const flight = await prisma.flightOrder.findUnique({
            where: {
                id: params.id,
            },

            include: {
                items: true,
            },
        });

        if (!flight) {
            return NextResponse.json(
                {
                    error: "Flight not found",
                },
                {
                    status: 404,
                },
            );
        }

        // RESTORE STOCKS
        for (const restoredItem of items) {
            if (!restoredItem.returnedQty) continue;

            const orderItem = flight.items.find(
                (i) => i.id === restoredItem.id,
            );

            if (!orderItem) continue;

            // GLOBAL ITEM STOCK RESTORE
            if (
                orderItem.itemId &&
                orderItem.itemId !== "custom"
            ) {
                await prisma.catalogItem.update({
                    where: {
                        id: orderItem.itemId,
                    },

                    data: {
                        stock:
                        {
                            increment: Number(
                                restoredItem.returnedQty,
                            ),
                        },
                    },
                });
            }

            // SAVE RESTORE HISTORY
            await prisma.restoredItem.create({
                data: {
                    flightOrderId: flight.id,

                    itemId: orderItem.id,

                    returnedQty: Number(
                        restoredItem.returnedQty,
                    ),

                    restoredBy: session.user.name || "Unknown",
                },
            });
        }

        // AUTO COMPLETE ORDER
        await prisma.flightOrder.update({
            where: {
                id: params.id,
            },

            data: {
                status: "Completed",
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("RESTORE ERROR:", error);

        return NextResponse.json(
            {
                error: "Failed to restore items",
            },
            {
                status: 500,
            },
        );
    }
}