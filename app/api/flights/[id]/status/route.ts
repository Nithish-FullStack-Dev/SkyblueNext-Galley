// app/api/flights/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            status,
            billAmount,
            billNotes,
            billUrl,
            rejectionReason,
            cancelReason,
        } = body;

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
                { error: "Flight not found" },
                { status: 404 }
            );
        }
        // AUTO RESTORE STOCK ON REJECT/CANCEL
        if (
            ["Rejected", "Cancelled"].includes(status) &&
            !["Rejected", "Cancelled"].includes(
                flight.status,
            )
        ) {



            for (const item of flight.items) {

                // ONLY GLOBAL ITEMS
                if (
                    item.itemId &&
                    item.itemId !== "custom"
                ) {

                    await prisma.catalogItem.update({
                        where: {
                            id: item.itemId,
                        },

                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            }
        }
        const updatedFlight =
            await prisma.flightOrder.update({
                where: {
                    id: params.id,
                },

                data: {
                    status,

                    rejectionReason:
                        status === "Rejected"
                            ? rejectionReason
                            : flight.rejectionReason,

                    rejectedAt:
                        status === "Rejected"
                            ? new Date()
                            : flight.rejectedAt,

                    cancelReason:
                        status === "Cancelled"
                            ? cancelReason
                            : flight.cancelReason,

                    cancelledAt:
                        status === "Cancelled"
                            ? new Date()
                            : flight.cancelledAt,
                    rejectedBy:
                        status === "Cancelled"
                            ? session.user.id
                            : flight.rejectedBy,
                    billAmount:
                        billAmount !== undefined
                            ? Number(billAmount)
                            : flight.billAmount,

                    billNotes:
                        billNotes !== undefined
                            ? billNotes
                            : flight.billNotes,

                    billUrl:
                        billUrl !== undefined
                            ? billUrl
                            : flight.billUrl,
                },
            });

        return NextResponse.json(updatedFlight);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to update status",
            },
            {
                status: 500,
            }
        );
    }
}