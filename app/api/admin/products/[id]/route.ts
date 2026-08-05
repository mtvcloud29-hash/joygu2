import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
async function admin(){const user=await getCurrentUser();return user&&(user.role==="ADMIN"||user.role==="STAFF")?user:null}
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){if(!await admin())return NextResponse.json({error:"Forbidden"},{status:403});const product=await prisma.product.findUnique({where:{id:(await params).id},include:{category:true,images:{orderBy:{sortOrder:"asc"}},variants:true}});if(!product)return NextResponse.json({error:"Product not found"},{status:404});const activity=await prisma.activityLog.findMany({where:{entity:"Product",entityId:product.id},orderBy:{createdAt:"desc"},take:100});return NextResponse.json({product,activity})}
