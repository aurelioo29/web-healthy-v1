import ResetPasswordForm from "./ResetPasswordForm";
import Image from "next/image";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">
            Enter your new password
          </h1>
          <p className="mt-2 text-gray-600">
            Enter the code and your new password.
          </p>

          <ResetPasswordForm />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center bg-[#4698E3]">
        <div className="max-w-md text-center text-white px-4">
          <Image
            src="/icons/auth/enter-password-pages.svg"
            alt="Reset password illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
          <p className="mt-6 font-semibold text-lg">This is the end!</p>
          <p className="text-sm opacity-80">
            After entering the new password you will gain access to your
            account.
          </p>
        </div>
      </div>
    </div>
  );
}
