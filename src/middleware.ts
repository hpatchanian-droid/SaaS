import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/employees/:path*",
    "/attendance/:path*",
    "/tasks/:path*",
    "/projects/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/expenses/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/api/((?!auth).*)/:path*",
  ],
};
