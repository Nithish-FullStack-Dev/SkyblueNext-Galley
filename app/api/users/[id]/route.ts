// app\api\users\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      id: string;
    };
  },
) {
  try {
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete user",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
    };
  },
) {
  try {
    const body = await req.json();

    const { name, email, password, role, image } = body;

    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Email already exists",
        },
        {
          status: 400,
        },
      );
    }

    let hashedPassword;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: {
        id: params.id,
      },

      data: {
        name,
        email,
        role,
        image,

        ...(hashedPassword && {
          password: hashedPassword,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update user",
      },
      {
        status: 500,
      },
    );
  }
}
