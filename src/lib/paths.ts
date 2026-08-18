import path from "path";

export function uploadDir() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "uploads");
  }
  return path.join(process.cwd(), "uploads");
}
