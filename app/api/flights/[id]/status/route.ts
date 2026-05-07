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
        } = body;

        const flight = await prisma.flightOrder.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!flight) {
            return NextResponse.json(
                { error: "Flight not found" },
                { status: 404 }
            );
        }

        const updatedFlight =
            await prisma.flightOrder.update({
                where: {
                    id: params.id,
                },

                data: {
                    status,

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