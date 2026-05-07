"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

export default function OCRUploader({ onDataExtracted }: { onDataExtracted: (data: any[]) => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // In a real app, this would call a Gemini API endpoint
      // const res = await axios.post('/api/ocr', formData);
      // onDataExtracted(res.data.items);
      
      // Simulation
      await new Promise(r => setTimeout(r, 3000));
      toast({ title: "AI Scan Complete", description: "Successfully extracted 5 items from the menu." });
      
      onDataExtracted([
        { name: "Filet Mignon", type: "food", quantity: 1, notes: "Medium rare" },
        { name: "Lobster Tail", type: "food", quantity: 1, notes: "With butter sauce" },
        { name: "Vintage Champagne", type: "food", quantity: 2, notes: "" },
      ]);
    } catch (err) {
      toast({ title: "Scan Failed", description: "AI could not process this image.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-900">AI Menu Scanner</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Upload a photo of a vendor menu to extract items automatically.</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl w-full" 
            disabled={loading}
            onClick={() => document.getElementById('ocr-upload')?.click()}
          >
            {loading ? 'Analyzing...' : 'Upload Menu Photo'}
          </Button>
          <input id="ocr-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </CardContent>
    </Card>
  );
}
