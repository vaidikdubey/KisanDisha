import { Suspense } from "react";
import SignInForm from "./sign-in-form";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading page...</div>}>
            <SignInForm />
        </Suspense>
    );
}
