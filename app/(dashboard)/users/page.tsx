// app/users/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import UsersClient from "./users-client";

// import UsersClient from "./users-client";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <UsersClient users={users} />
    </div>
  );
}
