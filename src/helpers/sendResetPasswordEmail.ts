import { resend } from "@/lib/resend";
import ResetPasswordEmail from "../../emails/ResetPasswordEmail"
import { NextResponse } from "next/server";

export async function sendResetPasswordEmail(
    name: string,
    email: string,
    resetLink: string,
): Promise<NextResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: "KisanDisha <onboarding@resend.dev>",
            to: [email],
            subject: `Reset Your Password - KisanDisha`,
            react: ResetPasswordEmail({ name, resetLink }),
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
