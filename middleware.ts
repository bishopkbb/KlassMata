// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define roles manually (cannot import from Prisma in Edge runtime)
export enum UserRole {
  super_admin = "super_admin",
  admin = "admin",
  teacher = "teacher",
  student = "student",
  parent = "parent",
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token) {
      // Use the correct login URL that matches your app
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const userRole = token.role as UserRole;

    // Redirect root/dashboard to role-specific dashboard
    if (pathname === "/" || pathname === "/dashboard") {
      switch (userRole) {
        case UserRole.super_admin:
          return NextResponse.redirect(new URL("/super/dashboard", req.url));
        case UserRole.admin:
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        case UserRole.teacher:
          return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
        case UserRole.student:
          return NextResponse.redirect(new URL("/student/dashboard", req.url));
        case UserRole.parent:
          return NextResponse.redirect(new URL("/parent/dashboard", req.url));
        default:
          return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Role groups
    const adminRoles = [UserRole.admin, UserRole.super_admin];
    const teacherRoles = [
      UserRole.teacher,
      UserRole.admin,
      UserRole.super_admin,
    ];
    const studentRoles = [
      UserRole.student,
      UserRole.teacher,
      UserRole.admin,
      UserRole.super_admin,
    ];
    const parentRoles = [UserRole.parent, UserRole.admin, UserRole.super_admin];

    // Protect routes
    if (pathname.startsWith("/admin/") && !adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/super/") && userRole !== UserRole.super_admin) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/teacher/") && !teacherRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/student/") && !studentRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/parent/") && !parentRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Protect API routes
    if (pathname.startsWith("/api/admin/") && !adminRoles.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      pathname.startsWith("/api/super/") &&
      userRole !== UserRole.super_admin
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin", // Custom sign-in page
    },
  },
);

export const config = {
  matcher: [
    // Exclude auth pages, API auth routes, static files, and public assets
    "/((?!api/auth|api/register|auth/login|auth/signin|auth/signup|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
