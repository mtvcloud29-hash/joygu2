import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ ids: z.array(z.string().cuid()).min(1).max(250), price: z.number().positive().optional(), stock: z.number().int().min(0).optional(), categoryId: z.string().cuid().optional(), active: z.boolean().optional(), featured: z.boolean().optional() });
async function admin(){const user=await getCurrentUser();return user&&(user.role==="ADMIN"||user.role==="STAFF")?user:null}
export async function PATCH(request:Request){const user=await admin();if(!user)return NextResponse.json({error:"Forbidden"},{status:403});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid bulk update"},{status:400});const {ids,...changes}=parsed.data;await prisma.$transaction(async tx=>{const products=await tx.product.findMany({where:{id:{in:ids}},select:{id:true,price:true,stock:true,active:true,categoryId:true}});await tx.product.updateMany({where:{id:{in:ids}},data:changes});for(const product of products)await tx.activityLog.create({data:{userId:user.id,action:"UPDATE",entity:"Product",entityId:product.id,previousValue:product as never,newValue:changes as never}});});return NextResponse.json({ok:true,count:ids.length})}
