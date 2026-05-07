import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import bcrypt from "bcryptjs";

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

        const { password } = body;

        if (!password || password.length < 6) {
            return NextResponse.json(
                {
                    error: "Password must be minimum 6 characters",
                },
                {
                    status: 400,
                }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: {
                id: params.id,
            },

            data: {
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to update password",
            },
            {
                status: 500,
            }
        );
    }
}