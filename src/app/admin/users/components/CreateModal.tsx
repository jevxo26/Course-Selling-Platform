// components/admin/users/CreateModal.tsx
import React, { useState } from "react";
import { UserPlus, X, Check, Loader2 } from "lucide-react";
import { Role } from "./types";

export function CreateModal({
  loading,
  onClose,
  onCreate,
}: {
  loading: boolean;
  onClose: () => void;
  onCreate: (p: {
    name: string;
    email: string;
    phone: string;
    country: string;
    password: string;
    photo?: string | null;
    role?: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    photo: "",
    role: "student" as Role,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set =
    (k: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.country.trim()) e.country = "Required";
    if (form.password.trim().length < 6) e.password = "Min 6 characters";
    setErrors(e);
    if (Object.keys(e).length) return;
    onCreate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      country: form.country.trim(),
      password: form.password.trim(),
      photo: form.photo.trim() || null,
      role: form.role.toLowerCase(),
    });
  };

  const Field = ({
    label,
    fkey,
    type = "text",
    placeholder = "",
  }: {
    label: string;
    fkey: keyof typeof form;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        value={form[fkey]}
        onChange={set(fkey)}
        type={type}
        placeholder={placeholder}
        className={`w-full h-10 px-3.5 text-[13px] font-medium text-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all placeholder:text-gray-400 ${errors[fkey] ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
      />
      {errors[fkey] && (
        <p className="text-[11px] text-red-500 mt-1 font-medium">{errors[fkey]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-gray-200">
        {/* Drag handle for mobile */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 mt-1 sm:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <UserPlus size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900">
                Add New User
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">POST /auth/register</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" fkey="name" placeholder="John Doe" />
            <Field label="Email" fkey="email" placeholder="john@example.com" />
            <Field label="Phone" fkey="phone" placeholder="+8801..." />
            <Field label="Country" fkey="country" placeholder="Bangladesh" />
            <Field label="Password" fkey="password" type="password" placeholder="••••••••" />
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                value={form.role}
                onChange={set("role")}
                className="w-full h-10 px-3.5 text-[13px] font-medium text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white hover:border-gray-400 transition-all"
              >
                <option value="student">Student</option>
                <option value="affiliate">Affiliate</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <Field
            label="Photo URL (optional)"
            fkey="photo"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50/80 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-[13px] font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200 transition-all disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}