// app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

import { hasPermission } from "@/lib/has-permission";
export async function POST(
    req: NextRequest
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (
            !hasPermission(
                session.user.role,
                "manage_users"
            )
        ) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }
        const body =
            await req.json();

        const {
            name,
            email,
            password,
            role,
            status,
        } = body;

        const existing =
            await prisma.user.findUnique({
                where: {
                    email,
                },
            });

        if (existing) {
            return NextResponse.json(
                {
                    error:
                        "User already exists",
                },
                {
                    status: 400,
                }
            );
        }

        const hashed =
            await bcrypt.hash(
                password,
                10
            );

        const user =
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashed,
                    role,
                    status,
                },
            });

        return NextResponse.json(
            user
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Failed to create user",
            },
            {
                status: 500,
            }
        );
    }
}