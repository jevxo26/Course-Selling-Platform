#!/bin/bash
# First add the import
sed -i '' 's/import Image from "next\/image";/import Image from "next\/image";\nimport { uploadImageToImgBB } from "@\/lib\/images.upload";/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

cat << 'INNER_EOF' > shop_submit.txt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      return toast.error("Name is required");
    }
    
    // First, upload to ImgBB if there's a new file
    let finalLogoUrl: string | null = null;
    if (file) {
      const loadingToastId = toast.loading("Uploading image...");
      try {
        finalLogoUrl = await uploadImageToImgBB(file);
        toast.dismiss(loadingToastId);
      } catch (err) {
        toast.dismiss(loadingToastId);
        return toast.error("Image upload failed! Please try again.");
      }
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    if (formData.gmail) payload.append("gmail", formData.gmail);
    if (formData.password) payload.append("password", formData.password);
    if (formData.price) payload.append("price", formData.price);
    
    // If a new file was uploaded, use the ImgBB URL. Else if it's an edit, the backend will keep the old one or we just don't pass logo
    if (finalLogoUrl) {
      payload.append("logo", finalLogoUrl);
    }
    
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
INNER_EOF

# Replace handleSubmit
perl -0777 -pi -e 's/  const handleSubmit = async.*?  };\n/`cat shop_submit.txt`/se' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/shop/page.tsx

