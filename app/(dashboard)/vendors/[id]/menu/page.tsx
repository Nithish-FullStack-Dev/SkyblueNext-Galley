"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Edit2, Search, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function VendorMenuPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals - Using ONE consistent name now
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [draftItems, setDraftItems] = useState<any[]>([
    { name: "", description: "", price: 0, category: "", isAvailable: true },
  ]);

  const loadData = async () => {
    const [vRes, mRes, cRes] = await Promise.all([
      fetch(`/api/vendors?id=${id}`),
      fetch(`/api/vendors/${id}/menu`),
      fetch(`/api/catalog`),
    ]);
    setVendor(await vRes.json());
    setMenuItems(await mRes.json());
    setCatalogItems(await cRes.json());
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/vendors/${id}/menu?id=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Item removed from menu." });
        loadData();
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/vendors/${id}/menu`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        toast({ title: "Updated", description: "Price and details updated." });
        setEditingItem(null);
        loadData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Update failed." });
    }
  };

  const updateDraftItem = (index: number, updates: any) => {
    const updated = [...draftItems];
    updated[index] = { ...updated[index], ...updates };
    setDraftItems(updated);
  };

  const handleSelectCatalogItem = (catItem: any) => {
    const newItem = {
      name: catItem.name,
      category: catItem.category,
      price: 0,
      description: "",
      catalogItemId: catItem.id,
      isAvailable: true,
    };
    if (draftItems.length === 1 && !draftItems[0].name) {
      setDraftItems([newItem]);
    } else {
      setDraftItems([...draftItems, newItem]);
    }
  };

  const handleSaveAllItems = async () => {
    const validDrafts = draftItems.filter(
      (item) => item.name && item.name.trim() !== "",
    );
    if (validDrafts.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/vendors/${id}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validDrafts),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Menu updated." });
        setIsModalOpen(false);
        setDraftItems([
          {
            name: "",
            description: "",
            price: 0,
            category: "",
            isAvailable: true,
          },
        ]);
        loadData();
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalog = catalogItems.filter((item) =>
    item.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()),
  );

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const saveVendorMenuItem = async (item: any) => {
    try {
      const res = await fetch(`/api/vendors/${id}/menu`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      toast({
        title: "Updated",
        description:
          item.isAvailable === false ? "Item disabled" : "Item enabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Partners
      </button>

      <div
        className="
    flex
    flex-col
    sm:flex-row
    sm:items-end
    sm:justify-between

    gap-5

    mb-8
  "
      >
        {/* LEFT */}

        <div className="min-w-0">
          <h1
            className="
        text-2xl
        sm:text-3xl

        font-black
        text-slate-900

        break-words
      "
          >
            {vendor?.name}
          </h1>

          <p className="text-slate-500 mt-1">Manage pricing and menu items</p>
        </div>

        {/* RIGHT */}

        <button
          onClick={() => setIsModalOpen(true)}
          className="
      h-12

      w-full
      sm:w-auto

      px-6

      rounded-2xl

      bg-[#1868A5]
      text-white

      hover:bg-[#145686]

      transition-all
      duration-200

      shadow-sm
      hover:shadow-md

      font-semibold

      flex
      items-center
      justify-center
      gap-2

      shrink-0
    "
        >
          <Plus className="w-5 h-5 shrink-0" />

          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
  w-full
  h-11

  rounded-2xl
  border
  border-slate-200

  bg-white

  pl-10
  pr-4

  text-sm

  outline-none

  transition-all

  focus-visible:border-[#1868A5]
  focus-visible:ring-4
  focus-visible:ring-[#1868A5]/10
"
            />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="
  p-4
  sm:p-5

  flex
  flex-col
  lg:flex-row
  lg:items-center
  justify-between

  gap-5

  hover:bg-slate-50/80
  transition-all
"
            >
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-500">
                    {item.category} • {item.description || "No description"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-black text-[#1868A5] text-lg">
                  {item.price}{" "}
                  <span className="text-[10px] text-slate-400">
                    {item.currency}
                  </span>
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={async () => {
                      const updated = {
                        ...item,
                        isAvailable: item.isAvailable === false ? true : false,
                      };
                      await saveVendorMenuItem(updated);
                      loadData();
                    }}
                    className={`p-2 rounded-md ${item.isAvailable !== false ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50" : "text-slate-400 hover:text-green-600 hover:bg-green-50"}`}
                    title={
                      item.isAvailable !== false
                        ? "Mark Unavailable"
                        : "Mark Available"
                    }
                  >
                    <span
                      className={`
    rounded-full px-3 py-1 text-[11px] font-semibold
    ${
      item.isAvailable !== false
        ? "bg-red-50 text-red-600"
        : "bg-emerald-50 text-emerald-600"
    }
  `}
                    >
                      {item.isAvailable !== false ? "Disable" : "Enable"}
                    </span>
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="
  w-10
  h-10

  rounded-xl

  text-slate-400

  hover:bg-[#1868A5]/10
  hover:text-[#1868A5]

  transition-all

  flex
  items-center
  justify-center
"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="
  w-10
  h-10

  rounded-xl

  text-slate-400

  hover:bg-red-50
  hover:text-red-600

  transition-all

  flex
  items-center
  justify-center
"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className=" bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit {editingItem.name}</h3>
              <X
                className="cursor-pointer"
                onClick={() => setEditingItem(null)}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Price ({editingItem.currency})
                </label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, price: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl mt-1"
                />
              </div>
              <button
                onClick={handleEditSave}
                className="
  w-full
  h-12

  rounded-2xl

  bg-[#1868A5]
  text-white

  hover:bg-[#145686]

  transition-all

  font-semibold
"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MENU ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div
            className="
  bg-white

  rounded-3xl

  shadow-2xl

  w-full
  max-w-6xl

  h-[90vh]

  flex
  flex-col
  lg:flex-row

  overflow-hidden
"
          >
            <div className="w-full lg:w-1/2 border-r border-slate-100 bg-slate-50 flex flex-col">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">
                  Add from Catalog
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {filteredCatalog.map((catItem) => (
                  <button
                    key={catItem.id}
                    onClick={() => handleSelectCatalogItem(catItem)}
                    className="w-full text-left p-3 rounded-lg hover:bg-white transition-all"
                  >
                    <p className="font-bold text-slate-900">{catItem.name}</p>
                    <p className="text-xs text-slate-500">{catItem.category}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col bg-white">
              {/* HEADER */}

              <div className="p-6 flex justify-between items-center border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    New Items
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Configure vendor menu items
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="
        w-10
        h-10

        rounded-xl

        text-black

        hover:text-white
        hover:bg-[#1868A5]
        hover:rotate-180

        transition-all
        duration-300

        flex
        items-center
        justify-center
      "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BODY */}

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {draftItems.map((item, index) => (
                  <div
                    key={index}
                    className="
          rounded-3xl
          border
          border-slate-200
          bg-slate-50/50

          p-5
          sm:p-6

          space-y-5
        "
                  >
                    {/* TOP */}

                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-bold text-slate-900">
                        Item #{index + 1}
                      </h4>

                      <button
                        onClick={() => {
                          setDraftItems(
                            draftItems.filter((_, i) => i !== index),
                          );
                        }}
                        className="
              w-9
              h-9

              rounded-xl

              bg-red-50
              text-red-600

              hover:bg-red-600
              hover:text-white

              transition-all

              flex
              items-center
              justify-center
            "
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* NAME */}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Item Name
                      </label>

                      <input
                        type="text"
                        placeholder="Chicken Sandwich"
                        value={item.name}
                        onChange={(e) =>
                          updateDraftItem(index, {
                            name: e.target.value,
                          })
                        }
                        className="
              w-full
              h-11

              rounded-2xl
              border
              border-slate-200

              bg-white

              px-4

              text-sm

              outline-none
              transition-all

              focus-visible:border-[#1868A5]
              focus-visible:ring-4
              focus-visible:ring-[#1868A5]/10
            "
                      />
                    </div>

                    {/* DESCRIPTION */}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Description
                      </label>

                      <textarea
                        placeholder="Freshly prepared onboard meal..."
                        value={item.description}
                        onChange={(e) =>
                          updateDraftItem(index, {
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="
              w-full

              rounded-2xl
              border
              border-slate-200

              bg-white

              px-4
              py-3

              text-sm

              resize-none

              outline-none
              transition-all

              focus-visible:border-[#1868A5]
              focus-visible:ring-4
              focus-visible:ring-[#1868A5]/10
            "
                      />
                    </div>

                    {/* PRICE + CATEGORY */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PRICE */}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Price
                        </label>

                        <input
                          type="number"
                          placeholder="0"
                          min={0}
                          value={item.price}
                          onChange={(e) =>
                            updateDraftItem(index, {
                              price: Number(e.target.value),
                            })
                          }
                          className="
                w-full
                h-11

                rounded-2xl
                border
                border-slate-200

                bg-white

                px-4

                text-sm

                outline-none
                transition-all

                focus-visible:border-[#1868A5]
                focus-visible:ring-4
                focus-visible:ring-[#1868A5]/10
              "
                        />
                      </div>

                      {/* CATEGORY */}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Category
                        </label>

                        <div className="relative">
                          <select
                            value={item.category}
                            onChange={(e) =>
                              updateDraftItem(index, {
                                category: e.target.value,
                              })
                            }
                            className="
        w-full
        h-11

        appearance-none

        rounded-2xl
        border
        border-slate-200

        bg-white

        px-4
        pr-10

        text-sm
        font-medium
        text-slate-900

        outline-none
        transition-all

        hover:border-[#1868A5]/40

        focus-visible:border-[#1868A5]
        focus-visible:ring-4
        focus-visible:ring-[#1868A5]/10
      "
                          >
                            <option value="">Select Category</option>

                            <option value="Beverages">Beverages</option>

                            <option value="Breakfast">Breakfast</option>

                            <option value="Main Course">Main Course</option>

                            <option value="Desserts">Desserts</option>

                            <option value="Snacks">Snacks</option>

                            <option value="Bakery">Bakery</option>

                            <option value="Healthy">Healthy</option>

                            <option value="Kids Meal">Kids Meal</option>

                            <option value="Special Meal">Special Meal</option>
                          </select>

                          {/* ICON */}

                          <div
                            className="
        pointer-events-none
        absolute
        inset-y-0
        right-4

        flex
        items-center

        text-slate-400
      "
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}

              <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() =>
                    setDraftItems([
                      ...draftItems,
                      {
                        name: "",
                        description: "",
                        price: 0,
                        category: "",
                        dietaryTags: [],
                        allergens: [],
                        isAvailable: true,
                      },
                    ])
                  }
                  className="
        h-12
        px-6

        rounded-2xl

        border
        border-slate-200

        bg-white
        text-slate-700

        hover:border-[#1868A5]
        hover:text-[#1868A5]

        transition-all

        font-semibold
      "
                >
                  Add Another
                </button>

                <button
                  onClick={handleSaveAllItems}
                  disabled={loading}
                  className="
        h-12
        px-8

        rounded-2xl

        bg-[#1868A5]
        text-white

        hover:bg-[#145686]

        transition-all

        font-semibold

        disabled:opacity-50
      "
                >
                  {loading ? "Saving..." : "Save All Items"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
