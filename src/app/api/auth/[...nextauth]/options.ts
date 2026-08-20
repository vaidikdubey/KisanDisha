import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import {NextAuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: {label: "Password", type: "password"},
            },

            async authorize(credentials) { 
                if (!credentials?.email || !credentials.password) throw new Error("Missing credentials")

                    try {
                        const user = await prisma.user.findUnique({
                            where: {
                                email: credentials.email
                            }
                        })

                        if (!user) throw new Error("User not found")

                        const enteredPassword = credentials.password
                        const isPasswordCorrect = await bcrypt.compare(enteredPassword, user.password!)


                        if (isPasswordCorrect) { 
                            return {
                                id: user.id.toString(),
                                name: user.name,
                                email: user.email
                            }
                        }
                        else throw new Error("Invaid credentials")
                    } catch (error) {
                        throw new Error(error instanceof Error ? error.message : "Authentication failed")
                    }
            }
        })
    ],

    callbacks: {
        async signIn({ account, profile }) { 
            if (account?.provider !== "credentials") { 
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: profile?.email
                        }
                    })

                    //If new user, we redirect them to sign-up page
                    if (!user) return `/sign-up`

                    return true
                } catch (error) {
                    console.error("Error signing in user with google", error)
                    return false
                }
            }

            return true
        },

        async jwt({ token, user, account }) { 
            if (user) { 
                //If user sign-in through google we find id for the user and attach in token
                if (account?.provider !== "credentials") { 
                    const dbUser = await prisma.user.findUnique({
                        where: {
                            email: user.email!
                        }
                    })

                    if(dbUser) token.id = dbUser.id.toString()
                }
                else token.id = user.id
            }
            return token
        },

        async session({ session, token }) { 
            if (session.user && token.id) session.user.id = token.id as string

            return session
        }
    },

    pages: {
        signIn: "/sign-in"
    },

    session: {
        strategy: "jwt"
    },

    secret: process.env.NEXTAUTH_SECRET
}