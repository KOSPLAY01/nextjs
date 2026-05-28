"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated, deleteSession, getSession } from "@/lib/session";

export default function Header() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        const session = getSession();
        setUserName(session?.name || "");
      }
    };

    checkAuth();

    // Listen for session changes (same tab) and storage changes (other tabs)
    window.addEventListener("sessionChange", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("sessionChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    deleteSession();
    setAuthenticated(false);
    router.push("/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-gray-100 transition"
        >
          Contact App
        </Link>

        <nav className="flex space-x-4">
          {authenticated ? (
            <>
              <span className="py-2 px-3 rounded text-gray-100">
                Welcome, {userName}!
              </span>
              <Link
                href="/contacts"
                className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
              >
                All Contacts
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-4 py-2 rounded font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
