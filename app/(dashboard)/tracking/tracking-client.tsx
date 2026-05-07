// app\(dashboard)\tracking\tracking-client.tsx
"use client";

import { useMemo, useState } from "react";

import axios from "axios";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  Package,
  Plane,
  Upload,
  X,
} from "lucide-react";

import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import DownloadPDFButton from "@/components/download-pdf-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;

  flightNumber: string;

  tailNumber: string;

  departure: string;

  arrival: string;

  date: string;

  status: string;

  billUrl?: string | null;

  billAmount?: number | null;

  billNotes?: string | null;

  createdAt: string;

  updatedAt: string;

  vendor?: {
    id: string;
    name: string;
    email: string;
  } | null;

  creator?: {
    name: string;
  };

  approver?: {
    name: string;
  } | null;

  items: {
    id: string;
  }[];
}

interface Props {
  orders: Order[];
}

const stepperStatuses = [
  "Submitted",
  "Approved",
  "SentToVendor",
  "Confirmed",
  "Completed",
];

const allStatuses = [...stepperStatuses, "Rejected", "Cancelled"];

const tabs = [
  "All",
  "Submitted",
  "Approved",
  "SentToVendor",
  "Confirmed",
  "Completed",
  "Rejected",
  "Cancelled",
];

export default function TrackingClient({ orders }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("All");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [billAmount, setBillAmount] = useState("");

  const [billNotes, setBillNotes] = useState("");

  const [billFile, setBillFile] = useState<File | null>(null);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const query = search.toLowerCase();

        const matchesSearch =
          order.flightNumber.toLowerCase().includes(query) ||
          order.departure.toLowerCase().includes(query) ||
          order.arrival.toLowerCase().includes(query);

        const matchesTab =
          activeTab === "All" ? true : order.status === activeTab;

        return matchesSearch && matchesTab;
      })

      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, search, activeTab]);

  const handleStatusChange = async (order: Order, status: string) => {
    try {
      const flightDate = new Date(order.date);

      if (
        flightDate < new Date() &&
        !["Cancelled", "Rejected"].includes(status)
      ) {
        alert("Flight departure time already passed.");

        return;
      }

      setLoadingId(order.id);

      await axios.patch(`/api/flights/${order.id}/status`, {
        status,
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const openUploadModal = (order: Order) => {
    setSelectedOrder(order);

    setBillAmount(order.billAmount?.toString() || "");

    setBillNotes(order.billNotes || "");
  };

  const handleUploadBill = async () => {
    try {
      if (!selectedOrder) return;

      setLoadingId(selectedOrder.id);

      let uploadedUrl = selectedOrder.billUrl;

      if (billFile) {
        const formData = new FormData();

        formData.append("file", billFile);

        const uploadRes = await axios.post("/api/upload", formData);

        uploadedUrl = uploadRes.data.url;
      }

      await axios.patch(`/api/flights/${selectedOrder.id}/status`, {
        status: "Completed",
        billAmount,
        billNotes,
        billUrl: uploadedUrl,
      });

      setSelectedOrder(null);

      setBillAmount("");

      setBillNotes("");

      setBillFile(null);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* HEADER */}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Order Tracking
          </h1>

          <p className="text-slate-500 mt-1">
            Track and manage catering workflow operations.
          </p>
        </div>

        {/* SEARCH + FILTER */}

        <div className="space-y-5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="relative w-full xl:max-w-md">
              <Input
                placeholder="Search flight, route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  h-12
                  rounded-2xl
                  border-slate-200
                  bg-white
                "
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />

              <span>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredOrders.length}
                </span>{" "}
                flights
              </span>
            </div>
          </div>

          {/* TABS */}

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 min-w-max pb-1">
              {tabs.map((tab) => {
                const active = activeTab === tab;

                const count =
                  tab === "All"
                    ? orders.length
                    : orders.filter((o) => o.status === tab).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      `
                      h-11
                      px-5
                      rounded-2xl
                      border
                      text-sm
                      font-semibold
                      whitespace-nowrap
                      transition-all
                    `,
                      active
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    {tab}

                    <span
                      className={cn(
                        `
                        ml-2
                        px-2
                        py-0.5
                        rounded-full
                        text-xs
                      `,
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ORDERS */}

        {filteredOrders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No Orders Found
            </h3>

            <p className="text-slate-500 mt-2 text-sm">
              Orders will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const currentStatusIndex = stepperStatuses.indexOf(order.status);

              const flightDate = new Date(order.date);

              const now = new Date();

              const hoursUntilFlight =
                (flightDate.getTime() - now.getTime()) / (1000 * 60 * 60);

              const isUrgent =
                hoursUntilFlight > 0 &&
                hoursUntilFlight < 24 &&
                !["Completed", "Cancelled", "Rejected"].includes(order.status);

              const isOverdue =
                hoursUntilFlight < 0 &&
                !["Completed", "Cancelled", "Rejected"].includes(order.status);

              return (
                <Card
                  key={order.id}
                  className={cn(
                    `
                      rounded-3xl
                      border
                      shadow-sm
                      overflow-hidden
                    `,
                    isUrgent
                      ? "border-orange-300 ring-1 ring-orange-200"
                      : isOverdue
                        ? "border-red-300 ring-1 ring-red-200"
                        : "border-slate-200",
                  )}
                >
                  <CardContent className="p-6 lg:p-8">
                    {(isUrgent || isOverdue) && (
                      <div
                        className={cn(
                          `
        mb-6
        flex
        items-center
        gap-3
        rounded-2xl
        px-4
        py-3
        text-sm
        font-medium
      `,
                          isUrgent
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "bg-red-50 text-red-700 border border-red-200",
                        )}
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" />

                        <span>
                          {isUrgent
                            ? "Urgent: Flight departs within 24 hours."
                            : "Overdue: Flight departure time passed."}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col 2xl:flex-row gap-8 justify-between">
                      {/* LEFT */}

                      <div className="flex gap-5 min-w-0 flex-1">
                        {/* ICON */}

                        <div
                          className="
        w-16
        h-16
        rounded-3xl
        bg-primary/10
        flex
        items-center
        justify-center
        shrink-0
      "
                        >
                          <Plane className="w-7 h-7 text-primary" />
                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0 flex-1">
                          {/* HEADER */}

                          <div className="flex flex-wrap items-center gap-3">
                            <h2
                              className="
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
          "
                            >
                              {order.flightNumber}
                            </h2>

                            <span
                              className={cn(
                                `
              inline-flex
              items-center
              rounded-full
              px-3
              py-1
              text-[11px]
              font-semibold
              border
            `,

                                order.status === "Approved" &&
                                  "bg-emerald-100 text-emerald-700 border-emerald-200",

                                order.status === "Rejected" &&
                                  "bg-red-100 text-red-700 border-red-200",

                                order.status === "Submitted" &&
                                  "bg-sky-100 text-sky-700 border-sky-200",

                                order.status === "SentToVendor" &&
                                  "bg-violet-100 text-violet-700 border-violet-200",

                                order.status === "Confirmed" &&
                                  "bg-cyan-100 text-cyan-700 border-cyan-200",

                                order.status === "Completed" &&
                                  "bg-blue-100 text-blue-700 border-blue-200",

                                order.status === "Cancelled" &&
                                  "bg-slate-100 text-slate-700 border-slate-200",
                              )}
                            >
                              {order.status}
                            </span>
                          </div>

                          {/* ROUTE */}

                          <p className="mt-2 text-base text-slate-500">
                            {order.departure} → {order.arrival}
                          </p>

                          {/* META */}

                          <div
                            className="
          mt-6
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
                          >
                            <div>
                              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                Items
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {order.items?.length}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                Vendor
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {Array.from(
                                  new Set(
                                    order.items
                                      ?.map(
                                        (item: any) =>
                                          item.vendor?.name || item.vendorName,
                                      )
                                      .filter(Boolean),
                                  ),
                                ).length > 0 ? (
                                  Array.from(
                                    new Set(
                                      order.items
                                        ?.map(
                                          (item: any) =>
                                            item.vendor?.name ||
                                            item.vendorName,
                                        )
                                        .filter(Boolean),
                                    ),
                                  ).map((vendor: any) => (
                                    <span
                                      key={vendor}
                                      className="
            inline-flex
            items-center
            rounded-full
            px-3
            py-1
            text-[11px]
            font-semibold
            bg-emerald-50
            text-emerald-700
            border
            border-emerald-200
          "
                                    >
                                      {vendor}
                                    </span>
                                  ))
                                ) : (
                                  <p className="text-sm font-semibold text-slate-900">
                                    Not Assigned
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                Submitted
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {format(
                                  new Date(order.createdAt),
                                  "MMM dd, yyyy",
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                Approved By
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {order.approver?.name || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div
                        className="
      w-full
      2xl:w-[360px]
      shrink-0
      flex
      flex-col
      gap-5
    "
                      >
                        {/* STATUS */}

                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Status
                          </label>

                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusChange(order, value)
                            }
                          >
                            <SelectTrigger className="h-12 rounded-2xl">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>

                            <SelectContent>
                              {allStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        `
                      w-2.5
                      h-2.5
                      rounded-full
                    `,

                                        status === "Approved" &&
                                          "bg-emerald-500",

                                        status === "Rejected" && "bg-red-500",

                                        status === "Submitted" && "bg-sky-500",

                                        status === "SentToVendor" &&
                                          "bg-violet-500",

                                        status === "Confirmed" && "bg-cyan-500",

                                        status === "Completed" && "bg-blue-500",

                                        status === "Cancelled" &&
                                          "bg-slate-400",
                                      )}
                                    />

                                    <span>{status}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* BUTTONS */}

                        <div
                          className="
        grid
        grid-cols-2
        gap-3
      "
                        >
                          {order.vendor?.email && (
                            <a
                              href={`mailto:${order.vendor.email}`}
                              className="col-span-2"
                            >
                              <Button
                                variant="outline"
                                className="w-full h-11 rounded-2xl"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email Vendor
                              </Button>
                            </a>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => openUploadModal(order)}
                            className="h-11 rounded-2xl"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>

                          <Link href={`/flights/${order.id}`}>
                            <Button
                              variant="outline"
                              className="w-full h-11 rounded-2xl"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>

                          <div className="col-span-2">
                            <DownloadPDFButton order={order} />
                          </div>

                          {order.billUrl && (
                            <a
                              href={order.billUrl}
                              target="_blank"
                              className="col-span-2"
                            >
                              <Button
                                variant="outline"
                                className="w-full h-11 rounded-2xl"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Invoice
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload Vendor Invoice
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Flight {selectedOrder.flightNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Invoice File
                </label>

                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Bill Amount
                </label>

                <Input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Notes
                </label>

                <Textarea
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  placeholder="Vendor remarks..."
                  className="
                    min-h-[120px]
                    rounded-2xl
                  "
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={handleUploadBill}
                disabled={loadingId === selectedOrder.id}
                className="rounded-xl"
              >
                {loadingId === selectedOrder.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
