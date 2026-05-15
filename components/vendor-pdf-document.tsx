import React from "react";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 18,
    borderBottom: "2 solid #1868A5",
  },

  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#1868A5",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  companyBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  companyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },

  companySub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },

  vendorBadge: {
    backgroundColor: "#1868A5",
    color: "#ffffff",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 8,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginTop: 10,
  },

  infoCard: {
    width: "49%",
    border: "1 solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f8fafc",
  },

  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  value: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
  },

  deliveryBox: {
    width: "49%",
    backgroundColor: "#dbeafe",
    border: "1 solid #93c5fd",
    padding: 12,
    borderRadius: 10,
  },

  deliveryTitle: {
    fontSize: 10,
    color: "#1d4ed8",
    marginBottom: 4,
    fontWeight: "bold",
  },

  deliveryTime: {
    fontSize: 16,
    color: "#1e3a8a",
    fontWeight: "bold",
  },

  table: {
    border: "1 solid #e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  itemCol: {
    width: "30%",
    paddingRight: 10,
  },

  qtyCol: {
    width: "15%",
    textAlign: "center",
  },

  notesCol: {
    width: "55%",
  },

  itemName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },

  itemCategory: {
    fontSize: 8,
    color: "#64748b",
  },

  notes: {
    fontSize: 9,
    color: "#475569",
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#64748b",
  },
});

export default function VendorPdfDocument({
  order,
  vendorId,
  vendorName,
}: any) {
  const vendorItems =
    order.items?.filter((item: any) => item.vendorId === vendorId) || [];

  const baseDate = new Date(order.date);

  const formattedDate = `${baseDate.getFullYear()}-${String(
    baseDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(baseDate.getDate()).padStart(2, "0")}`;

  const flightDateTime = new Date(`${formattedDate}T${order.departureTime}`);

  const deliveryDate = new Date(flightDateTime);

  deliveryDate.setHours(deliveryDate.getHours() - 2);

  const formatDateTime = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const day = String(date.getDate()).padStart(2, "0");

    const month = months[date.getMonth()];

    const year = date.getFullYear();

    const hours = date.getHours();

    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    const formattedHours = hours % 12 || 12;

    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  };
  const formatDeliveryDateTime = (dateString?: string, timeString?: string) => {
    if (!dateString || !timeString) {
      return "-";
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const [year, month, day] = dateString.split("-");

    const [hour, minute] = timeString.split(":");

    const hourNumber = Number(hour);

    const ampm = hourNumber >= 12 ? "PM" : "AM";

    const formattedHour = hourNumber % 12 || 12;

    return `${day}-${months[Number(month) - 1]}-${year} ${formattedHour}:${minute} ${ampm}`;
  };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>SG</Text>
            </View>

            <View>
              <Text style={styles.companyTitle}>SKYBLUE GALLEY</Text>

              <Text style={styles.companySub}>
                Vendor Catering Delivery Sheet
              </Text>
            </View>
          </View>

          <Text style={styles.vendorBadge}>{vendorName}</Text>
        </View>

        {/* FLIGHT DETAILS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Information</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Flight Time</Text>

              <Text style={styles.value}>{formatDateTime(flightDateTime)}</Text>
            </View>

            <View style={styles.deliveryBox}>
              <Text style={styles.deliveryTitle}>DELIVERY REQUIRED BEFORE</Text>

              <Text style={styles.deliveryTime}>
                {formatDeliveryDateTime(order.deliveryDate, order.deliveryTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* ITEMS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Items</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.itemCol}>Item</Text>

              <Text style={styles.qtyCol}>Qty</Text>

              <Text style={styles.notesCol}>Notes</Text>
            </View>

            {vendorItems.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.itemCol}>
                  <Text style={styles.itemName}>{item.name}</Text>

                  <Text style={styles.itemCategory}>
                    {item.category || "General"}
                  </Text>
                </View>

                <Text style={styles.qtyCol}>{item.quantity}</Text>

                <View style={styles.notesCol}>
                  <Text style={styles.notes}>{item.notes || "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
