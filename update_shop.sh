#!/bin/bash
sed -i '' 's/useDeleteShopItemMutation,/useUpdateShopItemMutation, useDeleteShopItemMutation,/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

sed -i '' 's/Trash2,/Trash2, Edit,/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

sed -i '' 's/const \[deleteItem/const \[updateItem, { isLoading: isUpdating }\] = useUpdateShopItemMutation();\n  const \[editItemId, setEditItemId\] = useState<number | null>(null);\n  const \[deleteItem/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

sed -i '' '/const closeModal = () => {/,/setPreviewUrl(null);/ {
  /setPreviewUrl(null);/a\
    setEditItemId(null);
}' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

cat << 'INNER_EOF' > shop_submit.txt
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
      if (editItemId) {
        await updateItem({ id: editItemId, data: payload }).unwrap();
        toast.success("Shop item updated successfully");
      } else {
        await createItem(payload).unwrap();
        toast.success("Shop item created successfully");
      }
      closeModal();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || \`Failed to \${editItemId ? "update" : "create"} shop item\`);
    }
  };

  const openEditModal = (item: any) => {
    setFormData({
      name: item.name || "",
      gmail: item.gmail || "",
      password: item.password || "",
      price: item.price || "",
      type: item.type || "instant",
      whatsapp: item.whatsapp || "",
      telegram: item.telegram || "",
      description: item.description || "",
    });
    setPreviewUrl(item.logo || null);
    setEditItemId(item.id);
    setIsModalOpen(true);
  };
INNER_EOF

# Replace handleSubmit
perl -0777 -pi -e 's/  const handleSubmit = async.*?  };\n/`cat shop_submit.txt`/se' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

# Add edit button to table row
perl -0777 -pi -e 's/(<td className="px-5 py-3.5 text-right">)/$1\n                          <button\n                            onClick={() => openEditModal(item)}\n                            className="w-8 h-8 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 active:bg-indigo-200 transition-colors mr-2 inline-flex"\n                          >\n                            <Edit size={14} \/>\n                          <\/button>/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

# Add edit button to mobile list
perl -0777 -pi -e 's/(\{?\/\* Delete \*\/\}?)\n                    (<button\n                      onClick=\{\(\) => openDeleteModal\(item\.id\)\})/<button\n                      onClick={() => openEditModal(item)}\n                      className="w-9 h-9 rounded-xl border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 active:bg-indigo-200 transition-colors mr-2"\n                    >\n                      <Edit size={15} \/>\n                    <\/button>\n                    $1\n                    $2/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

# Change create product text to dynamic
perl -0777 -pi -e 's/>\n\s*Create Product\n\s*<\/button>/>\n                {editItemId ? "Update Product" : "Create Product"}\n              <\/button>/g' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

perl -0777 -pi -e 's/>\n\s*Add New Product\n\s*<\/h3>/>\n                {editItemId ? "Edit Product" : "Add New Product"}\n              <\/h3>/g' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

perl -0777 -pi -e 's/disabled=\{isCreating\}/disabled={isCreating || isUpdating}/g' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

