import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center bg-ink px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <BrandLogo name="Capitalink Technologies" light className="text-xl" />
          <h1 className="mt-4 text-xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Content, leads and analytics</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
