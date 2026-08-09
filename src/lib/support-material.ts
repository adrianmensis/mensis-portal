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

// `playlistId` es opcional: una serie puede empezar en el portal antes de tener
// su playlist armada en YouTube. Sin id no se muestra el enlace "Ver playlist".
export type AcademyPlaylist = {
  id: string;
  title: string;
  description?: string;
  playlistId?: string;
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
      { youtubeId: "wzw5PfbnEDE", title: "🗺️🛠️ Mensis Tour Partner Toolkit: Domina los Recursos Oficiales de Mensis 🔗" },
      { youtubeId: "AYuBr4uSt-c", title: "Lanzamiento del Portal Exclusivo para Partners" },
    ],
  },
  {
    id: "nuevas-funciones",
    title: "🚀 Nuevas funciones de la plataforma",
    description: "Evoluciona al siguiente nivel: descubre lo nuevo.",
    playlistId: "PLqh3nKzRgK1ua-RwWvwA12Zwj4wo3BkOM",
    videos: [
      { youtubeId: "MDMYibe0Goc", title: "Integración con WhatsApp, Portugués, Dashboard y Tu Logo 🌎🤖" },
      { youtubeId: "oQvlmtzaiSg", title: "Escala tus Ventas con el Nuevo Portal de Partners 🚀" },
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
      { youtubeId: "RS_sR0jWcuQ", title: "🎯 El Simulador Comercial de Mensis" },
    ],
  },
  {
    id: "codigo-abierto",
    title: "🌐 Código Abierto // Inteligencia Colectiva 🧠",
    description: "Eventos abiertos al público.",
    videos: [
      {
        youtubeId: "OFMeaW7nw9Q",
        title: "👥 Webinar La IA que no reemplaza personas: Multiplica su experiencia 🚀",
      },
    ],
  },
  {
    id: "ia-aplicada",
    title: "🦾 IA Aplicada: Casos de Uso Reales 🛠️",
    description: "Cómo lo resolvieron otros clientes, caso por caso.",
    videos: [
      {
        youtubeId: "bkJzfkHuYcU",
        title: "🎓 El Aula del Futuro Hoy: Gemelos Digitales en Educación // Caso Cocoserv ⚙️",
      },
    ],
  },
];

export const SUPPORT_MATERIAL: MaterialSection[] = [
  {
    id: "marketing",
    title: "Material de marketing",
    description: "Recursos para compartir con prospectos y clientes.",
    items: [
      {
        type: "doc",
        title: "Carpeta de material publicitario (Google Drive)",
        description: "Material publicitario y recursos compartidos por Mensis.",
        url: "https://drive.google.com/drive/folders/19VHghfbwP_BRP2zZ2ekoD4-o-xPByQOK?usp=sharing",
      },
    ],
  },
];
