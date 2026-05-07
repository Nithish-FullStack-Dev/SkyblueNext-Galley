// app\catalog\food\page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { Plus, Star, Trash2, Edit2, X, Upload, Search } from "lucide-react";

export default function FoodCatalog() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState<any>({
    type: "food",
    name: "",
    category: "",
    subcategory: "",
    unit: "portion",
    defaultQty: 1,
    isFavorite: false,
    dietaryTags: [],
    allergens: [],
    notes: "",
  });

  const loadData = async () => {
    const res = await fetch("/api/catalog?type=food");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.category) {
      alert("Please fill in required fields (Name and Category)");
      return;
    }

    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      setIsModalOpen(false);
      loadData(); // Instant refresh
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await fetch(`/api/catalog?id=${itemToDelete.id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== itemToDelete.id)); // Instant UI removal
      setItemToDelete(null);
    }
  };

  const toggleFavorite = async (item: any) => {
    const updated = { ...item, isFavorite: !item.isFavorite };
    setItems(items.map((i) => (i.id === item.id ? updated : i))); // Optimistic UI
    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results) => {
        const itemsToSave = (results.data as any[]).map((row) => ({
          type: "food",

          name: row.name || "Unnamed Item",

          category: row.category || "Appetizers",

          subcategory: row.subcategory || "",

          unit: row.unit || "portion",

          defaultQty: Number(row.defaultQty) || 1,

          // ✅ PRICE
          price: Number(row.price) || 0,

          // ✅ CURRENCY
          currency: row.currency || "INR",

          // ✅ ENABLE / DISABLE
          isAvailable: row.isAvailable === "false" ? false : true,

          // ✅ FAVORITE
          isFavorite: row.isFavorite === "true" ? true : false,

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
          alert(`Successfully imported ${itemsToSave.length} items!`);

          loadData();
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };
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
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCat =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });
  const toggleTag = (type: "dietaryTags" | "allergens", tag: string) => {
    const currentTags = newItem[type] || [];
    if (currentTags.includes(tag)) {
      setNewItem({
        ...newItem,
        [type]: currentTags.filter((t: string) => t !== tag),
      });
    } else {
      setNewItem({ ...newItem, [type]: [...currentTags, tag] });
    }
  };
  const categories = [
    "All",
    "Appetizers",
    "Desserts",
    "Main Course",
    "Salads",
    "Soups",
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Food Catalog</h1>
          <p className="text-slate-500 text-sm">
            {items.length} items cataloged
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
              setNewItem({
                type: "food",
                name: "",
                category: "",
                unit: "portion",
                defaultQty: 1,
                dietaryTags: [],
                allergens: [],
              });
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Table/Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${cat === activeCategory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading catalog...
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() => toggleFavorite(item)}
                    className={`p-1 transition-colors ${item.isFavorite ? "text-orange-400" : "text-slate-300 hover:text-slate-400"}`}
                  >
                    <Star
                      className="w-5 h-5"
                      fill={item.isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">
                      {item?.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item?.category} • {item?.defaultQty} {item?.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* PRICE */}
                  <div className="min-w-[90px] text-right">
                    <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {item?.currency} {item?.price}
                    </p>
                  </div>

                  {/* ENABLE / DISABLE */}
                  <button
                    onClick={async () => {
                      const updated = {
                        ...item,
                        isAvailable: item.isAvailable === false ? true : false,
                      };

                      setItems((prev) =>
                        prev.map((i) => (i.id === item.id ? updated : i)),
                      );

                      await fetch("/api/catalog", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updated),
                      });
                    }}
                    className={`
      h-9
      min-w-[88px]
      rounded-full
      px-4
      text-xs
      font-semibold
      transition-all
      flex
      items-center
      justify-center
      ${
        item.isAvailable !== false
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
      }
    `}
                  >
                    {item.isAvailable !== false ? "Disable" : "Enable"}
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() => {
                      setNewItem(item);
                      setIsModalOpen(true);
                    }}
                    className="
      h-9
      w-9
      rounded-xl
      flex
      items-center
      justify-center
      text-slate-400
      hover:text-blue-600
      hover:bg-blue-50
      transition-all
    "
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="
      h-9
      w-9
      rounded-xl
      flex
      items-center
      justify-center
      text-slate-400
      hover:text-red-600
      hover:bg-red-50
      transition-all
    "
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full max-w-xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">
                {newItem.id ? "Edit Food Item" : "Add Food Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
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
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Smoked Salmon Canapés"
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
                    <option value="">Select...</option>
                    <option value="Appetizers">Appetizers</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Salads">Salads</option>
                    <option value="Soups">Soups</option>
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
                    value={newItem.unit || "portion"}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none"
                  >
                    <option value="portion">portion</option>
                    <option value="piece">piece</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Default Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.defaultQty || 1}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        defaultQty: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Price
                    </label>

                    <input
                      type="number"
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
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                {newItem.id ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
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
              <p className="text-sm text-slate-500 mt-2">
                This action cannot be undone.
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
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
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
