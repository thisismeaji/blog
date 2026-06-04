"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TiptapImage from "@tiptap/extension-image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link2,
  Link2Off,
  Highlighter,
  Quote,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Undo2,
  Redo2,
  Check,
  X,
  Sparkles,
  Save,
  FileText,
  CloudUpload,
} from "lucide-react";

interface TextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: any, range: { from: number; to: number }) => void;
}

export default function TextEditor({
  initialContent = "",
  onChange,
  placeholder = "Press '/' for commands...",
}: TextEditorProps) {

  const [isMounted, setIsMounted] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  
  // Slash menu state
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    query: string;
    from: number;
    index: number;
    openAbove: boolean;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    query: "",
    from: 0,
    index: 0,
    openAbove: false,
  });

  const listRef = useRef<HTMLDivElement>(null);

  // List of all slash commands
  const slashCommands = useMemo<CommandItem[]>(() => [
    {
      title: "Text",
      description: "Start writing with plain text.",
      icon: Pilcrow,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      icon: Heading1,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      icon: Heading2,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading.",
      icon: Heading3,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
      },
    },
    {
      title: "To-do list",
      description: "Track tasks with a checklist.",
      icon: ListTodo,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Bulleted list",
      description: "Create a simple bulleted list.",
      icon: List,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered list",
      description: "Create a list with numbering.",
      icon: ListOrdered,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote.",
      icon: Quote,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code block",
      description: "Write code with syntax styling.",
      icon: Code,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Divider",
      description: "Visually divide sections.",
      icon: Minus,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: "Image",
      description: "Upload an image from your computer.",
      icon: CloudUpload,
      command: (editor, range) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              if (base64) {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setImage({ src: base64 })
                  .run();
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      },
    },
  ], []);

  // Filter commands based on slash menu query
  const filteredCommands = useMemo(() => {
    if (!slashMenu.query) return slashCommands;
    return slashCommands.filter((cmd) =>
      cmd.title.toLowerCase().includes(slashMenu.query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(slashMenu.query.toLowerCase())
    );
  }, [slashMenu.query, slashCommands]);

  // Sync ref to avoid stale closures in Tiptap event handlers
  const stateRef = useRef({
    slashMenu,
    commands: filteredCommands,
  });
  
  useEffect(() => {
    stateRef.current = {
      slashMenu,
      commands: filteredCommands,
    };
  }, [slashMenu, filteredCommands]);

  // Mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close slash menu on window click or scroll
  useEffect(() => {
    if (!slashMenu.isOpen) return;

    const handleOutsideClick = () => {
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    };

    const handleScroll = (event: Event) => {
      if (listRef.current && listRef.current.contains(event.target as Node)) {
        return;
      }
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    };

    window.addEventListener("click", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [slashMenu.isOpen]);

  // Scroll active command into view
  useEffect(() => {
    if (slashMenu.isOpen && listRef.current) {
      const parent = listRef.current;
      const items = parent.querySelectorAll("[data-command-item]");
      const activeItem = items[slashMenu.index] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [slashMenu.index, slashMenu.isOpen]);

  // Configure Tiptap editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 font-medium cursor-pointer",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border max-w-full max-h-[450px] w-auto object-contain my-4 mx-auto block shadow-xs hover:ring-2 hover:ring-primary/25 transition-all duration-200",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
      
      // Global autosave is triggered by onChange callback

      // Handle Slash Command query filtering
      const { slashMenu: currentSlashMenu } = stateRef.current;
      if (currentSlashMenu.isOpen) {
        const { selection } = editor.state;
        
        // Close menu if cursor moved before trigger pos or selection is not empty
        if (selection.from <= currentSlashMenu.from || !selection.empty) {
          setSlashMenu((prev) => ({ ...prev, isOpen: false }));
          return;
        }

        // Get text between trigger position and cursor
        const text = editor.state.doc.textBetween(currentSlashMenu.from + 1, selection.from);
        
        // Close if space or newline is entered
        if (text.includes(" ") || text.includes("\n")) {
          setSlashMenu((prev) => ({ ...prev, isOpen: false }));
        } else {
          setSlashMenu((prev) => ({
            ...prev,
            query: text,
            index: 0, // Reset selected item index on query change
          }));
        }
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none outline-none min-h-[400px] py-2",
      },
      transformPastedHTML(html) {
        if (typeof window === "undefined") return html;
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Traverse and sanitize elements
          const allElements = doc.body.querySelectorAll("*");
          allElements.forEach((el) => {
            // Remove style and class attributes to strip fonts, colors, sizes, and background styles
            el.removeAttribute("style");
            el.removeAttribute("class");

            const tagName = el.tagName.toLowerCase();
            if (tagName === "a") {
              const href = el.getAttribute("href");
              while (el.attributes.length > 0) {
                el.removeAttribute(el.attributes[0].name);
              }
              if (href) el.setAttribute("href", href);
            } else if (tagName === "img") {
              const src = el.getAttribute("src");
              const alt = el.getAttribute("alt");
              while (el.attributes.length > 0) {
                el.removeAttribute(el.attributes[0].name);
              }
              if (src) el.setAttribute("src", src);
              if (alt) el.setAttribute("alt", alt);
            } else {
              while (el.attributes.length > 0) {
                el.removeAttribute(el.attributes[0].name);
              }
            }
          });

          return doc.body.innerHTML;
        } catch (err) {
          console.error("Paste sanitization error", err);
          return html;
        }
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        const html = event.clipboardData?.getData("text/html");

        // If there's already rich HTML, let transformPastedHTML handle it (to strip custom styles)
        if (html && isRichHtml(html)) return false;

        // If it is plain text and matches Markdown formatting, parse it to HTML
        if (text && isMarkdown(text)) {
          const parsedHtml = convertMarkdownToHtml(text);
          const element = document.createElement("div");
          element.innerHTML = parsedHtml;

          const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(element);
          const transaction = view.state.tr.replaceSelection(slice);
          view.dispatch(transaction);
          return true; // paste handled
        }

        return false;
      },
      handleKeyDown: (view, event) => {
        const { slashMenu: currentSlashMenu, commands } = stateRef.current;

        if (currentSlashMenu.isOpen) {
          if (event.key === "ArrowDown") {
            setSlashMenu((prev) => ({
              ...prev,
              index: (prev.index + 1) % commands.length,
            }));
            return true;
          }
          
          if (event.key === "ArrowUp") {
            setSlashMenu((prev) => ({
              ...prev,
              index: (prev.index - 1 + commands.length) % commands.length,
            }));
            return true;
          }

          if (event.key === "Enter") {
            if (commands.length > 0) {
              const selectedItem = commands[currentSlashMenu.index];
              const endPos = view.state.selection.from;
              selectedItem.command(editor, { from: currentSlashMenu.from, to: endPos });
            }
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
            return true;
          }

          if (event.key === "Escape") {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
        }

        // Trigger Slash Menu
        if (event.key === "/") {
          const { selection } = view.state;
          const $from = selection.$from;
          
          // Get the char before cursor to check if it's space or start of block
          const textBefore = $from.parentOffset > 0 
            ? $from.parent.textBetween($from.parentOffset - 1, $from.parentOffset) 
            : "";
          
          if ($from.parentOffset === 0 || textBefore === " ") {
            setTimeout(() => {
              const newSelection = view.state.selection;
              const coords = view.coordsAtPos(newSelection.from);
              const openAbove = window.innerHeight - coords.bottom < 320;
              
              setSlashMenu({
                isOpen: true,
                x: coords.left,
                y: openAbove ? coords.top : coords.bottom,
                query: "",
                from: selection.from,
                index: 0,
                openAbove,
              });
            }, 10);
          }
        }

        return false;
      },
    },
  });

  // Calculate character and word count
  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  }, [editor?.getText()]);

  const charCount = useMemo(() => {
    if (!editor) return 0;
    return editor.getText().length;
  }, [editor?.getText()]);

  // Execute slash command selection
  const handleSelect = (index: number) => {
    if (!editor) return;
    const { slashMenu: currentSlashMenu, commands } = stateRef.current;
    const item = commands[index];
    if (item && currentSlashMenu.isOpen) {
      const endPos = editor.state.selection.from;
      item.command(editor, { from: currentSlashMenu.from, to: endPos });
    }
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Link actions
  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setIsEditingLink(true);
  };

  const handleSetLink = () => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setIsEditingLink(false);
    setLinkUrl("");
  };

  const handleUnlink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsEditingLink(false);
  };

  if (!isMounted) {
    return (
      <div className="w-full border rounded-xl bg-background/50 backdrop-blur-xs p-6 shadow-xs animate-pulse">
        <div className="h-8 bg-muted rounded-md w-1/3 mb-6" />
        <div className="h-4 bg-muted rounded-md w-full mb-3" />
        <div className="h-4 bg-muted rounded-md w-5/6 mb-3" />
        <div className="h-4 bg-muted rounded-md w-4/5 mb-3" />
        <div className="h-20 bg-muted rounded-md w-full" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col group/editor">
      {/* Premium Compact Borderless Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-4 border border-border bg-muted/40 rounded-lg select-none text-xs text-muted-foreground transition-colors group-focus-within/editor:border-border/80">
        <div className="flex items-center gap-3 font-medium text-foreground/70">
          <span>Editor</span>
        </div>

        <div className="flex items-center gap-2">
          {/* History control */}
          <div className="flex items-center gap-0.5 border border-border/50 rounded-md bg-background p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              title="Undo"
            >
              <Undo2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              title="Redo"
            >
              <Redo2 className="size-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              if (!editor) return;
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = () => {
                const file = input.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const base64 = e.target?.result as string;
                    if (base64) {
                      editor.chain().focus().setImage({ src: base64 }).run();
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            title="Upload Image"
            className="border border-border/50 rounded-md bg-background h-7 w-7 hover:bg-accent"
          >
            <CloudUpload className="size-3.5" />
          </Button>
          
          <span className="h-3.5 w-[1px] bg-border/50" />
          <span className="font-mono">{wordCount} words</span>
          <span>•</span>
          <span className="font-mono">{charCount} chars</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 min-h-[400px] relative cursor-text" onClick={() => editor?.chain().focus().run()}>
        {editor && (
          <BubbleMenu
            editor={editor}
            className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 text-white gap-0.5 z-40"
          >
            {isEditingLink ? (
              <div className="flex items-center gap-1 px-1 py-0.5">
                <Input
                  type="text"
                  placeholder="Paste or type link..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="h-7 text-xs bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700 w-44"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSetLink();
                    if (e.key === "Escape") setIsEditingLink(false);
                  }}
                  autoFocus
                />
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleSetLink}
                  className="hover:bg-zinc-800 text-green-400 hover:text-green-300"
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setIsEditingLink(false)}
                  className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("bold") && "bg-zinc-800 text-white"
                  )}
                >
                  <Bold className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("italic") && "bg-zinc-800 text-white"
                  )}
                >
                  <Italic className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("underline") && "bg-zinc-800 text-white"
                  )}
                >
                  <UnderlineIcon className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("strike") && "bg-zinc-800 text-white"
                  )}
                >
                  <Strikethrough className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("code") && "bg-zinc-800 text-white"
                  )}
                >
                  <Code className="size-3.5" />
                </Button>
                
                <span className="w-[1px] h-4 bg-zinc-800 mx-1" />

                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleOpenLinkModal}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("link") && "bg-zinc-800 text-white"
                  )}
                >
                  <Link2 className="size-3.5" />
                </Button>

                {editor.isActive("link") && (
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={handleUnlink}
                    className="hover:bg-zinc-800 text-rose-400 hover:text-rose-300"
                    title="Remove Link"
                  >
                    <Link2Off className="size-3.5" />
                  </Button>
                )}

                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => {
                    if (editor.isActive("highlight")) {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor.chain().focus().setHighlight({ color: "#fef08a" }).run();
                    }
                  }}
                  className={cn(
                    "hover:bg-zinc-800 text-zinc-300 hover:text-white",
                    editor.isActive("highlight") && "bg-zinc-800 text-yellow-300"
                  )}
                  title="Highlight Text"
                >
                  <Highlighter className="size-3.5" />
                </Button>
              </>
            )}
          </BubbleMenu>
        )}

        <EditorContent editor={editor} className="font-sans prose prose-neutral dark:prose-invert max-w-none" />

        {/* Slash commands Popover */}
        {slashMenu.isOpen && (
          <div
            ref={listRef}
            className={cn(
              "fixed z-50 w-72 max-h-80 overflow-y-auto bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-1 animate-in fade-in-50 duration-100",
              slashMenu.openAbove ? "-translate-y-[calc(100%+8px)]" : "translate-y-2"
            )}
            style={{
              left: `${slashMenu.x}px`,
              top: `${slashMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent trigger page/body level clicks
          >
            <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none border-b border-border/50 mb-1">
              Basic Blocks
            </div>
            {filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === slashMenu.index;
              return (
                <button
                  key={cmd.title}
                  data-command-item
                  onClick={() => handleSelect(idx)}
                  className={cn(
                    "flex items-start gap-2.5 w-full text-left px-2.5 py-2 rounded-md transition-colors select-none cursor-pointer",
                    isSelected ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-md border shrink-0 transition-colors",
                    isSelected ? "bg-background border-border text-foreground" : "bg-muted border-transparent text-muted-foreground"
                  )}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-none font-medium text-foreground">{cmd.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{cmd.description}</div>
                  </div>
                </button>
              );
            })}
            {filteredCommands.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No matching blocks found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Markdown Helper Functions for paste conversion
function isMarkdown(text: string): boolean {
  const markdownRegexes = [
    /^\s*#{1,6}\s+\S+/m,        // Headings
    /\*\*[^*]+\*\*/,            // Bold
    /\*[^*]+\*/,                // Italic
    /^\s*[-*+]\s+/m,            // Unordered list
    /^\s*\d+\.\s+/m,            // Ordered list
    /\[[^\]]+\]\([^)]+\)/,      // Link
    /`[^`]+`/,                  // Inline code
    /```[\s\S]+```/,            // Code block
    /^\s*>\s+\S+/m,             // Blockquote
  ];
  return markdownRegexes.some((regex) => regex.test(text));
}

function parseInlineStyles(text: string): string {
  let res = text;
  // Bold-Italic (***text*** or ___text___)
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  res = res.replace(/___(.*?)___/g, "<strong><em>$1</em></strong>");
  // Bold (**text** or __text__)
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  res = res.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic (*text* or _text_)
  res = res.replace(/\*(.*?)\*/g, "<em>$1</em>");
  res = res.replace(/_(.*?)_/g, "<em>$1</em>");
  // Inline Code (`code`)
  res = res.replace(/`(.*?)`/g, "<code>$1</code>");
  // Images (![alt](url))
  res = res.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');
  // Links ([text](url))
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  return res;
}

function isRichHtml(html: string): boolean {
  if (!html) return false;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const richTags = [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote",
      "table", "tr", "th", "td",
      "hr",
      "img",
      "a",
      "strong", "b",
      "em", "i"
    ];
    return richTags.some((tag) => doc.querySelector(tag) !== null);
  } catch (e) {
    return false;
  }
}

function convertMarkdownToHtml(markdown: string, isNested: boolean = false): string {
  let escaped = markdown;
  if (!isNested) {
    escaped = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const lines = escaped.split(/\r?\n/);
  const processed: string[] = [];

  let inCodeBlock = false;
  let codeLines: string[] = [];
  let currentListType: "ul" | "ol" | "taskList" | null = null;
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushList = () => {
    if (currentListType) {
      if (currentListType === "taskList") {
        processed.push("</ul>");
      } else {
        processed.push(`</${currentListType}>`);
      }
      currentListType = null;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      const innerHtml = convertMarkdownToHtml(blockquoteLines.join("\n"), true);
      processed.push(`<blockquote>${innerHtml}</blockquote>`);
      blockquoteLines = [];
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        inCodeBlock = false;
        const codeContent = codeLines.join("\n");
        processed.push(`<pre><code>${codeContent}</code></pre>`);
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushList();
      flushBlockquote();
      inCodeBlock = true;
      continue;
    }

    const blockquoteMatch = line.match(/^\s*&gt;\s*(.*)$/);
    if (blockquoteMatch) {
      flushList();
      inBlockquote = true;
      blockquoteLines.push(blockquoteMatch[1]);
      continue;
    } else {
      flushBlockquote();
    }

    if (trimmed.match(/^(?:-{3,}|\*{3,}|_{3,})$/)) {
      flushList();
      processed.push("<hr />");
      continue;
    }

    const headingMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const parsedText = parseInlineStyles(headingMatch[2]);
      processed.push(`<h${level}>${parsedText}</h${level}>`);
      continue;
    }

    const taskCheckedMatch = line.match(/^\s*[-*+]\s+\[[xX]\]\s+(.*)$/);
    if (taskCheckedMatch) {
      if (currentListType !== "taskList") {
        flushList();
        processed.push('<ul data-type="taskList">');
        currentListType = "taskList";
      }
      const parsedText = parseInlineStyles(taskCheckedMatch[1]);
      processed.push(`<li data-type="taskItem" data-checked="true">${parsedText}</li>`);
      continue;
    }

    const taskUncheckedMatch = line.match(/^\s*[-*+]\s+\[\s*\]\s+(.*)$/);
    if (taskUncheckedMatch) {
      if (currentListType !== "taskList") {
        flushList();
        processed.push('<ul data-type="taskList">');
        currentListType = "taskList";
      }
      const parsedText = parseInlineStyles(taskUncheckedMatch[1]);
      processed.push(`<li data-type="taskItem" data-checked="false">${parsedText}</li>`);
      continue;
    }

    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (currentListType !== "ul") {
        flushList();
        processed.push("<ul>");
        currentListType = "ul";
      }
      const parsedText = parseInlineStyles(ulMatch[1]);
      processed.push(`<li>${parsedText}</li>`);
      continue;
    }

    const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (olMatch) {
      if (currentListType !== "ol") {
        flushList();
        processed.push("<ol>");
        currentListType = "ol";
      }
      const parsedText = parseInlineStyles(olMatch[1]);
      processed.push(`<li>${parsedText}</li>`);
      continue;
    }

    if (trimmed === "") {
      flushList();
      processed.push("");
      continue;
    }

    const parsedText = parseInlineStyles(trimmed);
    if (currentListType) {
      const lastIdx = processed.length - 1;
      if (lastIdx >= 0 && processed[lastIdx].endsWith("</li>")) {
        processed[lastIdx] = processed[lastIdx].replace(/<\/li>$/, ` ${parsedText}</li>`);
      } else {
        processed.push(`<li>${parsedText}</li>`);
      }
    } else {
      processed.push(`<p>${parsedText}</p>`);
    }
  }

  flushList();
  flushBlockquote();
  if (inCodeBlock) {
    const codeContent = codeLines.join("\n");
    processed.push(`<pre><code>${codeContent}</code></pre>`);
  }

  return processed.join("\n");
}
