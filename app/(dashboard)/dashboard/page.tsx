// app/(dashboard)/dashboard/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

import {
  Plane,
  Users,
  Utensils,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  IndianRupee,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [
    totalFlights,
    pendingApprovals,
    totalVendors,
    totalUsers,
    completedFlights,
    rejectedFlights,
    recentFlights,
    latestOrders,
  ] = await Promise.all([
    prisma.flightOrder.count(),

    prisma.flightOrder.count({
      where: {
        status: "Submitted",
      },
    }),

    prisma.vendor.count(),

    prisma.user.count(),

    prisma.flightOrder.count({
      where: {
        status: "Completed",
      },
    }),

    prisma.flightOrder.count({
      where: {
        status: "Rejected",
      },
    }),

    prisma.flightOrder.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        creator: {
          select: {
            name: true,
          },
        },

        items: {
          include: {
            vendor: true,
          },
        },
      },
    }),

    prisma.flightOrder.findMany({
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  const totalRevenue = await prisma.flightOrder.aggregate({
    _sum: {
      billAmount: true,
    },
  });

  const stats = [
    {
      title: "Active Flights",
      value: totalFlights,
      icon: Plane,
      trend: "up",
      change: `${completedFlights} completed`,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },

    {
      title: "Pending Approvals",
      value: pendingApprovals,
      icon: CheckSquare,
      trend: pendingApprovals > 0 ? "down" : "up",
      change:
        pendingApprovals > 0 ? `${pendingApprovals} waiting` : "All cleared",

      color: "text-orange-600",
      bg: "bg-orange-100",
    },

    {
      title: "Active Vendors",
      value: totalVendors,
      icon: Utensils,
      trend: "up",
      change: "Vendor network",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },

    {
      title: "Team Members",
      value: totalUsers,
      icon: Users,
      trend: "up",
      change: "System users",
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";

      case "Submitted":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "Approved":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Welcome back, {session.user?.name}
          </h1>

          <p className="text-slate-500 mt-2 text-base">
            Monitor flights, vendors, approvals, and catering operations.
          </p>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="
              rounded-3xl
              border-none
              shadow-sm
              hover:shadow-xl
              transition-all
              duration-300
              overflow-hidden
              group
            "
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    {stat.title}
                  </p>

                  <h2 className="text-4xl font-black text-slate-900 mt-3">
                    {stat.value}
                  </h2>

                  <div className="flex items-center mt-4">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}

                    <span className="text-sm font-semibold text-slate-500">
                      {stat.change}
                    </span>
                  </div>
                </div>

                <div
                  className={`
                    w-14
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    ${stat.bg}
                    ${stat.color}
                    group-hover:scale-110
                    transition-transform
                  `}
                >
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* RECENT FLIGHTS */}

        <Card className="xl:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-2xl">Recent Flight Orders</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentFlights.map((flight) => {
                const vendorNames = [
                  ...new Set(
                    flight.items
                      .map((item) => item.vendor?.name || item.vendorName)
                      .filter(Boolean),
                  ),
                ];

                return (
                  <div
                    key={flight.id}
                    className="
                      p-6
                      hover:bg-slate-50/70
                      transition-colors
                    "
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="flex items-start gap-5">
                        <div
                          className="
                            w-14
                            h-14
                            rounded-2xl
                            bg-blue-100
                            text-blue-600
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >
                          <Plane className="w-7 h-7" />
                        </div>

                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-black text-slate-900">
                              {flight.flightNumber}
                            </h3>

                            <Badge className={getStatusColor(flight.status)}>
                              {flight.status}
                            </Badge>
                          </div>

                          <p className="text-slate-500 mt-2">
                            {flight.departure} → {flight.arrival}
                          </p>

                          <div className="flex flex-wrap items-center gap-6 mt-4">
                            <div>
                              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                Vendor
                              </p>

                              <p className="text-sm font-semibold text-slate-900 mt-1">
                                {vendorNames.length > 0
                                  ? vendorNames.join(", ")
                                  : "Not Assigned"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                Items
                              </p>

                              <p className="text-sm font-semibold text-slate-900 mt-1">
                                {flight.items.length}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                Created By
                              </p>

                              <p className="text-sm font-semibold text-slate-900 mt-1">
                                {flight.creator?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                          Flight Date
                        </p>

                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {new Date(flight.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}

        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-2xl">System Activity</CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {latestOrders.map((order) => (
              <div key={order.id} className="flex gap-4">
                <div
                  className="
                    w-10
                    h-10
                    rounded-2xl
                    bg-blue-100
                    text-blue-600
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Clock3 className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    Flight {order.flightNumber}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Status changed to{" "}
                    <span className="font-semibold">{order.status}</span>
                  </p>

                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mt-2">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
