import Image from "next/image";
import VerifyForm from "./VerifyForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function VerifyPage({ params, searchParams }) {
  const c = cookies();
  const emailFromQuery = searchParams?.email;
  const emailFromCookie = c.get("pendingEmail")?.value;

  if (!emailFromQuery && !emailFromCookie) {
    redirect(`/${params.locale}/register`);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Section - Verify Form */}
      <div className="flex items-center justify-center p-8">
        <VerifyForm />
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden md:flex items-center justify-center bg-[#4698E3]">
        <div className="max-w-md text-center text-white px-4">
          <Image
            src="/icons/auth/enter-otp-pages.svg"
            alt="Verify illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
          <p className="mt-6 font-semibold text-lg">
            It&apos;s just OTP verification
          </p>
          <p className="text-sm opacity-80">
            You are one step away from recovering your password.
          </p>
        </div>
      </div>
    </div>
  );
}
