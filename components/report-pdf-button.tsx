"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  header: {
    marginBottom: 16,
    borderBottom: "1 solid #cbd5e1",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },

  table: {
    width: "100%",
    border: "1 solid #e2e8f0",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
  },

  headerCell: {
    padding: 6,
    color: "#fff",
    fontSize: 7,
    fontWeight: "bold",
    borderRight: "1 solid #334155",
  },

  row: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
  },

  cell: {
    padding: 5,
    fontSize: 7,
    borderRight: "1 solid #e2e8f0",
  },
});

function ReportPDF({
  title,
  columns,
  data,
  reportType,
  inventoryType,
  flatData,
}: any) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View>
          {/* ================= FLIGHTS PDF ================= */}
          {reportType === "flights" && (
            <>
              {data.map((flight: any, index: number) => {
                const totalValue =
                  flight.items?.reduce(
                    (sum: number, item: any) =>
                      sum + (item.quantity || 0) * (item.price || 0),
                    0,
                  ) || 0;

                return (
                  <View
                    key={index}
                    style={{
                      marginBottom: 18,
                      border: "1 solid #dbe4ee",
                    }}
                  >
                    {/* Flight Header */}
                    <View
                      style={{
                        backgroundColor: "#0f172a",
                        padding: 8,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        >
                          {flight.departure} → {flight.arrival}
                        </Text>

                        <Text
                          style={{
                            color: "#cbd5e1",
                            fontSize: 8,
                            marginTop: 2,
                          }}
                        >
                          Flight: {flight.flightNumber || "TBD"}
                        </Text>
                      </View>

                      <Text style={{ color: "#fff", fontSize: 8 }}>
                        {flight.date
                          ? new Date(flight.date).toLocaleDateString("en-In", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </Text>
                    </View>
                    {/* Items */}
                    {flight.items?.map((item: any, i: number) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          borderBottom: "1 solid #e2e8f0",
                        }}
                      >
                        <Text style={{ flex: 2, padding: 6, fontSize: 8 }}>
                          {item.name}
                        </Text>

                        <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                          {item.vendorName || "Catalog"}
                        </Text>

                        <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                          Qty: {item.quantity}
                        </Text>

                        <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                          ₹{item.price || 0}
                        </Text>
                      </View>
                    ))}
                    /* ================= RESTORED ITEMS ================= */
                    {flight.restoredItems?.length > 0 && (
                      <View
                        style={{
                          marginTop: 8,
                          borderTop: "1 solid #d1d5db",
                        }}
                      >
                        {/* Restored Header */}
                        <View
                          style={{
                            backgroundColor: "#dcfce7",
                            padding: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 8,
                              fontWeight: "bold",
                              color: "#166534",
                            }}
                          >
                            Restored Items
                          </Text>
                        </View>

                        {/* Restored Table Header */}
                        <View
                          style={{
                            flexDirection: "row",
                            backgroundColor: "#f0fdf4",
                            borderBottom: "1 solid #d1fae5",
                          }}
                        >
                          <Text
                            style={{
                              flex: 2,
                              padding: 6,
                              fontSize: 8,
                              fontWeight: "bold",
                            }}
                          >
                            Item
                          </Text>

                          <Text
                            style={{
                              flex: 1,
                              padding: 6,
                              fontSize: 8,
                              fontWeight: "bold",
                            }}
                          >
                            Restored Qty
                          </Text>

                          <Text
                            style={{
                              flex: 2,
                              padding: 6,
                              fontSize: 8,
                              fontWeight: "bold",
                            }}
                          >
                            Restored By
                          </Text>
                        </View>

                        {/* Restored Rows */}
                        {flight.restoredItems.map((ri: any, idx: number) => {
                          const relatedItem = flight.items?.find(
                            (i: any) => i.id === ri.itemId,
                          );

                          return (
                            <View
                              key={idx}
                              style={{
                                flexDirection: "row",
                                borderBottom: "1 solid #e5e7eb",
                              }}
                            >
                              <Text
                                style={{
                                  flex: 2,
                                  padding: 6,
                                  fontSize: 8,
                                }}
                              >
                                {relatedItem?.name || "Unknown Item"}
                              </Text>

                              <Text
                                style={{
                                  flex: 1,
                                  padding: 6,
                                  fontSize: 8,
                                  color: "#166534",
                                  fontWeight: "bold",
                                }}
                              >
                                {ri.returnedQty}
                              </Text>

                              <Text
                                style={{
                                  flex: 2,
                                  padding: 6,
                                  fontSize: 8,
                                }}
                              >
                                {ri.restoredBy || "-"}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                    {/* Total */}
                    <View
                      style={{
                        backgroundColor: "#eff6ff",
                        padding: 8,
                        alignItems: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "bold",
                          color: "#1d4ed8",
                        }}
                      >
                        Total: ₹{totalValue.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* ================= VENDOR PDF ================= */}
          {reportType === "vendors" && (
            <>
              {data.map((vendor: any, index: number) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 20,
                    border: "1 solid #dbe4ee",
                  }}
                >
                  {/* Vendor Header */}
                  <View
                    style={{
                      backgroundColor: "#312e81",
                      padding: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      {vendor.vendorName}
                    </Text>

                    <Text
                      style={{
                        color: "#c7d2fe",
                        fontSize: 8,
                        marginTop: 2,
                      }}
                    >
                      Flights: {vendor.flightsCount} | Items: {vendor.totalQty}
                    </Text>
                  </View>

                  {/* Flights */}
                  {vendor.flights?.map((flight: any, i: number) => (
                    <View key={i}>
                      <View
                        style={{
                          backgroundColor: "#eef2ff",
                          padding: 6,
                        }}
                      >
                        <Text style={{ fontSize: 8 }}>
                          {flight.flightNumber} | {flight.route}
                        </Text>
                      </View>

                      {flight.items?.map((item: any, idx: number) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: "row",
                            borderBottom: "1 solid #e2e8f0",
                          }}
                        >
                          <Text style={{ flex: 2, padding: 6, fontSize: 8 }}>
                            {item.name}
                          </Text>

                          <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                            Qty: {item.quantity}
                          </Text>

                          <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                            ₹{item.price || 0}
                          </Text>

                          <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                            ₹
                            {(
                              (item.price || 0) * (item.quantity || 0)
                            ).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          {/* ================= INVENTORY PDF ================= */}
          {reportType === "inventory" && (
            <View style={{ border: "1 solid #dbe4ee" }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#0f172a",
                }}
              >
                {[
                  "Item",
                  "Loaded",
                  ...(inventoryType === "grocery" ? ["Restored"] : []),
                  "Consumed",
                  "Flights",
                ].map((h, i) => (
                  <Text
                    key={i}
                    style={{
                      flex: 1,
                      padding: 8,
                      color: "#fff",
                      fontSize: 8,
                      fontWeight: "bold",
                    }}
                  >
                    {h}
                  </Text>
                ))}
              </View>

              {/* Rows */}
              {flatData.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    borderBottom: "1 solid #e2e8f0",
                  }}
                >
                  <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                    {item.itemName}
                  </Text>

                  <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                    {item.totalLoaded}
                  </Text>

                  {inventoryType === "grocery" && (
                    <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                      {item.totalRestored}
                    </Text>
                  )}

                  <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                    {item.totalConsumed}
                  </Text>

                  <Text style={{ flex: 1, padding: 6, fontSize: 8 }}>
                    {item.flightsUsed}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export default function ReportPdfButton({
  title,
  columns,
  data,
  reportType,
  inventoryType,
  flatData,
}: any) {
  return (
    <PDFDownloadLink
      document={
        <ReportPDF
          title={title}
          columns={columns}
          data={data}
          reportType={reportType}
          inventoryType={inventoryType}
          flatData={flatData}
        />
      }
      fileName={`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`}
      className="
        inline-flex
        items-center
        justify-center
        rounded-xl
        bg-red-50
        px-4
        py-2
        text-sm
        font-medium
        text-red-600
        transition-colors
        hover:bg-red-100
        border border-red-200
      "
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
    </PDFDownloadLink>
  );
}
