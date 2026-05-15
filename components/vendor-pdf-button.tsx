"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";

import VendorPdfDocument from "./vendor-pdf-document";

export default function VendorPDFButton({ order, vendorId, vendorName }: any) {
  return (
    <PDFDownloadLink
      document={
        <VendorPdfDocument
          order={order}
          vendorId={vendorId}
          vendorName={vendorName}
        />
      }
      fileName={`${vendorName}-delivery-sheet.pdf`}
      className="
        inline-flex
        items-center
        justify-center
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-5
        py-2.5
        text-sm
        font-semibold
        text-slate-700
        transition-all
        hover:bg-slate-100
      "
    >
      {({ loading }) => (loading ? "Generating..." : `${vendorName} PDF`)}
    </PDFDownloadLink>
  );
}
