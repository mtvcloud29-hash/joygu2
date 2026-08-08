import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BlogEditor } from "@/components/admin/blog/BlogEditor";
export default async function NewBlogPage(){const user=await getCurrentUser();if(!user||user.role!="ADMIN"&&user.role!="STAFF")redirect("/account/login");return <main className="container-shell py-12 lg:py-20"><p className="eyebrow">CMS / New post</p><h1 className="section-title mt-3">Write something considered.</h1><BlogEditor/></main>}
