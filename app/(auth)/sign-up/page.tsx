"use client";

import { AuthLayout } from "@/components/auth-layout";
import { signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
    });
    
    if (signUpError) {
      setError(signUpError.message || "Failed to create account");
      setLoading(false);
    } else {
      router.push("/editor");
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-copy-primary">Create an account</h2>
          <p className="text-copy-muted mt-1">Get started with your free account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="text-sm text-red-500">{error}</div>}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-copy-primary">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 bg-surface border border-surface-border rounded-xl text-copy-primary focus:outline-none focus:border-copy-primary"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-copy-primary">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 bg-surface border border-surface-border rounded-xl text-copy-primary focus:outline-none focus:border-copy-primary"
              required 
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-copy-primary">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 bg-surface border border-surface-border rounded-xl text-copy-primary focus:outline-none focus:border-copy-primary"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full py-2 bg-copy-primary text-base font-medium text-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        
        <div className="text-center text-sm text-copy-muted">
          Already have an account? <a href="/sign-in" className="text-copy-primary hover:underline">Sign in</a>
        </div>
      </div>
    </AuthLayout>
  );
}
