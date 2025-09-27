"use client";

import { useRouter } from "next/navigation";
import axios from "@/lib/axios"; // optional, kalau mau hit backend logout
import Toastify from "toastify-js";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
    }

    try {
      delete axios.defaults.headers.common["Authorization"];
    } catch (e) {}

    Toastify({
      text: "Logged out",
      duration: 2000,
      gravity: "top",
      position: "right",
      backgroundColor: "#4698E3",
    }).showToast();

    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 bg-[#4698E3] text-white rounded-md text-sm cursor-pointer"
    >
      Logout
    </button>
  );
}
