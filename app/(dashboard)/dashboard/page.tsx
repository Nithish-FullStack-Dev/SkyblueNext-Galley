import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Utensils, Users, CheckSquare, ArrowUpRight, ArrowDownRight } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch some stats
  const flightCount = await prisma.flightOrder.count();
  const pendingApprovals = await prisma.flightOrder.count({ where: { status: "Submitted" } });
  const vendorCount = await prisma.vendor.count();
  const userCount = await prisma.user.count();

  const stats = [
    {
      title: "Active Flights",
      value: flightCount.toString(),
      icon: Plane,
      change: "+12%",
      trend: "up",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.toString(),
      icon: CheckSquare,
      change: "-5%",
      trend: "down",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Active Vendors",
      value: vendorCount.toString(),
      icon: Utensils,
      change: "+2",
      trend: "up",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Team Members",
      value: userCount.toString(),
      icon: Users,
      change: "0",
      trend: "neutral",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
 
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {session.user?.name}</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your galley operations today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="flex items-center mt-2">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : stat.trend === "down" ? (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  ) : null}
                  <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-slate-400"}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Recent Flight Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for table or chart */}
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
                Flight order visualization coming soon
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">New vendor proposal received</p>
                      <p className="text-xs text-slate-500 mt-1">SkyCatering submitted a new menu for review.</p>
                      <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
