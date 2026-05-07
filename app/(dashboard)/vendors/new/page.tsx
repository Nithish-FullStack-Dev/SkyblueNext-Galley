// app\vendors\new\page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Phone, Mail, MapPin, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

export default function NewVendorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      currency: 'USD'
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await axios.post('/api/vendors', data);
      toast({ title: "Vendor Created", description: "Successfully added new catering partner." });
      router.push('/vendors');
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create vendor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Vendor</h1>
            <p className="text-slate-500">Add a new catering partner to the system.</p>
          </div>
        </div>

        <Card className="max-w-3xl border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Business Profile
            </CardTitle>
            <CardDescription>Enter the vendor's primary contact and business information.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input id="name" {...register('name', { required: true })} placeholder="e.g. Gourmet Sky Catering" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" {...register('contactPerson', { required: true })} placeholder="John Doe" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email', { required: true })} placeholder="orders@gourmet.com" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register('phone', { required: true })} placeholder="+1 (555) 000-0000" className="rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input id="address" {...register('address', { required: true })} placeholder="Full street address" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <Input id="currency" {...register('currency')} defaultValue="USD" className="rounded-xl" />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50">
                <Button type="submit" disabled={loading} className="rounded-xl px-10 py-6 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Vendor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
