// app\api\permissions\route.ts
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

import { hasPermission } from "@/lib/has-permission";
import { UserRole } from "@prisma/client";

export async function GET() {
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

        const roles: UserRole[] = [
            "admin",
            "director",
            "approver",
            "pilot",
            "crew",
        ];

        const permissionsData = await Promise.all(
            roles.map(async (role) => {
                const user = await prisma.user.findFirst({
                    where: {
                        role,
                    },

                    select: {
                        role: true,
                        permissions: true,
                    },
                });

                return {
                    role,
                    permissions:
                        user?.permissions || [],
                };
            }),
        );

        return NextResponse.json(
            permissionsData,
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Failed to fetch permissions",
            },
            {
                status: 500,
            },
        );
    }
}

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