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

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/about", "/contact", "/pricing", "/features"];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthPage =
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname === "/onboard";

    // Allow public routes without authentication
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // If user is authenticated and on auth page, redirect to dashboard
    if (token && isAuthPage) {
      const userRole = token.role as UserRole;
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
          return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // If not authenticated and trying to access protected route
    if (!token && !isAuthPage && !isPublicRoute) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // If authenticated, check role-based access
    if (token) {
      const userRole = token.role as UserRole;

      // Redirect /dashboard to role-specific dashboard
      if (pathname === "/dashboard") {
        switch (userRole) {
          case UserRole.super_admin:
            return NextResponse.redirect(new URL("/super/dashboard", req.url));
          case UserRole.admin:
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
          case UserRole.teacher:
            return NextResponse.redirect(
              new URL("/teacher/dashboard", req.url),
            );
          case UserRole.student:
            return NextResponse.redirect(
              new URL("/student/dashboard", req.url),
            );
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
      const parentRoles = [
        UserRole.parent,
        UserRole.admin,
        UserRole.super_admin,
      ];

      // Protect routes based on role
      if (pathname.startsWith("/admin/") && !adminRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (pathname.startsWith("/super/") && userRole !== UserRole.super_admin) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (
        pathname.startsWith("/teacher/") &&
        !teacherRoles.includes(userRole)
      ) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (
        pathname.startsWith("/student/") &&
        !studentRoles.includes(userRole)
      ) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (pathname.startsWith("/parent/") && !parentRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Protect API routes
      if (
        pathname.startsWith("/api/admin/") &&
        !adminRoles.includes(userRole)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (
        pathname.startsWith("/api/super/") &&
        userRole !== UserRole.super_admin
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes don't need authentication
        const publicRoutes = [
          "/",
          "/about",
          "/contact",
          "/pricing",
          "/features",
        ];

        const isPublicRoute = publicRoutes.includes(pathname);
        const isAuthPage =
          pathname.startsWith("/auth/") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname === "/onboard";

        // Allow public routes and auth pages
        if (isPublicRoute || isAuthPage) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth API routes)
     * - api/register (registration endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
