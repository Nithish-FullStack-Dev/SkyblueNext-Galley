// app\vendors\import\page.tsx
"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Table,
  Download,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from "papaparse";

function VendorImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId");
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to download the sample CSV
  const downloadTemplate = () => {
    const headers = "name,category,description,price,currency\n";
    const sampleData =
      "Chicken Rice,Main Course,Freshly cooked chicken with fragrant rice,800,\nChocolate Fondant,Desserts,Warm chocolate cake with a melting heart,450,";
    const blob = new Blob([headers + sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "vendor_menu_template.csv");
    ``;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Filter out empty rows to keep the preview clean
        const validRows = results.data.filter(
          (row: any) => row.name && row.name.trim() !== "",
        );
        setPreview(validRows.slice(0, 10));
      },
    });
  };

  const handleStartImport = async () => {
    if (!file || !vendorId) {
      toast({
        title: "Missing Info",
        description:
          "Please select a file and ensure vendor context is active.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Logic for bulk processing
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunk: async (results) => {
          // Filter out the empty objects that PapaParse might grab from the end of the file
          const validItems = results.data.filter(
            (item: any) => item.name && item.name.trim() !== "",
          );

          if (validItems.length > 0) {
            await fetch(`/api/vendors/${vendorId}/menu`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(validItems),
            });
          }
        },
        complete: () => {
          toast({
            title: "Bulk Import Finished",
            description: "CSV processed successfully.",
          });
          router.push(`/vendors/${vendorId}/menu`);
        },
        error: (err) => {
          throw new Error(err.message);
        },
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong during the import.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Bulk CSV Import
            </h1>
            <p className="text-slate-500">
              Upload large menu data lists for your vendors.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="rounded-xl flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Download className="w-4 h-4" /> Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* UPLOAD SECTION */}
        <Card className="lg:col-span-1 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <Table className="w-5 h-5 text-green-600" />
              Upload CSV
              <span className="text-xs opacity-50 font-normal ml-auto">
                Unlimited
              </span>
            </CardTitle>
            <CardDescription>
              Select your CSV file to begin the bulk update.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div
              className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-slate-900/20 transition-all cursor-pointer bg-slate-50/50 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-slate-900 break-all">
                  {file ? file.name : "Select Menu CSV"}
                </p>
                <p className="text-[10px] uppercase font-black text-slate-400 mt-2 tracking-widest">
                  CSV file format only
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <Button
              className="w-full rounded-2xl py-7 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
              disabled={!file || loading}
              onClick={handleStartImport}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              {loading ? "Processing..." : "Start Import"}
            </Button>
          </CardContent>
        </Card>

        {/* PREVIEW SECTION */}
        <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
            <CardTitle className="text-xl">Import Preview</CardTitle>
            <CardDescription>
              Reviewing first {preview.length} valid rows.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {preview.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      {Object.keys(preview[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {Object.values(row).map((val: any, j) => (
                          <td
                            key={j}
                            className="px-6 py-4 text-slate-600 truncate max-w-[150px]"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-24 text-center text-slate-400 space-y-4">
                <FileText className="w-16 h-16 mx-auto text-slate-100" />
                <p className="text-sm font-medium">
                  Upload a CSV to preview the data columns here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default function VendorImportPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-sm text-slate-500">Loading...</div>}
    >
      <VendorImportContent />
    </Suspense>
  );
}
