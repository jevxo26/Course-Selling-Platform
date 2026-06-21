"use client";

import React, { useState } from "react";
import {
  useGetShopItemsQuery,
  useCreateShopItemMutation,
  useDeleteShopItemMutation,
} from "@/lib/api/shopApi";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  ShoppingBag,
  Package,
  Mail,
  X,
  RefreshCw,
  TrendingUp,
  KeyRound,
  Upload,
} from "lucide-react";
import Image from "next/image";

export default function AdminShopPage() {
  const {
    data: shopData,
    isLoading,
    refetch,
  } = useGetShopItemsQuery({ page: 1, limit: 100 });
  const [createItem, { isLoading: isCreating }] = useCreateShopItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteShopItemMutation();

  const shopItems: any[] = shopData?.items || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    password: "",
    price: "",
    type: "instant",
    whatsapp: "",
    telegram: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      return toast.error("Name is required");
    }
    const payload = new FormData();
    payload.append("name", formData.name);
    if (formData.gmail) payload.append("gmail", formData.gmail);
    if (formData.password) payload.append("password", formData.password);
    if (formData.price) payload.append("price", formData.price);
    if (file) payload.append("logo", file);
    
    payload.append("type", formData.type);
    if (formData.whatsapp) payload.append("whatsapp", formData.whatsapp);
    if (formData.telegram) payload.append("telegram", formData.telegram);
    if (formData.description) payload.append("description", formData.description);
    try {
      await createItem(payload).unwrap();
      toast.success("Shop item created successfully");
      closeModal();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create shop item");
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    setDeletingId(itemToDelete);
    try {
      await deleteItem(itemToDelete).unwrap();
      toast.success("Item deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", gmail: "", password: "", price: "", type: "instant", whatsapp: "", telegram: "", description: "" });
    setFile(null);
    setPreviewUrl(null);
  };

  const totalRevenue = shopItems.reduce(
    (sum: number, item: any) => sum + Number(item.price || 0),
    0,
  );

  // Format currency in BDT
  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className=" mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
        {/* ═══ HEADER CARD ═══ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Gradient top band */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Left: icon + title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-[17px] sm:text-[22px] font-extrabold text-white tracking-tight leading-none">
                    Shop Management
                  </h1>
                  <p className="text-[11px] sm:text-[12px] text-blue-200 mt-1 font-medium">
                    Create, manage and organize your shop products
                  </p>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <TrendingUp size={12} />
                  {shopItems.length} Products
                </span>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-white/25 active:bg-white/30 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-white text-blue-600 text-[12px] font-extrabold px-4 py-2 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-lg"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Stats bar — 3 cols always, compact on mobile */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            {[
              {
                label: "Products",
                value: shopItems.length,
                icon: Package,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Total Revenue",
                value: formatBDT(totalRevenue),
                icon: TrendingUp,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Avg. Price",
                value: shopItems.length
                  ? formatBDT(totalRevenue / shopItems.length)
                  : "৳০.০০",
                icon: TrendingUp,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={14} className={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                    {label}
                  </p>
                  <p className="text-[14px] sm:text-[18px] font-extrabold text-gray-900 leading-none mt-0.5 truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ PRODUCT LIST ═══ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 className="animate-spin text-blue-500" size={28} />
              <p className="text-[12px] font-semibold">Loading products...</p>
            </div>
          ) : shopItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 px-4">
              <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center">
                <ShoppingBag size={24} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-gray-400">
                  No products yet
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Click "Add Product" to get started
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus size={13} />
                Add Product
              </button>
            </div>
          ) : (
            <>
              {/* ── Desktop table (hidden below md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      {["Product", "Contact", "Price", "Actions"].map((h) => (
                        <th
                          key={h}
                          className={`px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap ${h === "Actions" ? "text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {shopItems.map((item: any) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {/* Product */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {item.logo ? (
                              <Image
                                src={item.logo}
                                alt={item.name}
                                width={44}
                                height={44}
                                className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <ImageIcon
                                  size={18}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-[13px] font-bold text-gray-900 leading-none">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                ID: {item.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Mail
                              size={12}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-[12px] text-gray-600 font-semibold">
                              {item.gmail}
                            </span>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-extrabold text-gray-900">
                            ৳{Number(item.price).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => openDeleteModal(item.id)}
                            disabled={deletingId === item.id}
                            className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50 ml-auto"
                          >
                            {deletingId === item.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile card list (hidden on md+) ── */}
              <div className="md:hidden divide-y divide-gray-100">
                {shopItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50/20 active:bg-blue-50/40 transition-colors"
                  >
                    {/* Logo */}
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">
                          {item.name}
                        </p>
                        <span className="text-[13px] font-extrabold text-emerald-600 shrink-0">
                          ৳{Number(item.price).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail size={10} className="text-gray-400 shrink-0" />
                        <p className="text-[11px] text-gray-500 font-medium truncate">
                          {item.gmail}
                        </p>
                      </div>
                      <p className="text-[9px] text-gray-300 font-mono mt-0.5">
                        ID: {item.id}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => openDeleteModal(item.id)}
                      disabled={deletingId === item.id}
                      className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer count */}
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[11px] text-gray-400 font-semibold">
                  Showing{" "}
                  <span className="text-gray-700 font-bold">
                    {shopItems.length}
                  </span>{" "}
                  product{shopItems.length !== 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ CREATE MODAL — bottom sheet on mobile, centered on sm+ ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95dvh] sm:max-h-[92vh]">
            {/* Drag handle (mobile only) */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />

            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 sm:py-5 flex items-center justify-between flex-shrink-0 mt-1 sm:mt-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-black text-white">
                    Add New Product
                  </h2>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    Fill in all required fields
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isCreating}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white/70 hover:bg-white/20 active:bg-white/30 transition-all disabled:opacity-60"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5 overflow-y-auto flex-1 space-y-4">
              {/* Logo upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload size={11} className="text-slate-400" />
                  Logo / Cover Image
                </label>
                <label className="relative cursor-pointer group">
                  <div
                    className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${previewUrl
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
                      }`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-contain rounded-xl p-1"
                      />
                    ) : (
                      <>
                        <ImageIcon
                          size={24}
                          className="text-slate-300 group-hover:text-blue-400 transition-colors"
                        />
                        <p className="text-[11px] text-slate-400 font-semibold group-hover:text-blue-500 transition-colors">
                          Tap to upload image
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                {file && (
                  <p className="text-[10px] text-slate-400 truncate">
                    📎 {file.name}
                  </p>
                )}
              </div>

              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={11} className="text-slate-400" />
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Starter Template"
                  className="w-full px-3.5 py-3 text-[13px] font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Type Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  Product Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "instant" })}
                    className={`py-3 rounded-xl border-2 text-[13px] font-bold transition-all ${
                      formData.type === "instant"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"
                    }`}
                  >
                    Instant Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "manual" })}
                    className={`py-3 rounded-xl border-2 text-[13px] font-bold transition-all ${
                      formData.type === "manual"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"
                    }`}
                  >
                    Manual Delivery
                  </button>
                </div>
              </div>

              {/* Gmail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={11} className="text-slate-400" />
                  Gmail <span className="text-slate-400 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.gmail}
                  onChange={(e) =>
                    setFormData({ ...formData, gmail: e.target.value })
                  }
                  placeholder="contact@example.com"
                  className="w-full px-3.5 py-3 text-[13px] font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound size={11} className="text-slate-400" />
                  Password <span className="text-slate-400 normal-case font-normal">(optional, min 6 chars)</span>
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Secret access key"
                  className="w-full px-3.5 py-3 text-[13px] font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Conditional Manual Inputs */}
              {formData.type === "manual" && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="+8801..."
                      className="w-full px-3 py-2.5 text-[13px] font-semibold border border-orange-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) =>
                        setFormData({ ...formData, telegram: e.target.value })
                      }
                      placeholder="@username"
                      className="w-full px-3 py-2.5 text-[13px] font-semibold border border-orange-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  Description <span className="text-slate-400 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Details about this product..."
                  rows={3}
                  className="w-full px-3.5 py-3 text-[13px] font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-base font-bold text-slate-700">৳</span>
                  Price <span className="text-slate-400 normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold text-sm">৳</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="০.০০"
                    className="w-full pl-10 pr-3.5 py-3 text-[13px] font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 sm:py-5 border-t border-slate-100 bg-slate-50/80 flex gap-3 flex-shrink-0 safe-bottom">
              <button
                onClick={closeModal}
                disabled={isCreating}
                className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-white hover:border-slate-300 active:bg-slate-50 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-60"
              >
                {isCreating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !deletingId && setDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-5 flex flex-col gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-[18px] font-black text-slate-900 text-center">
                Delete Product?
              </h3>
              <p className="text-[13px] text-slate-500 font-medium text-center leading-relaxed">
                Are you sure you want to delete this product? This action cannot be undone and will permanently remove the item from your shop.
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex flex-col-reverse sm:flex-row items-center gap-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deletingId !== null}
                className="w-full sm:w-1/2 py-3.5 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="w-full sm:w-1/2 py-3.5 rounded-xl text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all disabled:opacity-50"
              >
                {deletingId !== null ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Delete Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}