import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const { status } = body;

        const user = await prisma.user.update({
            where: {
                id: params.id,
            },

            data: {
                status,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        );
    }
}