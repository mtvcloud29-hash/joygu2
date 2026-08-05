import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const schema=z.object({postId:z.string().cuid(),name:z.string().min(2).max(100),email:z.string().email(),body:z.string().min(10).max(3000),website:z.string().max(0).optional()});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid comment."},{status:400});const {website,...data}=parsed.data;void website;const comment=await prisma.blogComment.create({data});return NextResponse.json({ok:true,comment:{id:comment.id,status:comment.status}})}
