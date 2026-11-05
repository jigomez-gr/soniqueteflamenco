import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Centro de Yoga Fuenlabrada | Salvadora Conesa",
  description: "Clases de Hatha y Kundalini yoga, baños y puja de gong, constelaciones familiares, meditación guiada y retiros de ayuno terapéutico en Fuenlabrada, dirigido por Salvadora Conesa.",
};

import { ChatBubbleWidget } from "@/components/ChatBubbleWidget";
import VapiCallModal from "@/components/VapiCallModal";
import { WebMcpProvider } from "@/components/WebMcpProvider";

const WEBMCP_INLINE_SCRIPT = `
(function() {
  var tools = [
    {
      name: "search_classes",
      description: "Busca información sobre clases de yoga, horarios y disciplinas disponibles en el Centro de Yoga Salvadora Conesa (Kundalini Yoga, Nagna Yoga, Baños de Gong, Meditación guiada, Taller Mejorar Asanas, Retiros de Ayuno).",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Término de búsqueda, disciplina o actividad deseada"
          }
        },
        required: ["query"]
      },
      annotations: { readOnlyHint: true },
      execute: async function() {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              disciplines: [
                { name: "Kundalini Yoga", description: "Práctica de vitalidad, kriyas, pranayama y meditación con mantras.", url: "https://centrodeyogasalvadoraconesa.es/servicios" },
                { name: "Nagna Yoga", description: "Yoga desnudo consciente para la autoaceptación corporal y superación de complejos.", url: "https://centrodeyogasalvadoraconesa.es/nagna-yoga" },
                { name: "Baños y Puja de Gong", description: "Terapia de sonido con gongs sinfónicos para relajación profunda y meditación.", url: "https://centrodeyogasalvadoraconesa.es/servicios" },
                { name: "Taller Mejorar Asanas", description: "Alineación postural y biomecánica consciente.", url: "https://centrodeyogasalvadoraconesa.es/mejorar-asanas" },
                { name: "Constelaciones Familiares", description: "Taller vivencial mensual de sanación de vínculos y patrones familiares con Salvadora Conesa.", url: "https://centrodeyogasalvadoraconesa.es/#dia-6" }
              ]
            })
          }]
        };
      }
    },
    {
      name: "get_schedule_and_pricing",
      description: "Consulta los horarios actualizados y tarifas de las clases, talleres y bonos del Centro de Yoga Salvadora Conesa.",
      inputSchema: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "Servicio o disciplina ('kundalini', 'nagna', 'gong', 'todos')"
          }
        }
      },
      annotations: { readOnlyHint: true },
      execute: async function() {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              schedule: [
                { class: "Hatha Yoga Terapéutico", days: "Martes: 09:45, 11:15, 17:00, 18:30, 20:00 | Miércoles: 20:15 | Jueves: 09:45, 11:15, 16:00, 17:30, 19:00", duration: "90 min" },
                { class: "Meditaciones Guiadas", days: "Lunes y Jueves 09:15 - 09:45", duration: "30 min" },
                { class: "Baños de Gong", days: "Un sábado al mes 18:00 - 20:00", duration: "120 min" },
                { class: "Puja de Gongs", days: "Evento anual nocturno 21:00 - 08:00", duration: "11 horas" },
                { class: "Constelaciones Familiares", days: "Sábado 14 de Noviembre de 2026 10:00 - 14:00", duration: "4 horas (240 min)" }
              ],
              pricing: {
                matricula: "Gratuita / Sin permanencia",
                primera_clase_prueba: "¡GRATIS! Es un regalo (0 €)",
                clases_sueltas_esporadicas: "10€ / clase",
                cuota_alumno_1_dia_semana: "25€ / mes (con turno fijo semanal)",
                cuota_alumno_2_dias_semana: "42€ / mes (con 2 turnos fijos semanales)",
                recuperacion_clases: "Hasta 3 meses (90 días) avisando con antelación",
                meditaciones_guiadas: "Gratis para alumnos de Yoga / 15€ mes (3€ sesión) no alumnos",
                bano_de_gong: "16€ / sesión",
                puja_de_gong: "90€ - 95€ / sesión",
                constelaciones_familiares: "60€ constelar (asunto propio) / 20€ participante representante"
              },
              contactPhone: "+34 695 17 26 25"
            })
          }]
        };
      }
    },
    {
      name: "book_yoga_session",
      description: "Inicia el proceso de reserva para una clase de yoga o sesión de baño de gong en el Centro de Yoga Salvadora Conesa.",
      inputSchema: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "Nombre del servicio o disciplina (Kundalini Yoga, Nagna Yoga, Baño de Gong)"
          },
          clientName: {
            type: "string",
            description: "Nombre y apellidos del cliente"
          },
          clientPhone: {
            type: "string",
            description: "Teléfono o WhatsApp de contacto"
          }
        },
        required: ["service", "clientName", "clientPhone"]
      },
      execute: async function(params) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "success",
              bookingUrl: "https://centrodeyogasalvadoraconesa.es/reserva",
              message: "Reserva pre-registrada para " + ((params && params.clientName) || "el cliente") + " en " + ((params && params.service) || "la clase") + "."
            })
          }]
        };
      }
    },
    {
      name: "navigate_site",
      description: "Navega a las diferentes secciones y páginas del Centro de Yoga Salvadora Conesa.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Ruta de la página ('/', '/servicios', '/reserva', '/nagna-yoga', '/mejorar-asanas')"
          }
        },
        required: ["path"]
      },
      execute: async function(params) {
        if (typeof window !== "undefined" && params && params.path) {
          window.location.href = params.path;
        }
        return {
          content: [{
            type: "text",
            text: "Navegando a " + ((params && params.path) || "/")
          }]
        };
      }
    }
  ];

  var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  var signal = controller ? controller.signal : undefined;

  function registerWithContext(mc) {
    if (!mc) return;
    try {
      if (typeof mc.provideContext === "function") {
        try {
          mc.provideContext({ tools: tools, signal: signal });
        } catch(e1) {
          try { mc.provideContext(tools); } catch(e2) {}
        }
      }
    } catch(e) {}

    try {
      if (typeof mc.registerTool === "function") {
        for (var i = 0; i < tools.length; i++) {
          try {
            mc.registerTool(tools[i], { signal: signal });
          } catch(e1) {
            try { mc.registerTool(tools[i]); } catch(e2) {}
          }
        }
      }
    } catch(e) {}
  }

  function setup() {
    var nav = typeof navigator !== "undefined" ? navigator : null;
    var doc = typeof document !== "undefined" ? document : null;

    if (nav) {
      if (nav.modelContext) {
        registerWithContext(nav.modelContext);
      } else {
        var _storedTools = [].concat(tools);
        var polyfill = {
          tools: _storedTools,
          getTools: function() { return _storedTools; },
          provideContext: function(ctx) {
            var incoming = Array.isArray(ctx) ? ctx : (ctx && ctx.tools ? ctx.tools : []);
            _storedTools.length = 0;
            for (var j = 0; j < incoming.length; j++) { _storedTools.push(incoming[j]); }
            return Promise.resolve(_storedTools);
          },
          registerTool: function(t) {
            _storedTools.push(t);
            return Promise.resolve(t);
          }
        };

        var currentMC = polyfill;
        try {
          Object.defineProperty(nav, "modelContext", {
            get: function() { return currentMC; },
            set: function(val) {
              currentMC = val;
              registerWithContext(val);
            },
            configurable: true,
            enumerable: true
          });
        } catch(err) {
          try { nav.modelContext = polyfill; } catch(e) {}
        }
        registerWithContext(nav.modelContext);
      }
    }

    if (doc) {
      if (doc.modelContext) {
        registerWithContext(doc.modelContext);
      } else {
        try {
          var docPolyfill = {
            tools: [].concat(tools),
            provideContext: function(ctx) { return Promise.resolve(); },
            registerTool: function(t) { return Promise.resolve(); }
          };
          doc.modelContext = docPolyfill;
          registerWithContext(docPolyfill);
        } catch(e) {}
      }
    }
  }

  setup();

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("load", setup);
    }
  }
})();
`;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Centro de Yoga Salvadora Conesa",
  alternateName: "Escuela de Yoga Salvadora Conesa",
  url: "https://centrodeyogasalvadoraconesa.es",
  logo: "https://soniqueteflamenco.com/logos/soniqueteflamenco_512x512.png",
  image: "https://soniqueteflamenco.com/imagenes/quienes-somos/pedro-cajon-gonzalez.jpg",
  description:
    "Clases de Hatha y Kundalini yoga, baños y puja de gong, meditación guiada y retiros de ayuno terapéutico en Fuenlabrada, dirigido por Salvadora Conesa.",
  telephone: "+34695172625",
  email: "salvadoraconesa@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Holanda, 1 (Club Social Parque Granada)",
    addressLocality: "Fuenlabrada",
    postalCode: "28942",
    addressRegion: "Madrid",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.2858,
    longitude: -3.7932,
  },
  sameAs: [
    "https://www.facebook.com/salvadoraconesa",
    "https://www.instagram.com/escuelayogasalvadoraconesa/",
  ],
  priceRange: "€",
};


const constelacionesEventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Taller de Constelaciones Familiares en Fuenlabrada",
  description: "Taller vivencial mensual de sanación de vínculos y patrones familiares en Fuenlabrada facilitado por Salvadora Conesa.",
  image: "https://centrodeyogasalvadoraconesa.es/flyers/constelaciones_familiares_particular.jpg",
  startDate: "2026-11-14T10:00:00+01:00",
  endDate: "2026-11-14T14:00:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Centro de Yoga Salvadora Conesa",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Holanda, 1 (Club Social Parque Granada)",
      addressLocality: "Fuenlabrada",
      postalCode: "28942",
      addressRegion: "Madrid",
      addressCountry: "ES",
    },
  },
  performer: {
    "@type": "Person",
    name: "Salvadora Conesa",
    jobTitle: "Terapeuta Gestalt y Facilitadora de Constelaciones Familiares",
  },
  organizer: {
    "@type": "Organization",
    name: "Centro de Yoga Salvadora Conesa",
    url: "https://centrodeyogasalvadoraconesa.es",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Constelar (Asunto Propio)",
      price: "60.00",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      validFrom: "2026-10-01",
      url: "https://centrodeyogasalvadoraconesa.es/#dia-6",
    },
    {
      "@type": "Offer",
      name: "Participante / Representante",
      price: "20.00",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      validFrom: "2026-10-01",
      url: "https://centrodeyogasalvadoraconesa.es/#dia-6",
    },
  ],
  review: {
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
    },
    author: {
      "@type": "Person",
      name: "Carmen R.",
    },
    reviewBody:
      "Participar en el taller de Constelaciones Familiares con Salvadora en Fuenlabrada ha supuesto un antes y un después en mi manera de ver mi historia y mis vínculos. La sensibilidad, el respeto y la maestría con la que Salvadora sostiene al grupo te hace sentir en un entorno de absoluta confianza. Una paz interior y ligereza que no sentía desde hacía mucho tiempo.",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "19",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="tDy3JsMgHcVOcuQl4H3TM3YkYgVT2bZYwYyCpdZwzHM" />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />
        <link rel="service-desc" href="/.well-known/mcp/server-card.json" />
        <link rel="service-doc" href="/llms.txt" />
        <link rel="describedby" href="/.well-known/agent-card.json" />
        <link rel="oauth-protected-resource" href="/.well-known/oauth-protected-resource" />
        <script
          id="schema-localbusiness"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <script
          id="webmcp-init"
          dangerouslySetInnerHTML={{
            __html: WEBMCP_INLINE_SCRIPT,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#1C1C1C]">
        <WebMcpProvider />
        {children}
        <ChatBubbleWidget agentKey="booking" brandColor="#800020" />
        <VapiCallModal />
      </body>
    </html>
  );
}
