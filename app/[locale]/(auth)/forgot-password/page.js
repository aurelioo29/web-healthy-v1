import ForgotPasswordForm from "./ForgotPasswordForm";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">
            Forgot your password?
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your Email and get OTP to verification.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center bg-[#4698E3]">
        <div className="max-w-md text-center text-white px-4">
          <Image
            src="/icons/auth/forget-password-pages.svg"
            alt="Forget password illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
          <p className="mt-6 font-semibold text-lg">Forgot your password?</p>
          <p className="text-sm opacity-80">You can get them back easily.</p>
        </div>
      </div>
    </div>
  );
}
