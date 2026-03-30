import { D1Adapter } from "@auth/d1-adapter";
import NextAuth from "next-auth";

export const runtime = "edge";

export const GET = async (req: Request, ctx: { env: { DB: any } }) => {
  const adapter = D1Adapter(ctx.env.DB);
  const auth = NextAuth({
    adapter,
    session: { strategy: "database" },
    providers: [
      {
        id: "google",
        name: "Google",
        type: "oauth",
        clientId: req.headers.get("x-google-client-id") || process.env.GOOGLE_CLIENT_ID!,
        clientSecret: req.headers.get("x-google-client-secret") || process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          url: "https://accounts.google.com/o/oauth2/v2/auth",
          params: { scope: "openid email profile" },
        },
        profile(profile: any) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          };
        },
      },
    ],
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
    callbacks: {
      async session({ session, user }: { session: any; user: any }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  });
  return auth.GET(req, ctx);
};

export const POST = async (req: Request, ctx: { env: { DB: any } }) => {
  const adapter = D1Adapter(ctx.env.DB);
  const auth = NextAuth({
    adapter,
    session: { strategy: "database" },
    providers: [
      {
        id: "google",
        name: "Google",
        type: "oauth",
        clientId: req.headers.get("x-google-client-id") || process.env.GOOGLE_CLIENT_ID!,
        clientSecret: req.headers.get("x-google-client-secret") || process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          url: "https://accounts.google.com/o/oauth2/v2/auth",
          params: { scope: "openid email profile" },
        },
        profile(profile: any) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          };
        },
      },
    ],
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
    callbacks: {
      async session({ session, user }: { session: any; user: any }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  });
  return auth.POST(req, ctx);
};
