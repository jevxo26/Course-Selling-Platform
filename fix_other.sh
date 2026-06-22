#!/bin/bash
# For CategoryManager
cat << 'INNER_EOF' > category_submit.txt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Category name is required");

    let finalImageUrl: string | null = null;
    if (imageFile) {
      const loadingToastId = toast.loading("Uploading category image...");
      try {
        finalImageUrl = await uploadImageToImgBB(imageFile);
        toast.dismiss(loadingToastId);
      } catch (err) {
        toast.dismiss(loadingToastId);
        return toast.error("Image upload failed! Please try again.");
      }
    }

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    if (formData.description) payload.append("description", formData.description.trim());
    if (finalImageUrl) payload.append("image", finalImageUrl);

    try {
      if (editCategoryId) {
        await updateCategory({ id: editCategoryId, data: payload }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save category");
    }
  };
INNER_EOF
perl -0777 -pi -e 's/  const handleSubmit = async.*?  };\n/`cat category_submit.txt`/se' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/categories/components/CategoryManager.tsx
sed -i '' 's/import { Plus, Trash2,/import { Plus, Trash2, Edit,/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/categories/components/CategoryManager.tsx
sed -i '' '/import { Plus, Trash2/i\
import { uploadImageToImgBB } from "@/lib/images.upload";
' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/categories/components/CategoryManager.tsx

