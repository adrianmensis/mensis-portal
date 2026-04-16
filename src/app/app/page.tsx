import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";

export const metadata = {
  title: "Portal · Mensis",
};

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col gap-6 bg-brand-light/30 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-brand">
          Mensis Portal
        </h1>
        <form action={logout}>
          <Button variant="secondary" type="submit">
            Salir
          </Button>
        </form>
      </header>

      <Card>
        <h2 className="text-lg font-medium text-brand">Bienvenido</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Sesión iniciada como <span className="font-medium">{user?.email}</span>.
        </p>
      </Card>
    </div>
  );
}
