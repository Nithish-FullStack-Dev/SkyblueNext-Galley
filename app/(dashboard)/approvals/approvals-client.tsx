"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Plane,
  X,
} from "lucide-react";

import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Flight {
  id: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  tailNumber: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  date?: string;

  creator: {
    id: string;
    name: string;
    email: string;
  };

  items: {
    id: string;
  }[];
}

interface Props {
  flights: Flight[];
  currentUser: any;
}

export default function ApprovalsClient({ flights, currentUser }: Props) {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [rejectingFlight, setRejectingFlight] = useState<Flight | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [expiredFlight, setExpiredFlight] = useState<Flight | null>(null);
  const pendingFlights = useMemo(() => {
    return flights.filter((flight) => flight.status === "Submitted");
  }, [flights]);

  const handleApprove = async (flight: Flight) => {
    try {
      if (flight.date) {
        const flightDate = new Date(flight.date);

        if (flightDate < new Date()) {
          setExpiredFlight(flight);
          return;
        }
      }

      setLoadingId(flight.id);

      await axios.patch(`/api/flights/${flight.id}/approval`, {
        action: "approve",
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async () => {
    try {
      if (!rejectingFlight) return;

      setLoadingId(rejectingFlight.id);

      await axios.patch(`/api/flights/${rejectingFlight.id}/approval`, {
        action: "reject",
        rejectionReason,
      });

      setRejectingFlight(null);
      setRejectionReason("");

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendBackDraft = async () => {
    try {
      if (!rejectingFlight) return;

      setLoadingId(rejectingFlight.id);

      await axios.patch(`/api/flights/${rejectingFlight.id}/approval`, {
        action: "draft",
        rejectionReason,
      });

      setRejectingFlight(null);
      setRejectionReason("");

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Pending Approvals
          </h1>

          <p className="text-slate-500 mt-1 text-sm">
            Review and approve or reject {pendingFlights.length} pending orders
          </p>
        </div>

        {pendingFlights.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl py-20 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-slate-400" />
            </div>

            <h3 className="text-xl font-semibold text-slate-900">
              No pending approvals
            </h3>

            <p className="text-slate-500 mt-2 text-sm">
              All flight catering orders have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {pendingFlights.map((flight) => (
              <Card
                key={flight.id}
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  shadow-sm
                  hover:shadow-md
                  transition-all
                  overflow-hidden
                "
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Plane className="w-6 h-6 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                            Flight {flight.flightNumber}
                          </h2>

                          <p className="text-sm text-slate-500 mt-1">
                            {flight.departure} → {flight.arrival}
                          </p>

                          <div className="mt-4 flex flex-col gap-1 text-sm text-slate-500">
                            <p>
                              Tail Number:{" "}
                              <span className="font-medium text-slate-700">
                                {flight.tailNumber}
                              </span>
                            </p>

                            <p>
                              Submitted By:{" "}
                              <span className="font-medium text-slate-700">
                                {flight.creator?.name}
                              </span>
                            </p>

                            <p>
                              Submitted:{" "}
                              <span className="font-medium text-slate-700">
                                {format(
                                  new Date(flight.createdAt),
                                  "MMM dd, yyyy hh:mm a",
                                )}
                              </span>
                            </p>

                            <p>
                              Items:{" "}
                              <span className="font-medium text-slate-700">
                                {flight.items?.length || 0}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-nowrap gap-3 w-full xl:w-auto">
                      <Link
                        href={`/flights/${flight.id}?mode=review`}
                        className="flex-1 xl:flex-none"
                      >
                        <Button
                          variant="outline"
                          className="
                            w-full
                            rounded-xl
                            border-blue-200
                            text-blue-600
                            hover:bg-blue-50
                          "
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </Link>

                      <Button
                        onClick={() => setRejectingFlight(flight)}
                        variant="outline"
                        className="
                          flex-1 xl:flex-none
                          rounded-xl
                          border-red-300
                          text-red-600
                          hover:bg-red-50
                        "
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>

                      <Button
                        onClick={() => handleApprove(flight)}
                        disabled={loadingId === flight.id}
                        className="
                          flex-1 xl:flex-none
                          rounded-xl
                          bg-green-600
                          hover:bg-green-700
                        "
                      >
                        {loadingId === flight.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* REJECTION MODAL */}

      {rejectingFlight && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Reject or Send Back
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Flight {rejectingFlight.flightNumber}
                </p>
              </div>

              <button
                onClick={() => {
                  setRejectingFlight(null);
                  setRejectionReason("");
                }}
                className="
                  w-10 h-10
                  rounded-xl
                  hover:bg-slate-100
                  flex items-center justify-center
                "
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />

                <p className="text-sm text-red-700">
                  Please provide a reason for rejection or sending this order
                  back as draft.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Rejection Reason
                </label>

                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Incorrect quantities, missing details, dietary issue..."
                  className="
                    min-h-[140px]
                    rounded-2xl
                    resize-none
                  "
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingFlight(null);
                  setRejectionReason("");
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSendBackDraft}
                disabled={!rejectionReason.trim()}
                className="
                  rounded-xl
                  bg-orange-600
                  hover:bg-orange-700
                "
              >
                Send Back as Draft
              </Button>

              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                variant="destructive"
                className="rounded-xl"
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* EXPIRED FLIGHT MODAL */}

      {expiredFlight && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Approval Blocked
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Flight {expiredFlight.flightNumber}
                </p>
              </div>

              <button
                onClick={() => setExpiredFlight(null)}
                className="
            w-10
            h-10
            rounded-xl
            hover:bg-slate-100
            flex
            items-center
            justify-center
          "
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Flight departure time already passed.
                  </p>

                  <p className="text-sm text-amber-700 mt-1">
                    Please update the flight timing before approving this
                    catering order.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                onClick={() => setExpiredFlight(null)}
                className="rounded-xl"
              >
                Okay
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
