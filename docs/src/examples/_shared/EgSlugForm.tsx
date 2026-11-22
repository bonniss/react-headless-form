import { useState } from "react";
import { Form, defineConfig } from "./form.setup";

/** Lowercase ASCII slug; strips diacritics (Vietnamese "đ" included). */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Post = { title: string; slug: string };

const config = defineConfig<Post>({
  title: { type: "text", label: "Title" },
  // Editable: follows the title until the user edits the slug;
  // clearing it resumes syncing on the next title change.
  slug: { type: "text", label: "Slug", compute: (v) => slugify(v.title ?? "") },
});

export default function EgSlugForm() {
  // Switch between a new post and editing a saved one with a custom slug.
  const [saved, setSaved] = useState<Post | undefined>();
  return (
    <>
      <button type="button" onClick={() => setSaved({ title: "Phở Bò Đặc Biệt", slug: "pho-bo-ha-noi" })}>
        Load saved post
      </button>
      <Form<Post> key={saved ? "edit" : "new"} config={config} defaultValues={saved} />
    </>
  );
}
