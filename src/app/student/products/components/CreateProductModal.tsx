import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useStudentCreateProductMutation } from '@/lib/api/student/products';

export default function CreateProductModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({ botName: '', country: '', amount: '' });
  const [createProduct, { isLoading }] = useStudentCreateProductMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        botName: formData.botName,
        countryCodes: formData.country.split(',').map((c) => c.trim()).filter(Boolean),
        totalAmount: Number(formData.amount) || 0,
      }).unwrap();

      alert('Product created successfully!');
      setFormData({ botName: '', country: '', amount: '' });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit product');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-extrabold text-gray-900">
              Submit New Product
            </h2>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Fill in the product details below
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Bot Name Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Bot Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.botName}
              onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
              className="w-full px-4 py-3 text-[13px] font-medium text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 bg-white hover:border-gray-400"
              placeholder="e.g. TradeBot Pro"
            />
          </div>
 
          {/* Country Codes Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Country Codes <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 text-[13px] font-medium text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 bg-white hover:border-gray-400"
              placeholder="e.g. US, UK"
            />
            <p className="text-[10px] text-gray-400 mt-1 font-medium">
              Separate multiple countries with commas
            </p>
          </div>
 
          {/* Amount Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Amount (৳) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-600 font-bold text-sm">৳</span>
              </div>
              <input
                required
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-9 pr-4 py-3 text-[13px] font-medium text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 bg-white hover:border-gray-400"
                placeholder="e.g. 49.99"
              />
            </div>
          </div>
 
          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}