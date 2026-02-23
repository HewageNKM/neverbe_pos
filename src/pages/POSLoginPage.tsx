import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseClient";
import { Button, Input } from "antd";
import { IconMail, IconLock, IconShieldLock } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function POSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(
        error.message || "Failed to login. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border border-green-200 shadow-sm">
            <IconShieldLock size={32} className="text-green-600" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            POS Terminal Login
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-gray-500 uppercase tracking-widest">
            Enter your employee credentials
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-green-900/5 sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700 uppercase tracking-wide"
              >
                Email Address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  size="large"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  prefix={<IconMail size={20} className="text-gray-400 mr-2" />}
                  className="h-14 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-base font-medium"
                  placeholder="admin@neverbe.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="mt-1">
                <Input.Password
                  id="password"
                  size="large"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  prefix={<IconLock size={20} className="text-gray-400 mr-2" />}
                  className="h-14 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-base font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-base font-black uppercase tracking-widest shadow-lg shadow-green-500/30 border-none transition-all hover:-translate-y-0.5"
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
