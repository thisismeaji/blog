"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import TextEditor from "@/components/text-editor";
import { ArrowLeft, CloudUpload, Calendar, Globe, Settings, Eye, Save, Check, CheckCircle2, AlertCircle } from "lucide-react";
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

export default function AddPostPage() {
  // Post States
  const [title, setTitle] = useState("Untitled Article");
  const [editorContent, setEditorContent] = useState("");
  const [publishDate, setPublishDate] = useState<Date | undefined>(() => new Date());

  // Computed Status based on publishDate
  const computedStatus = useMemo(() => {
    if (!publishDate) return "draft";
    const now = new Date();
    const today = new Date(now.setHours(0,0,0,0));
    const compareDate = new Date(publishDate);
    compareDate.setHours(0,0,0,0);
    if (compareDate > today) {
      return "scheduled";
    }
    return "draft";
  }, [publishDate]);
  const [category, setCategory] = useState("technology");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["WebDev", "React"]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // SEO States
  const [focusKeyword, setFocusKeyword] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [schemaType, setSchemaType] = useState("article");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  // Post Metadata States
  const [author, setAuthor] = useState("admin");
  const [excerpt, setExcerpt] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  // Mobile Drawer Sheets States
  const [leftOpenMobile, setLeftOpenMobile] = useState(false);
  const [rightOpenMobile, setRightOpenMobile] = useState(false);

  // Action/Loading & Saving States
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const isFirstRender = useRef(true);

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
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [title, isManualSlug]);

  // Global Autosave Effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      setSaveStatus("saved");
    }, 1000);
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
    allowComments
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

  // Handle Tags Creation (supports Enter, Tab, Comma, Semicolon)
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
    // 1. Validation checks
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
      const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
      const postData = {
        header: title,
        type: categoryFormatted,
        status: "Done",
        target: "0",
        limit: "0",
        reviewer: author === "admin" ? "Admin" : author,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        toast.success("Post Published Successfully!", {
          description: `"${title}" has been published under ${category.toUpperCase()}.`,
          duration: 4000,
        });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error("Failed to publish post");
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
      const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
      const postData = {
        header: title,
        type: categoryFormatted,
        status: "In Process",
        target: "0",
        limit: "0",
        reviewer: author === "admin" ? "Admin" : author,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        setSaveStatus("saved");
        toast.info("Draft Saved Successfully!", {
          description: `"${title}" is saved as a draft.`,
          duration: 3000,
        });
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

  // Content for Left Sidebar (Post Details) - Reused for Desktop Sidebar & Mobile Sheet
  const renderLeftSidebarContent = () => (
    <>
      <SidebarHeader className="border-b border-sidebar-border h-(--header-height) flex flex-row items-center px-4 py-0 select-none shrink-0 bg-sidebar">
        <div className="text-base font-semibold text-foreground">
          Post Details
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-0">
        <ScrollArea className="flex-1 w-full">
          <SidebarGroup className="p-4">
            <SidebarGroupContent className="space-y-4">
            
            {/* Featured Image upload & preview */}
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
                    <span className="text-xs font-medium text-muted-foreground/60">
                      No image selected
                    </span>
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
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
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
                  <SelectItem value="admin">Admin (Default)</SelectItem>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
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
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="opinion">Opinion</SelectItem>
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
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No tags added.</span>
                )}
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

            {/* Publish Date (Shadcn Popover Calendar) */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="publish-date">Publish Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="publish-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !publishDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 size-4 text-muted-foreground" />
                    {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadcnCalendar
                    mode="single"
                    selected={publishDate}
                    onSelect={setPublishDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="pin-post">Pin to Homepage</Label>
                  <p className="text-[10px] text-muted-foreground">Feature this article at the top of feed.</p>
                </div>
                <Checkbox
                  id="pin-post"
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(checked === true)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="allow-comments">Allow Comments</Label>
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
      </ScrollArea>
    </SidebarContent>
    </>
  );

  // Content for Right Sidebar (SEO Optimizations) - Reused for Desktop Sidebar & Mobile Sheet
  const renderRightSidebarContent = () => (
    <>
      <SidebarHeader className="border-b border-sidebar-border h-(--header-height) flex flex-row items-center px-4 py-0 select-none shrink-0 bg-sidebar">
        <div className="text-base font-semibold text-foreground">
          SEO Optimization
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-0">
        <ScrollArea className="flex-1 w-full">
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
                  {/* Search breadcrumb */}
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-0.5">
                    <span>https://yourblog.com</span>
                    <span>›</span>
                    <span>posts</span>
                    <span>›</span>
                    <span className="truncate text-zinc-700 dark:text-zinc-300 font-medium">{slug || "new-article"}</span>
                  </div>
                  {/* Search Title Link */}
                  <h3 className="text-blue-700 dark:text-blue-400 hover:underline text-sm font-medium leading-tight line-clamp-1 cursor-pointer">
                    {seoTitle || title || "Untitled Article"}
                  </h3>
                  {/* Search Snippet Content */}
                  <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-snug line-clamp-2 pt-0.5">
                    {metaDescription || "Write a meta description to see how this page snippet will display in Google search results."}
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
                      setSlug(
                        title
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      );
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
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }}
                placeholder="url-slug"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta-description">Meta Description</Label>
                <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                  {metaDescription.length}/160
                </span>
              </div>
              <Textarea
                id="meta-description"
                placeholder="Brief summary of the article..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="min-h-20"
              />
            </div>

            {/* Focus Keyphrase */}
            <div className="space-y-2">
              <Label htmlFor="focus-keyword">Focus Keyphrase</Label>
              <Input
                id="focus-keyword"
                placeholder="e.g. nextjs blog"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
              />
            </div>

            {/* Real-time SEO Analysis Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>SEO Real-time Analysis</Label>
                <Badge
                  variant={
                    seoScore >= 80 ? "secondary" :
                    seoScore >= 50 ? "outline" :
                    "destructive"
                  }
                >
                  Score: {seoScore}/100
                </Badge>
              </div>
              <div className="space-y-2 bg-muted/30 border rounded-lg p-3 text-xs leading-relaxed">
                {seoChecklist.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {check.passed ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                    )}
                    <span className={cn(
                      "flex-1",
                      check.passed ? "text-foreground/80" : "text-muted-foreground"
                    )}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
              <p className="text-[10px] text-muted-foreground">
                Set if this post was originally published elsewhere.
              </p>
            </div>

          </SidebarGroupContent>
        </SidebarGroup>
      </ScrollArea>
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
      {/* COLUMN 1: LEFT SIDEBAR (Post Details - Desktop only) */}
      <Sidebar side="left" className="max-[1400px]:hidden! flex">
        {renderLeftSidebarContent()}
      </Sidebar>

      {/* COLUMN 2: CENTER WORKSPACE (Editor) */}
      <SidebarInset className="flex flex-col flex-1 min-w-0">
        
        {/* Top Navbar */}
        <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b px-4 lg:px-6 select-none bg-background">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <div className="text-sm font-semibold text-foreground truncate max-w-[100px] sm:max-w-[200px]">
              {title || "Untitled Article"}
            </div>
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
            
            {/* Editable Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your article a title..."
              className="text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground outline-hidden bg-transparent mb-4 w-full"
              autoFocus
            />

            <Separator className="mb-4" />

            {/* Rich Text Editor Component */}
            <div className="min-h-[400px]">
              <TextEditor 
                placeholder="Write your story here... Use '/' to format paragraphs, headers, quotes or checklists."
                onChange={setEditorContent}
              />
            </div>
          </main>
        </ScrollArea>
      </SidebarInset>

      {/* COLUMN 3: RIGHT SIDEBAR (SEO Optimizations - Desktop only) */}
      <Sidebar side="right" className="max-[1400px]:hidden! flex">
        {renderRightSidebarContent()}
      </Sidebar>

      {/* MOBILE / TABLET DRAWER SHEETS */}
      {/* Mobile Sheet for Post Details (Left) */}
      <Sheet open={leftOpenMobile} onOpenChange={setLeftOpenMobile}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-sidebar text-sidebar-foreground flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Post Details</SheetTitle>
            <SheetDescription>Configure status, tags and category</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col pt-5 pb-5">
            {renderLeftSidebarContent()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Sheet for SEO Optimizations (Right) */}
      <Sheet open={rightOpenMobile} onOpenChange={setRightOpenMobile}>
        <SheetContent side="right" className="w-[300px] sm:w-[380px] p-0 bg-sidebar text-sidebar-foreground flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>SEO Optimization</SheetTitle>
            <SheetDescription>Configure keyphrase, slug and description</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col pt-5 pb-5">
            {renderRightSidebarContent()}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
