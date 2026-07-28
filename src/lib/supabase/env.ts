// Las credenciales de Supabase viajan como cabecera HTTP (`Authorization:
// Bearer <key>`). Un salto de línea o un espacio pegado por accidente al copiar
// la clave en el panel del hosting hace que `Headers.append` la rechace con
// "is an invalid header value" — un error que aparece recién al crear un
// partner y no dice nada sobre la variable mal cargada. Ni las URLs ni los JWT
// contienen espacios, así que limpiarlos aquí es seguro y convierte ese fallo
// en un mensaje que nombra la variable.
//
// El valor se recibe ya leído (`process.env.NEXT_PUBLIC_...`) y no por nombre:
// Next reemplaza esas expresiones literales en el build, y un acceso dinámico
// dejaría las públicas en `undefined` en el navegador.
export function supabaseEnv(value: string | undefined, name: string): string {
  const clean = (value ?? "").replace(/\s+/g, "");
  if (!clean) throw new Error(`Falta la variable de entorno ${name}.`);
  return clean;
}
