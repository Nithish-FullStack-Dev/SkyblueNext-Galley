// app\api\flights\[id]\approval\route.ts
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

        const { action, rejectionReason } = body;

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

        let status = flight.status;

        // APPROVE
        if (action === "approve") {
            status = "Approved";
        }

        // REJECT
        if (action === "reject") {
            status = "Rejected";
        }

        // SEND BACK
        if (action === "draft") {
            status = "Draft";
        }

        const updatedFlight = await prisma.flightOrder.update({
            where: {
                id: params.id,
            },

            data: {
                status,

                approvedAt:
                    action === "approve"
                        ? new Date()
                        : null,

                rejectionReason:
                    action === "reject"
                        ? rejectionReason || null
                        : null,

                approvedBy:
                    action === "approve"
                        ? session.user.id
                        : null,

                rejectedBy:
                    action === "reject"
                        ? session.user.id
                        : null,

                rejectedAt:
                    action === "reject"
                        ? new Date()
                        : null,
            },
        });

        return NextResponse.json(updatedFlight);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to update approval" },
            { status: 500 }
        );
    }
}