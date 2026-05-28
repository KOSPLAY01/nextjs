"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/session";
import clientData from "@/lib/clientData";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = clientData.findUserByEmailAndPassword(email, password);
      if (!user) {
        setError("Invalid email or password");
        return;
      }
      setSession({ userId: user.id, email: user.email, name: user.name });
      router.push("/contacts");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Login
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-black font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-black">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-500 hover:underline font-semibold"
          >
            Register
          </Link>
        </p>

        <div className="mt-6 p-4 bg-gray-100 rounded text-sm text-black">
          <p className="font-semibold mb-2">Demo Account:</p>
          <p>Email: admin@gmail.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
