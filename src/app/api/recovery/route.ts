import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { recoveryStates } from '@/db/schema';
import { eq } from 'drizzle-orm';
const valid=(id:string)=>/^[a-f0-9-]{36}$/.test(id);
export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get('id')||'';
 if(!valid(id))return NextResponse.json({error:'Invalid recovery identifier'},{status:400});
 try{const [row]=await db.select().from(recoveryStates).where(eq(recoveryStates.id,id));return NextResponse.json({state:row?.state??null});}catch{return NextResponse.json({error:'Saved locally; sync temporarily unavailable'},{status:503});}
}
export async function PUT(req:NextRequest){
 try{const body=await req.json();if(!valid(body.id)||!body.state||JSON.stringify(body.state).length>250000)return NextResponse.json({error:'Invalid recovery data'},{status:400});
 await db.insert(recoveryStates).values({id:body.id,state:body.state}).onConflictDoUpdate({target:recoveryStates.id,set:{state:body.state,updatedAt:new Date()}});return NextResponse.json({saved:true});
 }catch{return NextResponse.json({error:'Saved locally; sync temporarily unavailable'},{status:503});}
}
