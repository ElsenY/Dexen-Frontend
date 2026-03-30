import React, { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Login failed. Please check your credentials. or create user at /admin route",
        );
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.access_token);
      navigate("/profile");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-[#4f46e5]/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#3b82f6]/10 rounded-full blur-[80px] animate-pulse"></div>

      <div className="w-full max-w-md relative z-10 glass rounded-3xl p-8 md:p-12 animate-fade-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#6366f1]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#6366f1]/20">
            <LogIn size={32} className="text-[#6366f1]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-center">
            Enter your details to access your account
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center mb-8 animate-fade-up">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors"
                size={20}
              />
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-300">
                Password
              </label>
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
