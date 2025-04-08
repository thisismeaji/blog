import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export function getAllPosts() {
  const categories = fs.readdirSync(postsDirectory);
  let posts = [];

  categories.forEach((category) => {
    const categoryPath = path.join(postsDirectory, category);
    const files = fs.readdirSync(categoryPath);

    files.forEach((fileName) => {
      const filePath = path.join(categoryPath, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      const slug = fileName.replace(/\.md$/, "");

      posts.push({
        ...data,
        content,
        slug, // slug tanpa kategori
        category,
      });
    });
  });

  return posts;
}

export function getPostBySlug(slug) {
  const categories = fs.readdirSync(postsDirectory);

  for (const category of categories) {
    const files = fs.readdirSync(path.join(postsDirectory, category));

    for (const file of files) {
      if (file.replace(/\.md$/, "") === slug) {
        const filePath = path.join(postsDirectory, category, file);
        const fileContents = fs.readFileSync(filePath, "utf8");
        const { data, content } = matter(fileContents);

        return {
          ...data,
          content,
          slug,
        };
      }
    }
  }

  return null;
}
