import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar · Mensis Portal",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-brand-light/30 p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-brand">
            Mensis Portal
          </h1>
          <p className="text-sm text-zinc-600">
            Entra con tu cuenta del equipo.
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
}
