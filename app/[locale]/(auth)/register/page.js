import Image from "next/image";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Section - Register Form */}
      <div className="flex items-center justify-center p-8">
        <RegisterForm />
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden md:flex items-center justify-center bg-[#4698E3]">
        <div className="max-w-md text-center text-white px-4">
          <Image
            src="/icons/auth/create-account-pages.svg"
            alt="Register illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
          <p className="mt-6 font-semibold text-lg">Join us!</p>
          <p className="text-sm opacity-80">
            Just go through the boring process of creating an account.
          </p>
        </div>
      </div>
    </div>
  );
}
