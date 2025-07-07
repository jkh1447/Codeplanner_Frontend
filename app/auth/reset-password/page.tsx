
import { Suspense } from "react";
import ResetPasswordPage from "./_components/reset-password";

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}