import { resend } from "@/lib/resend";
import PasswordChangedEmail from "../../emails/InformResetPasswordEmail"
import { NextResponse } from "next/server";

export async function informPasswordResetEmail(
    name: string,
    email: string,
    updatedAt?: string,
    supportLink?: string
): Promise<NextResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: "KisanDisha <onboarding@resend.dev>",
            to: [email],
            subject: `Account Action Required - KisanDisha`,
            react: PasswordChangedEmail({ name, updatedAt, supportLink }),
        });

        if (error)
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to send email",
                    error: error.message,
                },
                { status: 400 },
            );

        return NextResponse.json(
            {
                success: true,
                message: "Email sent successfully",
                data,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error sending email", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to send email",
            },
            { status: 500 },
        );
    }
}
