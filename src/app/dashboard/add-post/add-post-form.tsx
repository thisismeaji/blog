"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import TextEditor from "@/components/text-editor";
import { ArrowLeft, CloudUpload, Calendar, Globe, Settings, Eye, Save, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function AddPostForm({
  initialPostData,
  initialCategories = [],
  initialUsers = [],
  editId,
}: {
  initialPostData?: any;
  initialCategories?: any[];
  initialUsers?: any[];
  editId?: number;
}) {
  const router = useRouter();
  const [sessionSavedId, setSessionSavedId] = useState<number | null>(null);
  const isInitializing = useRef(true);

  // Post States
  const [title, setTitle] = useState(initialPostData?.header || "Untitled Article");
  const [editorContent, setEditorContent] = useState(initialPostData?.content || "");
  const [publishDate, setPublishDate] = useState<Date | undefined>(() =>
    initialPostData?.publishDate ? new Date(initialPostData.publishDate) : new Date()
  );

  // Computed Status based on publishDate
  const computedStatus = useMemo(() => {
    if (!publishDate) return "draft";
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const compareDate = new Date(publishDate);
    compareDate.setHours(0, 0, 0, 0);
    if (compareDate > today) {
      return "scheduled";
    }
    return "draft";
  }, [publishDate]);

  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [users, setUsers] = useState<any[]>(initialUsers);

  // Initialize category as the resolved slug directly
  const [category, setCategory] = useState(() => {
    if (initialPostData?.type && initialCategories) {
      const matchedCat = initialCategories.find(
        (c: any) => c.header.toLowerCase() === initialPostData.type.toLowerCase()
      );
      if (matchedCat) return matchedCat.type.toLowerCase();
    }
    return initialPostData?.type ? initialPostData.type.toLowerCase() : "technology";
  });

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialPostData?.tags || []);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialPostData?.uploadedImage || null);

  // SEO States
  const [focusKeyword, setFocusKeyword] = useState(initialPostData?.focusKeyword || "");
  const [seoTitle, setSeoTitle] = useState(initialPostData?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialPostData?.metaDescription || "");
  const [slug, setSlug] = useState(initialPostData?.slug || "");
  const [isManualSlug, setIsManualSlug] = useState(!!initialPostData?.slug);
  const [schemaType, setSchemaType] = useState(initialPostData?.schemaType || "article");
  const [canonicalUrl, setCanonicalUrl] = useState(initialPostData?.canonicalUrl || "");

  // Post Metadata States
  const [author, setAuthor] = useState(initialPostData?.reviewer || "Admin");
  const [excerpt, setExcerpt] = useState(initialPostData?.excerpt || "");
  const [isPinned, setIsPinned] = useState(initialPostData?.isPinned !== undefined ? initialPostData.isPinned : false);
  const [allowComments, setAllowComments] = useState(initialPostData?.allowComments !== undefined ? initialPostData.allowComments : true);

  // Mobile Drawer Sheets States
  const [leftOpenMobile, setLeftOpenMobile] = useState(false);
  const [rightOpenMobile, setRightOpenMobile] = useState(false);

  // Action/Loading & Saving States
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Strip HTML and calculate word count
  const wordCount = useMemo(() => {
    if (!editorContent) return 0;
    const cleanText = editorContent.replace(/<[^>]*>/g, " ").trim();
    return cleanText === "" ? 0 : cleanText.split(/\s+/).filter(Boolean).length;
  }, [editorContent]);

  // Compute SEO analysis
  const seoChecklist = useMemo(() => {
    const keywordLower = focusKeyword.trim().toLowerCase();
    const titleLower = title.toLowerCase();
    const seoTitleLower = seoTitle.toLowerCase() || titleLower;
    const slugLower = slug.toLowerCase();
    const metaLower = metaDescription.toLowerCase();

    const hasKeyword = keywordLower !== "";

    return [
      {
        label: "Focus keyphrase set",
        passed: hasKeyword,
      },
      {
        label: "Keyphrase in article title",
        passed: hasKeyword && titleLower.includes(keywordLower),
      },
      {
        label: "Keyphrase in SEO title",
        passed: hasKeyword && seoTitleLower.includes(keywordLower),
      },
      {
        label: "Keyphrase in URL Slug",
        passed: hasKeyword && slugLower.includes(keywordLower.replace(/\s+/g, "-")),
      },
      {
        label: "Keyphrase in Meta Description",
        passed: hasKeyword && metaLower.includes(keywordLower),
      },
      {
        label: "Meta Description length is correct (120-160 chars)",
        passed: metaDescription.length >= 120 && metaDescription.length <= 160,
      },
      {
        label: "Content length is sufficient (at least 300 words)",
        passed: wordCount >= 300,
      },
    ];
  }, [focusKeyword, title, seoTitle, slug, metaDescription, wordCount]);

  // Calculate SEO score
  const seoScore = useMemo(() => {
    const passedCount = seoChecklist.filter(check => check.passed).length;
    return Math.round((passedCount / seoChecklist.length) * 100);
  }, [seoChecklist]);

  useEffect(() => {
    if (!isManualSlug) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
      setCanonicalUrl(generatedSlug);
    }
  }, [title, isManualSlug]);

  // Real periodic Autosave function
  const handleAutosave = async () => {
    if (!title || title.trim() === "" || title.trim() === "Untitled Article") {
      setSaveStatus("idle");
      return;
    }
    const cleanText = editorContent.replace(/<[^>]*>/g, "").trim();
    if (cleanText === "") {
      setSaveStatus("idle");
      return;
    }

    try {
      const selectedCat = categories.find(
        (c) => c.type.toLowerCase() === category.toLowerCase() || c.header.toLowerCase() === category.toLowerCase()
      );
      const categoryName = selectedCat ? selectedCat.header : category.charAt(0).toUpperCase() + category.slice(1);
      const postData: any = {
        header: title,
        type: categoryName,
        status: "In Process", // Autosaves are always drafts
        reviewer: author,
        content: editorContent,
        excerpt,
        tags,
        uploadedImage,
        focusKeyword,
        seoTitle,
        slug,
        metaDescription,
        schemaType,
        canonicalUrl,
        allowComments,
        isPinned,
      };

      const currentId = editId || sessionSavedId;

      if (!currentId) {
        postData.target = "0";
        postData.limit = "0";
      }

      const res = await fetch("/api/posts", {
        method: currentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentId ? { id: Number(currentId), ...postData } : postData),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveStatus("saved");

        if (!currentId && data.post && data.post.id) {
          setSessionSavedId(data.post.id);
          const newUrl = `${window.location.pathname}?id=${data.post.id}`;
          window.history.replaceState(null, "", newUrl);
        }
      } else {
        setSaveStatus("idle");
      }
    } catch (err) {
      console.error("Autosave error", err);
      setSaveStatus("idle");
    }
  };

  // Global Autosave Effect (debounced 2 seconds)
  useEffect(() => {
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      handleAutosave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    title,
    editorContent,
    computedStatus,
    publishDate,
    category,
    tags,
    uploadedImage,
    focusKeyword,
    seoTitle,
    slug,
    metaDescription,
    schemaType,
    canonicalUrl,
    author,
    excerpt,
    isPinned,
    allowComments,
  ]);

  // Prevent leaving page during active saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "Changes are still saving. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus]);

  // Handle Tags Creation
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "," || e.key === ";" || e.key === "Tab") && tagInput.trim() !== "") {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/[;,]/g, "").trim();
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toast actions
  const handlePublish = async () => {
    if (!title || title.trim() === "" || title.trim() === "Untitled Article") {
      toast.error("Publish Failed", {
        description: "Please enter a valid title before publishing.",
      });
      return;
    }

    const cleanText = editorContent.replace(/<[^>]*>/g, "").trim();
    if (cleanText === "") {
      toast.error("Publish Failed", {
        description: "Please write some story content before publishing.",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const selectedCat = categories.find(
        (c) => c.type.toLowerCase() === category.toLowerCase() || c.header.toLowerCase() === category.toLowerCase()
      );
      const categoryName = selectedCat ? selectedCat.header : category.charAt(0).toUpperCase() + category.slice(1);
      const postData: any = {
        header: title,
        type: categoryName,
        status: "Done",
        reviewer: author,
        content: editorContent,
        excerpt,
        tags,
        uploadedImage,
        focusKeyword,
        seoTitle,
        slug,
        metaDescription,
        schemaType,
        canonicalUrl,
        allowComments,
        isPinned,
      };

      const currentId = editId || sessionSavedId;

      if (!currentId) {
        postData.target = "0";
        postData.limit = "0";
      }

      const res = await fetch("/api/posts", {
        method: currentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentId ? { id: Number(currentId), ...postData } : postData),
      });

      if (res.ok) {
        toast.success(editId ? "Post Updated Successfully!" : "Post Published Successfully!", {
          description: `"${title}" has been saved under ${categoryName.toUpperCase()}.`,
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/post");
        }, 1000);
      } else {
        toast.error(editId ? "Failed to update post" : "Failed to publish post");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during publishing");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title || title.trim() === "") {
      toast.error("Save Draft Failed", {
        description: "Please enter a title.",
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    try {
      const selectedCat = categories.find(
        (c) => c.type.toLowerCase() === category.toLowerCase() || c.header.toLowerCase() === category.toLowerCase()
      );
      const categoryName = selectedCat ? selectedCat.header : category.charAt(0).toUpperCase() + category.slice(1);
      const postData: any = {
        header: title,
        type: categoryName,
        status: "In Process",
        reviewer: author,
        content: editorContent,
        excerpt,
        tags,
        uploadedImage,
        focusKeyword,
        seoTitle,
        slug,
        metaDescription,
        schemaType,
        canonicalUrl,
        allowComments,
        isPinned,
      };

      const currentId = editId || sessionSavedId;

      if (!currentId) {
        postData.target = "0";
        postData.limit = "0";
      }

      const res = await fetch("/api/posts", {
        method: currentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentId ? { id: Number(currentId), ...postData } : postData),
      });

      if (res.ok) {
        setSaveStatus("saved");
        toast.info("Draft Saved Successfully!", {
          description: `"${title}" is saved as a draft.`,
          duration: 3000,
        });
        if (!currentId) {
          const data = await res.json();
          if (data.post && data.post.id) {
            setSessionSavedId(data.post.id);
            const newUrl = `${window.location.pathname}?id=${data.post.id}`;
            window.history.replaceState(null, "", newUrl);
          }
        }
      } else {
        setSaveStatus("idle");
        toast.error("Failed to save draft");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("idle");
      toast.error("An error occurred while saving draft");
    } finally {
      setIsSaving(false);
    }
  };

  const renderLeftSidebarContent = () => (
    <>
      <SidebarHeader className="border-b border-sidebar-border h-(--header-height) flex flex-row items-center px-4 py-0 select-none shrink-0 bg-sidebar">
        <div className="text-base font-semibold text-foreground">Post Details</div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-0 overflow-y-auto overflow-x-hidden">
        <SidebarGroup className="p-4">
          <SidebarGroupContent className="space-y-4">
            {/* Featured Image */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="relative w-full h-24 rounded-lg border overflow-hidden flex items-center justify-center bg-muted/30 select-none">
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} alt="Featured" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/60">
                    <CloudUpload className="size-5" />
                    <span className="text-xs font-medium text-muted-foreground/60">No image selected</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-1.5 w-full h-8 px-3 text-xs border rounded-md hover:bg-muted cursor-pointer transition-colors font-medium"
                >
                  <CloudUpload className="size-3.5 text-muted-foreground" />
                  Upload Custom Image
                </Label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            {/* Author Selection */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select value={author} onValueChange={setAuthor}>
                <SelectTrigger id="author" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.length > 0 ? (
                    <>
                      {!users.some((u) => u.header.toLowerCase() === "admin") && <SelectItem value="Admin">Admin</SelectItem>}
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.header}>
                          {u.header}
                        </SelectItem>
                      ))}
                    </>
                  ) : (
                    <>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                      <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                      <SelectItem value="Thomas Wilson">Thomas Wilson</SelectItem>
                      <SelectItem value="Raj Patel">Raj Patel</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.type.toLowerCase()}>
                        {cat.header}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="opinion">Opinion</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tags section */}
            <div className="space-y-2">
              <Label htmlFor="tags-input">Article Tags</Label>
              <Input
                id="tags-input"
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag}
                  </Badge>
                ))}
                {tags.length === 0 && <span className="text-xs text-muted-foreground italic">No tags added.</span>}
              </div>
            </div>

            {/* Excerpt Summary */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
              <Textarea
                id="excerpt"
                placeholder="Write a brief excerpt for website feed..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-16"
              />
            </div>

            {/* Publish Date */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="publish-date">Publish Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="publish-date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal h-9", !publishDate && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 size-4 text-muted-foreground" />
                    {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadcnCalendar mode="single" selected={publishDate} onSelect={setPublishDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="pin-post">
                    Pin to Homepage
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Feature this article at the top of feed.</p>
                </div>
                <Checkbox id="pin-post" checked={isPinned} onCheckedChange={(checked) => setIsPinned(checked === true)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="allow-comments">
                    Allow Comments
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Enable comments section below post.</p>
                </div>
                <Checkbox
                  id="allow-comments"
                  checked={allowComments}
                  onCheckedChange={(checked) => setAllowComments(checked === true)}
                />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );

  const renderRightSidebarContent = () => (
    <>
      <SidebarHeader className="border-b border-sidebar-border h-(--header-height) flex flex-row items-center px-4 py-0 select-none shrink-0 bg-sidebar">
        <div className="text-base font-semibold text-foreground">SEO Optimization</div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-0 overflow-y-auto overflow-x-hidden">
        <SidebarGroup className="p-4">
          <SidebarGroupContent className="space-y-4">
            {/* Google Search Listing Result snippet */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-emerald-500" />
                Google Search Preview
              </Label>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border select-none">
                <div className="space-y-1">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">
                    <span>https://yourblog.com › posts › </span>
                    <span className="text-zinc-700 dark:text-zinc-300">{slug || "new-article"}</span>
                  </div>
                  <h3 className="text-blue-700 dark:text-blue-400 hover:underline text-sm font-medium leading-tight line-clamp-1 cursor-pointer">
                    {seoTitle || title || "Untitled Article"}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-snug line-clamp-2 pt-0.5">
                    {metaDescription ||
                      "Write a meta description to see how this page snippet will display in Google search results."}
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input
                id="seo-title"
                placeholder={title}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug (Permalink)</Label>
                {isManualSlug && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualSlug(false);
                      const generatedSlug = title
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "");
                      setSlug(generatedSlug);
                      setCanonicalUrl(generatedSlug);
                    }}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    Sync with title
                  </button>
                )}
              </div>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setIsManualSlug(true);
                  const newSlug = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  setSlug(newSlug);
                  setCanonicalUrl(newSlug);
                }}
                placeholder="url-slug"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-description">Meta Description</Label>
                <span
                  className={`text-[10px] font-mono ${
                    metaDescription.length > 160 ? "text-red-500 font-bold" : "text-muted-foreground"
                  }`}
                >
                  {metaDescription.length}/160
                </span>
              </div>
              <Textarea
                id="meta-description"
                placeholder="Enter description snippet for search engines..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="min-h-20"
              />
            </div>

            {/* Focus Keyword */}
            <div className="space-y-2">
              <Label htmlFor="focus-keyword">Focus Keyphrase</Label>
              <Input
                id="focus-keyword"
                placeholder="e.g. web design tips"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
              />
            </div>

            <Separator />

            {/* SEO Scoring & Checklist */}
            <div className="space-y-3 select-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">SEO Metrics</span>
                <Badge
                  className={cn(
                    "font-bold font-mono text-white",
                    seoScore >= 80
                      ? "bg-green-500 hover:bg-green-600"
                      : seoScore >= 50
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  {seoScore}%
                </Badge>
              </div>

              {/* Checklist items */}
              <div className="space-y-2 pt-1">
                {seoChecklist.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] leading-snug">
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0 mt-1",
                        check.passed ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
                      )}
                    />
                    <span className={cn("font-medium", check.passed ? "text-foreground" : "text-muted-foreground")}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Schema Type */}
            <div className="space-y-2">
              <Label htmlFor="schema-type">Schema Type</Label>
              <Select value={schemaType} onValueChange={setSchemaType}>
                <SelectTrigger id="schema-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article (Default)</SelectItem>
                  <SelectItem value="blog-posting">Blog Post</SelectItem>
                  <SelectItem value="news-article">News Article</SelectItem>
                  <SelectItem value="tech-article">Tech Article</SelectItem>
                  <SelectItem value="faq">FAQ Page</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground leading-snug">
                {schemaType === "article" && "Ideal for general articles, opinion pieces, or stories."}
                {schemaType === "blog-posting" && "Optimized for standard blog posts. Improves visibility in blog feeds."}
                {schemaType === "news-article" && "For timely news reports or current affairs stories."}
                {schemaType === "tech-article" && "Best for technical tutorials, guides, and programming articles."}
                {schemaType === "faq" && "For articles structured with a list of questions and answers."}
              </p>
            </div>

            {/* Canonical URL */}
            <div className="space-y-2">
              <Label htmlFor="canonical-url">Canonical URL</Label>
              <Input
                id="canonical-url"
                placeholder="https://example.com/original-article"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Set if this post was originally published elsewhere.</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* COLUMN 1: LEFT SIDEBAR */}
      <Sidebar side="left" className="max-[1400px]:hidden! flex">
        {renderLeftSidebarContent()}
      </Sidebar>

      {/* COLUMN 2: CENTER WORKSPACE */}
      <SidebarInset className="flex flex-col flex-1 min-w-0">
        <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b px-4 lg:px-6 select-none bg-background">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/post"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <div className="text-sm font-semibold text-foreground truncate max-w-[100px] sm:max-w-[200px]">{title || "Untitled Article"}</div>
            <Badge variant="secondary" className="capitalize shrink-0">
              {computedStatus}
            </Badge>

            {/* Global Autosave Indicator */}
            <div className="text-xs text-muted-foreground ml-2 hidden xs:flex items-center gap-1.5 min-w-[70px]">
              {saveStatus === "saving" && (
                <>
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px]">Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500 font-medium animate-in fade-in duration-200">Saved</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Post Details Trigger */}
            <Button
              variant="outline"
              size="icon-sm"
              className="min-[1401px]:hidden"
              onClick={() => setLeftOpenMobile(true)}
              title="Post Details"
            >
              <Settings className="size-4" />
            </Button>

            {/* Mobile SEO Trigger */}
            <Button
              variant="outline"
              size="icon-sm"
              className="min-[1401px]:hidden"
              onClick={() => setRightOpenMobile(true)}
              title="SEO Optimization"
            >
              <Globe className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-4 hidden sm:block" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              className="gap-1.5"
            >
              {isSaving ? (
                <span className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPublishing ? (
                <span className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </header>

        {/* Main Editing Canvas Area */}
        <ScrollArea className="flex-1 w-full">
          <main className="p-4 md:p-6 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your article a title..."
              className="text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground outline-hidden bg-transparent mb-4 w-full"
              autoFocus
            />

            <Separator className="mb-4" />

            <div className="min-h-[400px]">
              <TextEditor
                initialContent={editorContent}
                placeholder="Write your story here... Use '/' to format paragraphs, headers, quotes or checklists."
                onChange={setEditorContent}
              />
            </div>
          </main>
        </ScrollArea>
      </SidebarInset>

      {/* COLUMN 3: RIGHT SIDEBAR */}
      <Sidebar side="right" className="max-[1400px]:hidden! flex">
        {renderRightSidebarContent()}
      </Sidebar>

      {/* MOBILE / TABLET DRAWER SHEETS */}
      <Sheet open={leftOpenMobile} onOpenChange={setLeftOpenMobile}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-sidebar text-sidebar-foreground flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Post Details</SheetTitle>
            <SheetDescription>Configure status, tags and category</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col pt-5 pb-5">{renderLeftSidebarContent()}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={rightOpenMobile} onOpenChange={setRightOpenMobile}>
        <SheetContent side="right" className="w-[300px] sm:w-[380px] p-0 bg-sidebar text-sidebar-foreground flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>SEO Optimization</SheetTitle>
            <SheetDescription>Configure keyphrase, slug and description</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col pt-5 pb-5">{renderRightSidebarContent()}</div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
