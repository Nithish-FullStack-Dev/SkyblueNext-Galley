import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

import { hasPermission } from "@/lib/has-permission";

export async function PATCH(
    req: NextRequest
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        if (
            !hasPermission(
                (session.user as any)?.role,
                "manage_users",
            )
        ) {
            return NextResponse.json(
                {
                    error: "Forbidden",
                },
                {
                    status: 403,
                },
            );
        }

        const body = await req.json();

        const {
            role,
            permissions,
        } = body;

        const users =
            await prisma.user.findMany({
                where: {
                    role,
                },
            });

        await Promise.all(
            users.map((user) =>
                prisma.user.update({
                    where: {
                        id: user.id,
                    },

                    data: {
                        permissions,
                    },
                }),
            ),
        );

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Failed to save permissions",
            },
            {
                status: 500,
            },
        );
    }
}