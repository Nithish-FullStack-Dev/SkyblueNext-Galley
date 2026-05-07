// app\api\users\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
    req: Request,
    {
        params,
    }: {
        params: {
            id: string;
        };
    }
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
                error:
                    "Failed to delete user",
            },
            {
                status: 500,
            }
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
  }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const {
      name,
      image,
    } = body;

    const updated =
      await prisma.user.update({
        where: {
          id: params.id,
        },

        data: {
          name,
          image,
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to update profile",
      },
      {
        status: 500,
      }
    );
  }
}