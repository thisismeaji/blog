import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

function getAllMarkdownFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllMarkdownFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".md")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function parseMarkdown(filePath) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  // Buat ID unik: gabungkan folder dan id dari frontmatter
  const relativePath = path.relative(postsDirectory, filePath);
  const folder = path.dirname(relativePath).replace(/\\/g, "/"); // agar aman di Windows
  const originalId = data.id || path.basename(filePath, ".md");
  const uniqueId = `${folder}-${originalId}`;

  return {
    ...data,
    id: uniqueId, // override ID dengan versi unik
    content,
  };
}

export function getAllPosts() {
  const markdownFiles = getAllMarkdownFiles(postsDirectory);

  return markdownFiles
    .map(parseMarkdown)
    .filter((post) => post.type === "BlogPosting");
}

export function getAllPages() {
  const markdownFiles = getAllMarkdownFiles(postsDirectory);

  return markdownFiles
    .map(parseMarkdown)
    .filter((page) => page.type === "WebPages");
}

export function getPostByUrl(slug) {
  const allContent = [...getAllPosts(), ...getAllPages()];
  return allContent.find((post) => post.url.replace("/", "") === slug);
}
