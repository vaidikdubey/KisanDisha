import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                };
            },
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials.password)
                    throw new Error("Missing credentials");

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user || !user.password)
                        throw new Error(
                            "Invalid credentials or account signed up via Google",
                        );

                    const enteredPassword = credentials.password;
                    const isPasswordCorrect = await bcrypt.compare(
                        enteredPassword,
                        user.password,
                    );

                    if (isPasswordCorrect) {
                        return {
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                        };
                    } else throw new Error("Invaid credentials");
                } catch (error) {
                    throw new Error(
                        error instanceof Error
                            ? error.message
                            : "Authentication failed",
                    );
                }
            },
        }),
    ],

    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                // Let PrismaAdapter automatically create the User & Account records in the DB.
                // Onboarding checks (like state/district completion) will be handled via Middleware or inside pages/components rather than blocking sign-in here.
                return true;
            }

            return true;
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { isOnboarding: true },
                });
                token.isOnboarding = dbUser?.isOnboarding ?? false;
            }
            // fires when the client calls update() after onboarding completes
            if (trigger === "update" && session?.isOnboarding !== undefined)
                token.isOnboarding = session.isOnboarding;

            return token;
        },

        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.isOnboarding = token.isOnboarding as boolean
            }

            return session;
        },
    },
    events: {
        async linkAccount({ user, account }) {
            if (account.provider === "google") {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { provider: "GOOGLE" },
                });
            }
        },
    },

    pages: {
        signIn: "/sign-in",
        newUser: "/onboarding", // Built-in NextAuth redirect for newly registered OAuth users
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
};
