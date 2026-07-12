import {NextResponse} from "next/server";import type {NextRequest} from "next/server";
export function middleware(r:NextRequest){const role=r.cookies.get("demo_role")?.value||"";if(r.nextUrl.pathname.startsWith("/studio")&&!(["analyst","subsidiary_admin","holding_admin"].includes(role)))return NextResponse.redirect(new URL("/login/analyst",r.url));if(r.nextUrl.pathname.startsWith("/admin")&&!(["subsidiary_admin","holding_admin"].includes(role)))return NextResponse.redirect(new URL("/login/holding_admin",r.url));return NextResponse.next()}
export const config={matcher:["/studio/:path*","/admin/:path*"]};

