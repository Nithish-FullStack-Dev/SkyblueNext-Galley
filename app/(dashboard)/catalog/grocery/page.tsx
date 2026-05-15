// app\(dashboard)\catalog\grocery\page.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Star, Trash2, Edit2, X, Upload, Search } from "lucide-react";
import Papa, { ParseResult } from "papaparse";

export default function GroceryCatalog() {
  // State Management
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    type: "grocery",
    name: "",
    category: "",
    subcategory: "",
    unit: "bottle",
    defaultQty: undefined,
    price: 0,
    currency: "INR",
    isAvailable: true,
    isFavorite: false,
    dietaryTags: [],
    allergens: [],
    notes: "",
  };

  const [newItem, setNewItem] = useState<any>(initialFormState);

  // Data Loading from Next.js API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/catalog?type=grocery");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side Filtering
  useEffect(() => {
    let result = [...items];
    if (activeCategory !== "All") {
      result = result.filter((item) => item.category === activeCategory);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.category.toLowerCase().includes(lowerSearch),
      );
    }
    setFilteredItems(result);
  }, [items, searchTerm, activeCategory]);

  // Handlers
  const handleSaveItem = async () => {
    // Validation
    if (!newItem.name || !newItem.category) {
      alert("Item Name and Category are required!");
      return;
    }

    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewItem(initialFormState);
        await loadData(); // Instant refresh
      }
    } catch (error) {
      alert("Failed to save item.");
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await fetch(`/api/catalog?id=${itemToDelete.id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== itemToDelete.id)); // Instant UI update
      setItemToDelete(null);
    }
  };

  const toggleFavorite = async (item: any) => {
    const updatedItem = { ...item, isFavorite: !item.isFavorite };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));

    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
  };

  const toggleTag = (type: "dietaryTags" | "allergens", tag: string) => {
    const currentTags = newItem[type] || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    setNewItem({ ...newItem, [type]: updatedTags });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,

      skipEmptyLines: true,

      complete: async (results: ParseResult<any>) => {
        const itemsToSave = results.data.map((row) => ({
          type: "grocery",

          name: row.name || "Unnamed Item",

          category: row.category || "General",

          subcategory: row.subcategory || "",

          unit: row.unit || "bottle",

          defaultQty: row.defaultQty ? Number(row.defaultQty) : null,

          // ✅ PRICE
          price: Number(row.price) || 0,

          // ✅ CURRENCY
          currency: row.currency || "INR",

          // ✅ ENABLE / DISABLE
          isAvailable:
            String(row.isAvailable).toLowerCase() === "false" ? false : true,

          // ✅ FAVORITE
          isFavorite: String(row.isFavorite).toLowerCase() === "true",

          dietaryTags: row.dietaryTags
            ? row.dietaryTags.split(",").map((t: string) => t.trim())
            : [],

          allergens: row.allergens
            ? row.allergens.split(",").map((t: string) => t.trim())
            : [],

          notes: row.notes || "",
        }));

        const res = await fetch("/api/catalog", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(itemsToSave),
        });

        if (res.ok) {
          alert("Upload successful!");

          await loadData();
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const categories = [
    "All",
    "Alcohol",
    "Bakery",
    "Beverages",
    "Dairy",
    "Snacks",
    "Supplies",
  ];
  const dietaryOptions = [
    "Vegan",
    "Vegetarian",
    "Halal",
    "Kosher",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
  ];
  const allergenOptions = [
    "Dairy",
    "Gluten",
    "Nuts",
    "Eggs",
    "Fish",
    "Shellfish",
    "Soy",
    "Sesame",
    "Sulfites",
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grocery Catalog</h1>
          <p className="text-slate-500 text-sm">
            {filteredItems.length} items showing
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 flex items-center justify-center gap-2 text-sm"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => {
              setNewItem(initialFormState);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none bg-[#1868A5] text-white px-4 py-2 rounded-md  flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search + Categories */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#1868A5] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading catalog...
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Left Section - Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleFavorite(item)}
                    className={`p-1 transition-colors ${item.isFavorite ? "text-orange-400" : "text-slate-300 hover:text-slate-400"}`}
                  >
                    <Star
                      className="w-6 h-6"
                      fill={item.isFavorite ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {item.category}
                      {item.subcategory && ` • ${item.subcategory}`}
                    </p>
                  </div>
                </div>

                {/* Right Section - Price & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  {/* Price */}
                  <div className="text-right sm:min-w-[100px]">
                    <p className="text-lg font-bold text-slate-800 whitespace-nowrap">
                      {item?.currency || "INR"} {item?.price || 0}
                    </p>
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-2">
                    {/* Enable / Disable */}
                    <button
                      onClick={async () => {
                        const updated = {
                          ...item,
                          isAvailable:
                            item.isAvailable === false ? true : false,
                        };

                        setItems((prev) =>
                          prev.map((i) => (i.id === item.id ? updated : i)),
                        );

                        await fetch("/api/catalog", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updated),
                        });
                      }}
                      className={`h-10 px-5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                        item.isAvailable !== false
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {item.isAvailable !== false ? "Disable" : "Enable"}
                    </button>

                    {/* Qty - Hidden on very small screens */}
                    <span className="hidden sm:inline text-xs text-slate-500 min-w-[70px] text-center">
                      {item.defaultQty
                        ? `${item.defaultQty} ${item.unit}`
                        : "-"}
                    </span>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setNewItem(item);
                        setIsModalOpen(true);
                      }}
                      className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full max-w-xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">
                {newItem.id ? "Edit Grocery Item" : "Add Grocery Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-black hover:text-white hover:bg-[#1868A5] hover:rotate-180 transition-all duration-300 p-2 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Sparkling Water"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newItem.category || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={newItem.subcategory || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, subcategory: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={newItem.unit || "bottle"}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none"
                  >
                    <option value="portion">portion</option>
                    <option value="piece">piece</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pack">pack</option>
                    <option value="bottle">bottle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Default Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.defaultQty ?? ""}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        defaultQty: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={newItem.price || 0}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        price: Number(e.target.value),
                      })
                    }
                    className="
      w-full
      border
      border-slate-300
      rounded-md
      p-2
      text-sm
      outline-none
    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Currency
                  </label>

                  <select
                    value={newItem.currency || "INR"}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        currency: e.target.value,
                      })
                    }
                    className="
      w-full
      border
      border-slate-300
      rounded-md
      p-2
      text-sm
    "
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!newItem.isFavorite}
                      onChange={(e) =>
                        setNewItem({ ...newItem, isFavorite: e.target.checked })
                      }
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Favorite
                    </span>
                  </label>
                </div>
              </div>

              {/* Tag Groups */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dietary Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag("dietaryTags", tag)}
                      className={`px-3 py-1 text-[10px] sm:text-xs rounded-full border transition-colors ${newItem.dietaryTags?.includes(tag) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Allergens
                </label>
                <div className="flex flex-wrap gap-2">
                  {allergenOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag("allergens", tag)}
                      className={`px-3 py-1 text-[10px] sm:text-xs rounded-full border transition-colors ${newItem.allergens?.includes(tag) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newItem.notes || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-sm h-24 outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="w-full sm:w-auto px-4 py-2 bg-[#1868A5] text-white rounded-md  text-sm font-medium transition-colors"
              >
                {newItem.id ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-medium text-slate-900">Confirm Deletion</h2>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600">
                Are you sure you want to delete{" "}
                <strong>{itemToDelete.name}</strong>?
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setItemToDelete(null)}
                className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
