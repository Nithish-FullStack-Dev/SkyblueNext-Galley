// app/(dashboard)/settings/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        image: user.image || "",
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
