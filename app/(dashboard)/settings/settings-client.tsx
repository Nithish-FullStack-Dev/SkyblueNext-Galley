// app/(dashboard)/settings/settings-client.tsx

"use client";

import { useState } from "react";

import axios from "axios";

import Image from "next/image";

import {
  Camera,
  Loader2,
  Mail,
  Shield,
  User2,
  Save,
  CheckCircle2,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/components/ui/use-toast";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    image?: string;
    createdAt: string;
  };
}

export default function SettingsClient({ user }: Props) {
  const { update } = useSession();

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user.name);

  const [image, setImage] = useState(user.image || "");

  const [preview, setPreview] = useState(user.image || "");

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    const res = await axios.post("/api/upload", formData);

    return res.data.url;
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await axios.patch(`/api/users/${user.id}`, {
        name,
        image,
      });

      await update({
        name,
        image,
      });

      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="
            text-3xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Settings
        </h1>

        <p className="text-slate-500 mt-1">
          Manage your account profile and preferences.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-6
        "
      >
        {/* PROFILE CARD */}

        <Card
          className="
            rounded-3xl
            border-none
            shadow-sm
            xl:col-span-1
          "
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className="
                    w-32
                    h-32
                    rounded-full
                    overflow-hidden
                    border-4
                    border-slate-100
                    shadow-lg
                    bg-slate-100
                  "
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt={user.name}
                      width={200}
                      height={200}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-full
                        h-full
                        flex
                        items-center
                        justify-center
                        text-4xl
                        font-bold
                        text-primary
                      "
                    >
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <label
                  className="
                    absolute
                    bottom-1
                    right-1
                    w-10
                    h-10
                    rounded-full
                    bg-primary
                    text-white
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                    shadow-lg
                    hover:scale-105
                    transition
                  "
                >
                  <Camera className="w-4 h-4" />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      const local = URL.createObjectURL(file);

                      setPreview(local);

                      const uploaded = await handleImageUpload(file);

                      setImage(uploaded);
                    }}
                  />
                </label>
              </div>

              <h2
                className="
                  mt-6
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {name}
              </h2>

              <p className="text-slate-500">{user.email}</p>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  justify-center
                  gap-2
                "
              >
                <span
                  className="
                    px-4
                    py-1.5
                    rounded-full
                    bg-primary/10
                    text-primary
                    text-xs
                    font-semibold
                    uppercase
                  "
                >
                  {user.role}
                </span>

                <span
                  className="
                    px-4
                    py-1.5
                    rounded-full
                    bg-emerald-100
                    text-emerald-700
                    text-xs
                    font-semibold
                  "
                >
                  {user.status}
                </span>
              </div>

              <div
                className="
                  mt-8
                  w-full
                  space-y-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    p-4
                    rounded-2xl
                    bg-slate-50
                  "
                >
                  <Mail className="w-5 h-5 text-slate-400" />

                  <div className="text-left">
                    <p className="text-xs text-slate-400">Email</p>

                    <p className="text-sm font-medium text-slate-800">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    p-4
                    rounded-2xl
                    bg-slate-50
                  "
                >
                  <Shield className="w-5 h-5 text-slate-400" />

                  <div className="text-left">
                    <p className="text-xs text-slate-400">Role</p>

                    <p className="text-sm font-medium text-slate-800 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    p-4
                    rounded-2xl
                    bg-slate-50
                  "
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />

                  <div className="text-left">
                    <p className="text-xs text-slate-400">Account Status</p>

                    <p className="text-sm font-medium text-emerald-700">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FORM */}

        <Card
          className="
            rounded-3xl
            border-none
            shadow-sm
            xl:col-span-2
          "
        >
          <CardContent className="p-8">
            <div className="mb-8">
              <h3
                className="
                  text-xl
                  font-bold
                  text-slate-900
                "
              >
                Profile Information
              </h3>

              <p className="text-slate-500 mt-1 text-sm">
                Update your personal details.
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-6
              "
            >
              <div className="space-y-2">
                <Label>Full Name</Label>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="
                    h-12
                    rounded-2xl
                  "
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>

                <Input
                  value={user.email}
                  disabled
                  className="
                    h-12
                    rounded-2xl
                    bg-slate-100
                  "
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>

                <Input
                  value={user.role}
                  disabled
                  className="
                    h-12
                    rounded-2xl
                    bg-slate-100
                  "
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>

                <Input
                  value={user.status}
                  disabled
                  className="
                    h-12
                    rounded-2xl
                    bg-slate-100
                  "
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Bio</Label>

                <Textarea
                  placeholder="Write something about yourself..."
                  className="
                    rounded-2xl
                    min-h-[140px]
                  "
                />
              </div>
            </div>

            <div
              className="
                mt-8
                flex
                justify-end
              "
            >
              <Button
                onClick={handleSave}
                disabled={loading}
                className="
                  rounded-2xl
                  h-12
                  px-8
                  text-sm
                  font-semibold
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      className="
                        w-4
                        h-4
                        mr-2
                        animate-spin
                      "
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
