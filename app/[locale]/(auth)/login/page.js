import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Section - Login Form */}
      <div className="flex items-center justify-center p-8">
        <LoginForm />
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden md:flex items-center justify-center bg-[#4698E3]">
        <div className="max-w-md text-center text-white px-4">
          <Image
            src="/icons/auth/login-pages.svg"
            alt="Login illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
          <p className="mt-6 font-semibold text-lg">Connect with any device.</p>
          <p className="text-sm opacity-80">
            Everything you need is an internet connection.
          </p>
        </div>
      </div>
    </div>
  );
}
