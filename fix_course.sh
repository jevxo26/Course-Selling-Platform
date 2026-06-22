#!/bin/bash
cat << 'INNER_EOF' > course_submit.txt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Course title is required");

    let finalThumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const loadingToastId = toast.loading("Uploading course thumbnail...");
      try {
        finalThumbnailUrl = await uploadImageToImgBB(thumbnailFile);
        toast.dismiss(loadingToastId);
      } catch (err) {
        toast.dismiss(loadingToastId);
        return toast.error("Image upload failed! Please try again.");
      }
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("price", formData.price.toString());
    if (formData.instructorId) payload.append("instructorId", formData.instructorId.toString());
    if (formData.categoryId) payload.append("categoryId", formData.categoryId.toString());
    if (formData.status) payload.append("status", formData.status);
    if (finalThumbnailUrl) payload.append("thumbnail", finalThumbnailUrl);

    try {
      if (initialData?.id) {
        await updateCourse({ id: initialData.id, data: payload }).unwrap();
        toast.success("Course updated successfully");
      } else {
        await createCourse(payload).unwrap();
        toast.success("Course created successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save course");
    }
  };
INNER_EOF
perl -0777 -pi -e 's/  const handleSubmit = async.*?  };\n/`cat course_submit.txt`/se' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/courses/components/CourseFormModal.tsx
sed -i '' 's/uploadImageToBackend/uploadImageToImgBB/' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/app/admin/courses/components/CourseFormModal.tsx

