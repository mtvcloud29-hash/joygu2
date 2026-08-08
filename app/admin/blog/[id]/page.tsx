"use client";
import { use, useEffect, useState } from "react";
import { BlogEditor } from "@/components/admin/blog/BlogEditor";
export default function EditBlogPage({params}:{params:Promise<{id:string}>}){const {id}=use(params);const [post,setPost]=useState<unknown>(null);useEffect(()=>{void fetch('/api/admin/blog').then(r=>r.json()).then(body=>setPost(body.posts.find((item:{id:string})=>item.id===id)))},[id]);if(!post)return <main className="container-shell py-20"><p className="text-sm text-muted">Loading…</p></main>;return <main className="container-shell py-12 lg:py-20"><p className="eyebrow">CMS / Edit post</p><h1 className="section-title mt-3">Edit article.</h1><BlogEditor initial={post as never}/></main>}
