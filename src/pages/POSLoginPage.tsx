import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseClient";
import { Button, Input, Card } from "antd";
import { IconMail, IconLock } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function POSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "POS | Login";
  }, []);

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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 relative overflow-hidden font-['Inter', sans-serif]">
      {/* Subtle Background Decorations */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-green-100/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-green-50/50 rounded-full blur-[100px]" />

      <div className="w-full max-w-[420px] z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl border border-zinc-200 mb-6 shadow-sm group hover:scale-105 transition-transform duration-500">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-12 h-12 object-contain group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all"
            />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">
            POS Terminal
          </h1>
        </div>

        <Card
          className="bg-white/70 border-zinc-200/50 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[32px] overflow-hidden animate-in fade-in zoom-in duration-500"
          bodyStyle={{ padding: "40px" }}
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <Input
                size="large"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefix={<IconMail size={20} className="text-zinc-400" />}
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-300 focus:border-green-500/50 focus:bg-white transition-all text-base font-medium"
                placeholder="operator@neverbe.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <Input.Password
                size="large"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                prefix={<IconLock size={20} className="text-zinc-400" />}
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-300 focus:border-green-500/50 focus:bg-white transition-all text-base font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-base font-bold uppercase tracking-wider border-none shadow-[0_8px_20px_-4px_rgba(22,163,74,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center mt-10 text-zinc-400 text-sm font-medium tracking-wide">
          &copy; 2026 NEVERBE
        </p>
      </div>
    </div>
  );
}
