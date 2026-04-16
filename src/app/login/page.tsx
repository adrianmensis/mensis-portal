import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in · Mensis",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-brand-light/30 p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-3xl leading-tight text-brand">
            Mensis
          </h1>
          <p className="text-sm text-zinc-600">Sign in to continue.</p>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
}
