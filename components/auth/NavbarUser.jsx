"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import LogoutButton from "./LogoutButton";
import axios from "@/lib/axios";

export default function NavbarUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const me = res.data.user;
        setUsername(me.username);
        setEmail(me.email);
        setRole(me.role);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const avatarSrc = "/icons/auth/avatar.webp";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <span className="sr-only">Open user menu</span>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
          <Image
            src={avatarSrc}
            alt="User avatar"
            width={40}
            height={40}
            className="cursor-pointer"
          />
        </div>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50"
        >
          <div className="p-3 border-b space-y-1">
            <p className="text-lg font-bold text-gray-900 truncate">
              {username || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {email || "no-email@provided"}
            </p>
            <p className="text-xs text-gray-500 truncate">{role || "none"}</p>
          </div>

          <div className="p-2">
            <a
              href="/dashboard/settings"
              className="block px-3 py-2 text-sm rounded hover:bg-gray-50"
              role="menuitem"
            >
              Settings
            </a>

            <div className="my-1 border-t" />
            <div className="px-3 py-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
