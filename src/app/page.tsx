import { Hero } from "@/components/landing/hero";

export const metadata = {
  title: "Iniciar sesión · Portal de Partners Mensis",
  description: "Accede al Portal de Partners de Mensis",
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ inactivo?: string }>;
}) {
  // `?inactivo=1` lo pone requireProfile() cuando expulsa a alguien con la
  // cuenta desactivada: sin este aviso el portal lo devuelve al login sin
  // explicar por qué.
  const { inactivo } = await searchParams;

  return (
    <Hero
      notice={
        inactivo
          ? "Tu cuenta fue desactivada. Contacta a tu ejecutivo de Mensis para recuperar el acceso."
          : undefined
      }
    />
  );
}
