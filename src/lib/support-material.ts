// Support material shown in /app/resources. Static for now — replace the
// placeholder URLs / YouTube IDs with the real ones (or we can move this to
// the database later so admins edit it from the UI).

export type MaterialType = "video" | "doc" | "usecase";

export type MaterialItem = {
  type: MaterialType;
  title: string;
  description?: string;
  url: string;
  youtubeId?: string; // single video (type "video")
  playlistId?: string; // YouTube playlist (type "video")
};

export type MaterialSection = {
  id: string;
  title: string;
  description: string;
  items: MaterialItem[];
};

// Academia is organised into "subfolders" — one per YouTube playlist — each
// holding its individual videos. Add a video as { youtubeId, title }; grab the
// id from a watch URL (youtube.com/watch?v=ID) or an embed src.
export type AcademyVideo = { youtubeId: string; title: string };

export type AcademyPlaylist = {
  id: string;
  title: string;
  description?: string;
  playlistId: string;
  videos: AcademyVideo[];
};

export const ACADEMY: AcademyPlaylist[] = [
  {
    id: "universidad",
    title: "🎓 Universidad Corporativa Mensis",
    description: "Demostración estratégica y dominio de la plataforma.",
    playlistId: "PLqh3nKzRgK1uYoBWkb_3W9S6J3-wGWerP",
    videos: [
      { youtubeId: "wDUwtrOEN4s", title: "Módulo #1: Configuración de la Empresa ⚙️" },
      { youtubeId: "vzmjnJiAiBY", title: "Módulo #2: Configuración Cuenta Admin" },
      { youtubeId: "LOpl-x0_W80", title: "Módulo #3: Gestión y Creación de Usuarios 👥" },
      { youtubeId: "AeJwSwR1e7A", title: "Módulo #4: Documentos como Fuente de Conocimiento" },
      { youtubeId: "heXVvSonAPU", title: "Módulo #5: Levantamiento de Experiencias 🚀" },
      { youtubeId: "r20clvrStRk", title: "Módulo #6: Creación de Rutas de Aprendizaje 📚" },
      { youtubeId: "cV8ghuAFcKA", title: "Módulo #7: Funcionalidades 🛠️ y Beneficios 💡" },
    ],
  },
  {
    id: "nuevas-funciones",
    title: "🚀 Nuevas funciones de la plataforma",
    description: "Evoluciona al siguiente nivel: descubre lo nuevo.",
    playlistId: "PLqh3nKzRgK1ua-RwWvwA12Zwj4wo3BkOM",
    videos: [
      { youtubeId: "MDMYibe0Goc", title: "Integración con WhatsApp, Portugués, Dashboard y Tu Logo 🌎🤖" },
    ],
  },
  {
    id: "sales-lab",
    title: "🧪 Sales Lab Mensis",
    description: "Laboratorio de ventas: técnicas y práctica.",
    playlistId: "PLqh3nKzRgK1tsGLfjnjlHAODl9jnjnC7D",
    videos: [
      { youtubeId: "LoSVGyG8RnA", title: "Hackea la Venta Técnica y aborda objeciones especializadas" },
      { youtubeId: "slaMhGcOsx0", title: "🚀 El Pitch Perfecto 🎯 Simulacro de Ventas" },
      { youtubeId: "nHvug049mHQ", title: "El Arte de Vender IA: Tácticas Comerciales para AI Partners 🏆" },
    ],
  },
];

export const SUPPORT_MATERIAL: MaterialSection[] = [
  {
    id: "implementation",
    title: "Implementation Guide",
    description: "Documentos para configurar y desplegar Mensis con tus clientes.",
    items: [
      { type: "doc", title: "Guía de implementación", description: "Paso a paso de onboarding técnico.", url: "#" },
      { type: "doc", title: "Checklist de despliegue", description: "Lista de verificación antes de salir a producción.", url: "#" },
      { type: "doc", title: "Integraciones (Microsoft / Google)", description: "Cómo conectar las herramientas del cliente.", url: "#" },
    ],
  },
  {
    id: "casos-uso",
    title: "Casos de uso",
    description: "Ejemplos reales de cómo distintas organizaciones usan Mensis.",
    items: [
      { type: "usecase", title: "Retención de conocimiento de líderes", description: "Preservar la experiencia de directivos clave.", url: "#" },
      { type: "usecase", title: "Onboarding acelerado", description: "Nuevos empleados aprenden de los mejores 24/7.", url: "#" },
      { type: "usecase", title: "Soporte interno escalable", description: "Un experto disponible para toda la organización.", url: "#" },
    ],
  },
  {
    id: "marketing",
    title: "Material de marketing",
    description: "Recursos para compartir con prospectos y clientes.",
    items: [
      { type: "doc", title: "Pitch deck oficial", description: "Presentación lista para usar.", url: "#" },
      { type: "doc", title: "One-pager y brochures", description: "Material imprimible y compartible.", url: "#" },
    ],
  },
];
