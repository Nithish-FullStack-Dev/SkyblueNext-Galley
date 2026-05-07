// app\vendors\[id]\page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Store, Phone, Mail, MapPin, Plus, Search, Filter, Edit2, Trash2, ArrowLeft, MoreVertical, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function VendorDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: {
      menuItems: {
        orderBy: { category: 'asc' }
      },
      _count: {
        select: { orders: true }
      }
    }
  });

  if (!vendor) notFound();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendors">
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{vendor.name}</h1>
              <p className="text-slate-500">Vendor ID: {vendor.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl px-6">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Vendor
            </Button>
            <Button className="rounded-xl px-6 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-slate-50">
                <CardTitle className="text-xl">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary/60 shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Contact Person</p>
                      <p className="text-sm font-bold text-slate-900">{vendor.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary/60 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-slate-900">{vendor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary/60 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-slate-900">{vendor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary/60 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Business Address</p>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed">{vendor.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-primary">{vendor._count.orders}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total Orders</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-primary">{vendor.currency}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Base Currency</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
                <div>
                  <CardTitle className="text-xl">Vendor Menu</CardTitle>
                  <CardDescription>Items available exclusively from this vendor.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search menu..." className="pl-10 h-10 w-48 rounded-xl border-slate-200" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {vendor.menuItems.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary font-bold">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</h4>
                            <span className="px-2 py-0.5 rounded-lg bg-primary/5 text-[8px] font-bold text-primary uppercase tracking-widest">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description || 'No description available'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{vendor.currency} {item.price.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Price</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-primary">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {vendor.menuItems.length === 0 && (
                    <div className="p-20 text-center text-slate-400 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mx-auto">
                        <Store className="w-8 h-8" />
                      </div>
                      <p>No menu items added for this vendor yet.</p>
                      <Button variant="outline" className="rounded-xl">Add First Item</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
