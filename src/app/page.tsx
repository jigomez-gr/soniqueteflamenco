import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import VideoGallery from "@/components/VideoGallery";
import ContactQueryForm from "@/components/ContactQueryForm";
import HeroMedia from "@/components/HeroMedia";
import PrologoGallery from "@/components/PrologoGallery";
import AtmosphereGallery from "@/components/AtmosphereGallery";
import NagnaYogaSection from "@/components/NagnaYogaSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CrmBookingButton from "@/components/CrmBookingButton";
import VapiCallButton from "@/components/VapiCallButton";
import { VapiVoiceBookingButton } from "@/components/VapiVoiceBookingButton";
import Footer from "@/components/Footer";
import WhatsAppContactSection from "@/components/WhatsAppContactSection";
import WhatsAppQuickBanner from "@/components/WhatsAppQuickBanner";
import BajaServiciosSection from "@/components/BajaServiciosSection";
import { fetchCrmServices, findServiceByCodeOrId, formatDuration } from "@/lib/crmServices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Centro de Yoga Fuenlabrada | Clases, Baños de Gong y Constelaciones Familiares",
  description: "Centro de Yoga Salvadora Conesa en Fuenlabrada: Hatha y Kundalini yoga, baños y puja de gong, talleres de constelaciones familiares, meditación guiada y retiros de ayuno terapéutico.",
  alternates: {
    canonical: "https://salvadoraconesa.es/",
  },
};
import {
  Calendar, MapPin, Shield, Compass, FileText, CheckCircle2,
  HelpCircle, Mail, Phone, Clock, Award, Users, Music,
  Sparkles, Moon, Heart, Network, Activity, MessageCircle
} from "lucide-react";

// Server-side helper to check if mp4 videos exist in external media directory or /public/videos
function checkVideosExist() {
  const externalVideosDir = process.env.MEDIA_VIDEOS_DIR || "d:/tmp/antigraviti/salvadora/media_base/videos";
  const publicVideosDir = path.join(process.cwd(), "public", "videos");

  const checkVideo = (filename: string) =>
    fs.existsSync(path.join(externalVideosDir, filename)) ||
    fs.existsSync(path.join(publicVideosDir, filename));

  return {
    "itinerario-1": checkVideo("itinerario-1.mp4"),
    "itinerario-2": checkVideo("itinerario-2.mp4"),
    "itinerario-3": checkVideo("itinerario-3.mp4"),
    "itinerario-4": checkVideo("itinerario-4.mp4"),
    "itinerario-5": checkVideo("itinerario-5.mp4"),
    "itinerario-6": checkVideo("itinerario-6.mp4"),
    "itinerario-7": checkVideo("itinerario-7.mp4"),
    "itinerario-8": checkVideo("itinerario-8.mp4"),
    "itinerario-9": checkVideo("itinerario-9.mp4"),
    resumen: checkVideo("resumen.mp4"),
  };
}

// Server-side helper to read all images inside public/imagenes/diaX subdirectories
function getSubImages(dayNum: number): string[] {
  const publicDir = path.join(process.cwd(), "public", "imagenes", `dia${dayNum}`);
  if (!fs.existsSync(publicDir)) return [];
  try {
    return fs.readdirSync(publicDir)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map((file) => `/imagenes/dia${dayNum}/${file}`);
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const videosExist = checkVideosExist();
  const { services, categories } = await fetchCrmServices();

  const hatha1Svc = findServiceByCodeOrId(services, "clase_semanal");
  const hatha2Svc = findServiceByCodeOrId(services, "dos_clases_semanal");
  const gongSvc = findServiceByCodeOrId(services, "gong");
  const pujaSvc = findServiceByCodeOrId(services, "puja");
  const meditacionSvc = findServiceByCodeOrId(services, "meditacion");

  const hatha1Price = hatha1Svc?.price ? `${parseFloat(hatha1Svc.price).toFixed(0)} €` : "25 €";
  const hatha2Price = hatha2Svc?.price ? `${parseFloat(hatha2Svc.price).toFixed(0)} €` : "42 €";
  const gongPrice = gongSvc?.price ? `${parseFloat(gongSvc.price).toFixed(0)} €` : "16 €";
  const pujaPrice = pujaSvc
    ? (pujaSvc.sinpreciodefinitivo === "S"
        ? (pujaSvc.textosinpreciodefinitivo || "Precio por confirmar")
        : `${parseFloat(pujaSvc.price || "0").toFixed(0)} €`)
    : "el precio se determinara en funcion de las caracteristicas del viaje y alojamiento";
  const meditacionPrice = meditacionSvc?.price ? `${parseFloat(meditacionSvc.price).toFixed(0)} €` : "15 €";

  const meditacionSchedule = meditacionSvc?.scheduleText || "Lunes y Jueves de 09:15 a 09:45";
  const meditacionCapacity = meditacionSvc?.maxCapacity || 28;
  const gongSchedule = gongSvc
    ? (gongSvc.sinfechadefinitiva === "S"
        ? (gongSvc.textosinfechadefinitiva || "Fecha por confirmar")
        : (gongSvc.eventDatesText || gongSvc.scheduleText || "Un sábado al mes (18:00 a 20:00)"))
    : "Un sábado al mes (18:00 a 20:00)";
  const gongDuration = gongSvc ? formatDuration(gongSvc.durationMinutes) : "2 horas";
  const pujaSchedule = pujaSvc
    ? (pujaSvc.sinfechadefinitiva === "S"
        ? (pujaSvc.textosinfechadefinitiva || "Fecha por confirmar")
        : (pujaSvc.eventDatesText || pujaSvc.scheduleText || "Fecha por confirmar"))
    : "dos encuentros  la primera puja es proximamente y la segunda en marzo 2027";
  const pujaDuration = pujaSvc ? formatDuration(pujaSvc.durationMinutes) : "11 horas";

  const atmosphereDays = [
    {
      dayNum: 1,
      title: "Hatha Yoga & Yoga Nidra",
      subtitle: "Clases regulares corporales",
      href: "#itinerario",
      mainImage: "/imagenes/yoga/01_05_yoga_sala_centro_1920x1080.jpg",
      subImages: [
        "/imagenes/yoga/02_08_yoga_sonrisa_1920x1080.jpg",
        "/imagenes/yoga/03_02_yoga_postura_brazos_arriba_1920x1080.jpg",
        "/imagenes/yoga/04_03_yoga_postura_triangular_1920x1080.jpg",
        "/imagenes/yoga/05_01_yoga_postura_lateral_1920x1080.jpg",
        "/imagenes/yoga/06_07_yoga_apertura_1920x1080.jpg",
        "/imagenes/yoga/07_04_yoga_respiracion_1920x1080.jpg"
      ]
    },
    {
      dayNum: 2,
      title: "Kundalini & Meditación",
      subtitle: "Silencio y autoconocimiento",
      href: "#itinerario",
      mainImage: "/imagenes/meditacion/01_meditacion_silencio_ventana_1920x1080.jpg",
      subImages: [
        "/imagenes/meditacion/02_meditacion_salvadora_1920x1080.jpg",
        "/imagenes/meditacion/03_meditacion_grupal_luz_calida_1920x1080.jpg",
        "/imagenes/meditacion/04_meditacion_respiracion_1920x1080.jpg",
        "/imagenes/meditacion/05_meditacion_grupal_serena_1920x1080.jpg",
        "/imagenes/meditacion/06_meditacion_espacio_1920x1080.jpg"
      ]
    },
    {
      dayNum: 3,
      title: "Baños de Gong",
      subtitle: "Vibración sonora relajante",
      href: "#itinerario",
      mainImage: "/imagenes/gong/04_maria_con_cuenco_y_gong_1920x1080.jpg",
      subImages: [
        "/imagenes/gong/01_presentacion_terapeutas_1920x1080.jpg",
        "/imagenes/gong/02_terapeutas_con_instrumentos_1920x1080.jpg",
        "/imagenes/gong/03_sesion_en_grupo_movimiento_1920x1080.jpg",
        "/imagenes/gong/05_preparacion_del_espacio_1920x1080.jpg"
      ]
    },
    {
      dayNum: 4,
      title: "La Puja de Gong",
      subtitle: "Noche sagrada de sonido",
      href: "#itinerario",
      mainImage: "/imagenes/gong/06_experiencia_de_relajacion_sonora_1920x1080.jpg",
      subImages: [
        "/imagenes/gong/07_puja_de_gong_noche_1920x1080.jpg",
        "/imagenes/gong/08_altar_y_velas_puja_1920x1080.jpg",
        "/imagenes/gong/09_despertar_y_desayuno_1920x1080.jpg"
      ]
    },
    {
      dayNum: 5,
      title: "Terapia Gestalt",
      subtitle: "Acompañamiento humanista",
      href: "#itinerario",
      mainImage: "/imagenes/gestalt/01_gestalt_consulta_intima_1920x1080.jpg",
      subImages: [
        "/imagenes/gestalt/02_gestalt_escucha_empatica_1920x1080.jpg",
        "/imagenes/gestalt/03_gestalt_dialogo_presencia_1920x1080.jpg",
        "/imagenes/gestalt/04_gestalt_espacio_terapeutico_1920x1080.jpg"
      ]
    },
    {
      dayNum: 6,
      title: "Constelaciones Familiares",
      subtitle: "Ordenación de vínculos",
      href: "#itinerario",
      mainImage: "/imagenes/constelaciones/101_constelaciones_circulo_sereno_1920x1080.jpg",
      subImages: [
        "/imagenes/constelaciones/102_constelaciones_dinamica_grupo_1920x1080.jpg",
        "/imagenes/constelaciones/103_constelaciones_mirada_sistemica_1920x1080.jpg",
        "/imagenes/constelaciones/104_constelaciones_integracion_1920x1080.jpg"
      ]
    },
    {
      dayNum: 7,
      title: "Encuentros de Mujeres",
      subtitle: "Sororidad y naturaleza",
      href: "#itinerario",
      mainImage: "/imagenes/encuentro_mujeres/01_encuentro_mujeres_movimiento_naturaleza.jpeg",
      subImages: [
        "/imagenes/encuentro_mujeres/02_encuentro_mujeres_grupo.jpeg",
        "/imagenes/encuentro_mujeres/04_encuentro_mujeres_hoguera.jpeg",
        "/imagenes/encuentro_mujeres/06_encuentro_mujeres_circulo_bosque.jpeg"
      ]
    },
    {
      dayNum: 8,
      title: "Ayuno Terapéutico",
      subtitle: "Depuración y ligereza",
      href: "#itinerario",
      mainImage: "/imagenes/ayuno_terapeutico/ayunos_arreglados/201_ayuno_bienvenida_y_colores_1920x1080.jpg",
      subImages: [
        "/imagenes/ayuno_terapeutico/ayunos_arreglados/202_ayuno_energia_y_compania_1920x1080.jpg",
        "/imagenes/ayuno_terapeutico/ayunos_arreglados/203_ayuno_bano_de_mar_y_alegria_1920x1080.jpg",
        "/imagenes/ayuno_terapeutico/ayunos_arreglados/204_ayuno_masaje_y_cuidado_mutuo_1920x1080.jpg",
        "/imagenes/ayuno_terapeutico/ayunos_arreglados/205_ayuno_juego_y_complicidad_1920x1080.jpg",
        "/imagenes/ayuno_terapeutico/ayunos_arreglados/206_ayuno_paseo_junto_al_mar_1920x1080.jpg"
      ]
    },
    {
      dayNum: 9,
      title: "Bienestar Experience & Otras Disciplinas",
      subtitle: "Salud, consciencia y bienestar integral",
      href: "#dia-9",
      mainImage: "/flyers/flyer_actividades_especiales.jpg",
      subImages: [
        "/flyers/flyer_actividades_especiales.jpg",
        "/flyers/bienestar.png"
      ]
    }
  ];
  return (
    <div className="bg-[#FAF9F6] text-[#1C1C1C] min-h-screen selection:bg-[#800020] selection:text-white">
      {/* 1. Header Fijo */}
      <Navbar />

      {/* 2. Hero Section Editorial con Vídeo de Fondo Enmarcado */}
      <section id="inicio" className="hero-compact-laptop relative bg-[#FAF9F6] pt-14 pb-8 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-12 xl:pt-24 xl:pb-12 border-b border-[#C5A059]/15 flex flex-col items-center justify-start overflow-x-clip">
        {/* Subtle decorative background elements */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#800020_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center z-10 w-full">
          <div className="hero-tag inline-flex items-center space-x-2 text-[9px] sm:text-xs tracking-[0.12em] sm:tracking-[0.2em] text-[#96680E] uppercase font-extrabold mb-1.5 sm:mb-2">
            <span className="hidden sm:inline">Clases Regulares, Yoga, Baños de Gong, Gestalt, Constelaciones Familiares, Pujas Gong, Talleres y Retiros y Actividades Varias</span>
            <span className="inline sm:hidden">Yoga · Gong · Gestalt · Constelaciones · Retiros</span>
          </div>

          <h1 className="hero-title font-serif text-[13.5px] min-[375px]:text-[15.5px] xs:text-[17px] sm:text-2xl md:text-[38px] lg:text-[46px] xl:text-[48px] font-extrabold tracking-tight text-[#800020] uppercase leading-tight mb-1 sm:mb-1.5 select-none whitespace-nowrap">
            HACEMOS CONCIERTOS FLAMENCOS
          </h1>

          <p className="hero-desc text-[9px] sm:text-xs tracking-[0.12em] sm:tracking-[0.2em] text-[#96680E] uppercase font-extrabold text-center max-w-3xl mb-3 sm:mb-4.5 mt-1 px-4 sm:px-0">
            Desde 1986, guiando la práctica del yoga en un espacio cercano y sereno en Calle Holanda, 1, Fuenlabrada, junto al Metro Parque Europa (Línea 12 – MetroSur).
          </p>

          {/* Framed Media Block mimicking ccmfalla.com Paintings */}
          <div className="hero-video-frame max-w-[960px] w-full md:w-[min(90vw,calc((100vh-310px)*16/9))] bg-white p-1.5 sm:p-2.5 rounded-lg border border-[#C5A059]/25 shadow-xl shadow-[#800020]/5 mb-2 hover:shadow-2xl transition duration-500">
            <HeroMedia />
          </div>

          {/* Call to Actions in Editorial Style */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 w-full sm:w-auto items-center justify-center mt-2 sm:mt-3 px-4 sm:px-0">
            <CrmBookingButton
              className="hero-cta-btn w-full sm:w-auto flex items-center justify-center h-12 px-8 border border-transparent text-xs font-bold uppercase tracking-widest rounded-md text-white bg-[#800020] hover:bg-[#800020]/95 shadow-md shadow-[#800020]/15 hover:scale-102 transition duration-200 cursor-pointer"
              message="Hola, me gustaría consultar los servicios y actividades del Centro de Yoga Salvadora Conesa."
            >
              CONSULTA SERVICIOS
            </CrmBookingButton>
            <VapiCallButton
              className="hero-cta-btn w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 border border-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-md text-[#800020] hover:text-white bg-white hover:bg-[#800020] shadow-sm hover:scale-102 transition duration-200 cursor-pointer select-none"
              inquiry="Consulta general sobre clases de yoga y terapias"
            >
              TE LLAMAMOS GRATIS (IA)
            </VapiCallButton>
            <a
              href="#itinerario"
              className="hero-cta-btn w-full sm:w-auto flex items-center justify-center h-12 px-8 border border-[#C5A059] text-xs font-bold uppercase tracking-widest rounded-md text-[#800020] hover:text-white bg-white hover:bg-[#800020] shadow-sm hover:scale-102 transition duration-250"
            >
              Ver Actividades
            </a>
            <Link
              href="/servicios"
              className="hero-cta-btn w-full sm:w-auto flex items-center justify-center h-12 px-8 border border-[#800020] text-xs font-bold uppercase tracking-widest rounded-md text-white bg-[#800020] hover:bg-[#800020]/90 shadow-md hover:scale-102 transition duration-250"
            >
              Reservar por Actividad
            </Link>
          </div>
          {/* Fila única: Instagram + Facebook + Botón verde Reservas Email Wassap a su derecha con misma altura */}
          <div className="w-full max-w-xl mt-2 sm:mt-2.5 px-2 sm:px-0 z-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <a
              href="https://www.instagram.com/escuelayogasalvadoraconesa/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Escuela Yoga Salvadora Conesa"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-90 shadow-2xs transition active:scale-95 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/salvadoraconesa?rdid=6uiPQDgBUxQ7KTQ3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1EhbRPtem8%2F#"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook Centro de Yoga Salvadora Conesa"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-2xs transition active:scale-95 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>

            <a
              href="https://salvadora.jigretera.com/#contacto"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition active:scale-95 text-center cursor-pointer whitespace-nowrap"
              title="Reservas Email Wassap"
            >
              <Mail className="w-3.5 h-3.5 text-white shrink-0" />
              <MessageCircle className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Reservas Email Wassap</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator - refined */}
        <div className="hidden sm:flex absolute bottom-2 left-1/2 -translate-x-1/2 text-stone-400 text-[10px] tracking-widest uppercase flex-col items-center gap-1.5 animate-bounce select-none">
          <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 4. Sección Quiénes somos */}
      <section id="quienes-somos" className="py-20 bg-[#FAF9F6] border-b border-[#C5A059]/20 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabecera de la sección */}
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Trayectoria, Amistad y Pasión Flamenca
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#800020]">
              Quiénes somos
            </h2>
            <p className="mt-4 font-serif text-lg sm:text-2xl text-[#800020]/90 italic max-w-3xl mx-auto font-medium">
              Dos vidas, una amistad y una pasión compartida: el flamenco
            </p>
          </div>

          {/* Foto al comienzo de Quiénes somos */}
          <div className="mb-12 max-w-4xl mx-auto overflow-hidden rounded-2xl border-2 border-[#C5A059]/40 shadow-xl bg-stone-900 group">
            <img
              src="/imagenes/quienes-somos/quienes-somos-fundadores.jpg"
              alt="Pedro Cajón González y José Luis Poveda Cabrilla - Quiénes somos Soniquete Flamenco"
              className="w-full h-auto object-cover group-hover:scale-105 transition duration-700"
            />
          </div>

          {/* Bloque introductorio */}
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#C5A059]/25 shadow-sm space-y-5 text-sm sm:text-base text-[#1C1C1C]/85 leading-relaxed font-sans mb-12">
            <p className="text-base sm:text-lg text-stone-900 font-medium">
              <strong className="text-[#800020] font-bold">Soniqueteflamenco</strong> no nace de un despacho ni de una estrategia comercial. Nace de una amistad que ha atravesado décadas, de dos compañeros de trabajo, de fatigas y de historia, y de una pasión compartida por la música, la poesía y la libertad.
            </p>
            <p>
              Venimos de aquella España en blanco y negro, de los últimos años de la dictadura franquista y de quienes se rebelaron contra ella. Vivimos las luchas por la democracia, los sueños de la Transición y la explosión de libertad y creatividad de la Movida madrileña.
            </p>
            <p>
              Entre canciones, libros, viajes, proyectos, amores, derrotas y nuevos comienzos, aprendimos que hay cosas que merecen ser defendidas toda la vida. La cultura es una de ellas.
            </p>
            <p className="font-medium text-[#800020]">
              Hoy, después de muchos caminos recorridos, nos encontramos de nuevo alrededor de una pasión que nunca nos abandonó: <strong>el flamenco</strong>.
            </p>
            <p>
              No pretendemos reinventarlo. Queremos contribuir a que siga vivo, acercar sus artistas al público y crear escenarios donde el talento, la emoción y el duende encuentren su lugar.
            </p>
          </div>

          {/* Perfil 1: Pedro Cajón González */}
          <div className="bg-white rounded-2xl border border-[#C5A059]/30 shadow-md p-6 sm:p-10 mb-12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border-2 border-[#C5A059]/40 bg-stone-900 group">
                  <img
                    src="/imagenes/quienes-somos/pedro-cajon-gonzalez.jpg"
                    alt="Pedro Cajón González - Promotor Flamenco"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />
                </div>
                <p className="mt-3 text-center font-serif text-sm font-bold text-[#800020]">
                  Pedro Cajón González
                </p>
                <span className="text-[11px] text-[#96680E] font-semibold uppercase tracking-wider">
                  Promotor Flamenco
                </span>
              </div>
              <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-[#1C1C1C]/85 leading-relaxed font-sans">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#800020]">
                    Pedro Cajón González
                  </h3>
                  <h4 className="font-serif text-base sm:text-lg italic text-[#96680E] font-semibold mt-1">
                    Una vida entre artistas, peñas y escenarios
                  </h4>
                </div>
                <p>
                  Pedro es, ante todo, un melómano. Un enamorado de la música que encontró en el flamenco una forma de entender la vida.
                </p>
                <p>
                  Aficionado al cante desde que tiene memoria, comenzó su actividad como promotor flamenco en el año 2000, encargándose de la programación de artistas del festival <em>Ese Arte que Duele</em>.
                </p>
                <p>
                  Desde entonces ha organizado recitales en distintas peñas flamencas de Madrid, colaborado con destacados promotores de la capital, participado en asociaciones culturales flamencas y asesorado la programación de ciclos musicales.
                </p>
                <p>
                  Pero su relación con el flamenco va mucho más allá de los escenarios.
                </p>
                <p>
                  Ha compartido vivencias con artistas en las cuevas de Andalucía, ha conocido el flamenco en sus espacios más íntimos y conserva amistades nacidas entre guitarras, conversaciones interminables y madrugadas que parecían no tener fin.
                </p>
                <p>
                  A esa experiencia se suma una intensa trayectoria personal: el trabajo, la familia, la aventura de emprender distintos negocios y una vida recorrida con curiosidad y pasión.
                </p>
                <p>
                  Pedro conoce el flamenco desde dentro. No solo por los conciertos que ha organizado, sino por las personas que ha conocido y los afectos que ha cultivado.
                </p>
                <div className="rounded-xl bg-[#FAF9F6] border-l-4 border-[#800020] p-4 text-[#800020] font-semibold italic text-sm sm:text-base">
                  «Para él, el flamenco es, antes que nada, una forma de vivir.»
                </div>
              </div>
            </div>
          </div>

          {/* Perfil 2: José Luis Poveda Cabrilla */}
          <div className="bg-white rounded-2xl border border-[#C5A059]/30 shadow-md p-6 sm:p-10 mb-12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 flex flex-col items-center md:order-2">
                <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border-2 border-[#C5A059]/40 bg-stone-900 group">
                  <img
                    src="/imagenes/quienes-somos/jose-luis-poveda-cabrilla.jpg"
                    alt="José Luis Poveda Cabrilla - Programador, Escritor y Promotor"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />
                </div>
                <p className="mt-3 text-center font-serif text-sm font-bold text-[#800020]">
                  José Luis Poveda Cabrilla
                </p>
                <span className="text-[11px] text-[#96680E] font-semibold uppercase tracking-wider">
                  Innovación y Cultura
                </span>
              </div>
              <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-[#1C1C1C]/85 leading-relaxed font-sans md:order-1">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#800020]">
                    José Luis Poveda Cabrilla
                  </h3>
                  <h4 className="font-serif text-base sm:text-lg italic text-[#96680E] font-semibold mt-1">
                    La vida como aventura, la poesía como refugio
                  </h4>
                </div>
                <p>
                  José Luis pertenece a esa generación que llegó a la juventud cuando España comenzaba a sacudirse sus silencios.
                </p>
                <p>
                  Su historia podría comenzar en el otoño de 1976, cuando, en medio de una tormenta sentimental, recibió una llamada para incorporarse a un Ministerio. Era una oportunidad inesperada y el principio de un camino que lo llevaría mucho más lejos de lo imaginado.
                </p>
                <p>
                  Descubrió muy pronto la programación informática, una disciplina en la que encontró una vocación casi musical: la posibilidad de construir mundos nuevos a partir de la imaginación y la inteligencia.
                </p>
                <p>
                  Pero no estaba hecho para permanecer inmóvil.
                </p>
                <p>
                  Con apenas 27 años, una mochila y más preguntas que certezas, cruzó el Atlántico rumbo a San Juan de Puerto Rico para trabajar en la Universidad de Puerto Rico.
                </p>
                <p>
                  Después vendrían otros trabajos, proyectos, iniciativas empresariales, viajes, encuentros y desencuentros. Una vida intensa, atravesada por el deseo de crear, por la curiosidad y por esa necesidad de empezar de nuevo que acompaña a quienes nunca terminan de conformarse.
                </p>
                <p>
                  Y siempre, como un hilo invisible, estuvieron la música y la poesía.
                </p>
                <p>
                  Porque, como escribió en el prólogo de una novela autobiográfica, parecía que <strong>«un dios le había plantado las canciones en el alma»</strong>.
                </p>
                <p>
                  José Luis llega a Soniqueteflamenco con esa mezcla de experiencia, imaginación y entusiasmo que convierte cualquier proyecto en una nueva aventura.
                </p>
                <div className="rounded-xl bg-[#FAF9F6] border-l-4 border-[#800020] p-4 text-[#800020] font-semibold italic text-sm sm:text-base">
                  «Para él, la cultura es una expresión de libertad y una manera de seguir enamorado de la vida.»
                </div>
              </div>
            </div>
          </div>

          {/* Bloque Cierre: Soniqueteflamenco: el encuentro */}
          <div className="bg-gradient-to-br from-[#800020] to-[#5a0016] text-white p-8 sm:p-12 rounded-2xl shadow-xl space-y-6 text-center">
            <span className="text-xs uppercase tracking-widest text-[#E6C687] font-bold block">
              El Encuentro
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              Soniqueteflamenco: el encuentro
            </h3>
            <p className="text-base sm:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Somos dos trayectorias diferentes y una misma voluntad.
            </p>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto leading-relaxed">
              Creemos en los artistas que necesitan escenarios, en el público que busca emociones verdaderas y en esa extraordinaria capacidad del flamenco para unir generaciones, territorios y sensibilidades.
            </p>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto leading-relaxed">
              Queremos impulsar conciertos, acompañar a los artistas y contribuir, desde Madrid, a la difusión de un arte que no pertenece al pasado porque sigue reinventándose cada vez que alguien canta, toca o baila.
            </p>
            <p className="text-sm sm:text-base text-[#E6C687] max-w-3xl mx-auto font-medium">
              No nos mueve la nostalgia, aunque tengamos mucha memoria.
            </p>
            <div className="inline-block py-3 px-6 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-white font-serif italic text-base sm:text-lg font-bold">
              «Nos mueve el deseo de seguir haciendo cosas que merezcan la pena.»
            </div>
            <div className="pt-4 border-t border-white/20 text-xs sm:text-sm text-white/70">
              <strong className="text-white text-base font-serif block">Soniqueteflamenco.com</strong>
              <span className="italic">Promoción de Artistas y Realización de Conciertos de Flamenco.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. El Centro de Yoga Fuenlabrada */}
      <section className="pt-16 pb-24 bg-white border-b border-[#C5A059]/20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-3">
              Centro de Yoga Fuenlabrada
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#800020] mb-6">
              Salvadora Conesa
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed text-justify sm:text-center">
              <p>
                El Centro de Yoga Fuenlabrada de Salvadora Conesa es un espacio dedicado a la salud, el bienestar y el desarrollo integral de la persona en pleno corazón de Fuenlabrada. A través de la práctica regular de Hatha Yoga, Kundalini y meditación, ofrecemos herramientas reales para calmar la mente, fortalecer el cuerpo y reconectar con lo esencial.
              </p>
              <p>
                Además de nuestras sesiones semanales, contamos con renombradas experiencias de terapia de sonido como los Baños de Gong y la transformadora Puja de Gong nocturna, ambas guiadas por sonoterapeutas profesionales. Ofrecemos también una variada propuesta de retiros de Ayuno Terapéutico en plena naturaleza, diseñados para resetear el organismo y descansar profundamente.
              </p>
              <p>
                Colaboramos activamente con profesionales de disciplinas de salud, longevidad y bienestar integral como Bienestar Experience, nutrición celular consciente y hábitos saludables, consolidando un espacio de crecimiento y comunidad.
              </p>
            </div>
          </div>

          {/* Grid Layout: Video on the left, Photos on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mt-12">
            {/* Video Container (Left Column) */}
            <div className="flex flex-col justify-center">
              <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#C5A059]/25 shadow-xl shadow-[#800020]/5 hover:shadow-2xl transition duration-500 font-sans w-full">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 border border-stone-200">
                  <video
                    src="/videos/prologo.mp4"
                    poster="/videos/prologo_poster.jpg"
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                <div className="mt-4 text-center space-y-1 select-none border-t border-[#C5A059]/10 pt-4">
                  <p className="font-serif italic font-bold text-[#800020] text-sm sm:text-base">
                    "Un espacio para la calma"
                  </p>
                  <p className="tracking-widest uppercase text-[9px] sm:text-[10px] text-stone-500 font-semibold">
                    Presentación del Centro
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery (Right Column) */}
            <div>
              <PrologoGallery />
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 Nagna Yoga */}
      <section className="py-20 bg-[#FAF9F6] border-b border-[#C5A059]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <NagnaYogaSection />
        </div>
      </section>

      {/* 6. Itinerario Día por Día */}
      <section id="itinerario" className="py-24 bg-[#FAF9F6] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Servicios
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#800020]">
              Detalles de Nuestras Actividades
            </h2>
          </div>

          <ItineraryTimeline videosExist={videosExist} />
        </div>
      </section>

      {/* 7. Experiencias Destacadas */}
      <section className="py-24 bg-white border-y border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Actividades del Centro
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#800020]">
              Experiencias y Disciplinas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Block 1 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Hatha Yoga & Yoga Nidra</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Práctica física centrada en el asana, pranayama (control del aire) y relajación profunda.
              </p>
            </div>

            {/* Block 2 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Kundalini Yoga & Meditación</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Prácticas dinámicas de elevación de la energía vital combinando kriyas, pranayama y mantras.
              </p>
            </div>

            {/* Block 3 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Music className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Baños de Gong</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Terapia vibracional de armonización celular y disolución de tensiones a través de gongs sinfónicos.
              </p>
            </div>

            {/* Block 4 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Moon className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">La Puja de Gong</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Una sublime experiencia de 8 horas continuadas de gongs en relevos durante toda la noche.
              </p>
            </div>

            {/* Block 5 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Terapia Gestalt</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Espacio individual de presencia y autoconocimiento enfocado en el aquí y el ahora.
              </p>
            </div>

            {/* Block 6 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Network className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Constelaciones Familiares</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Terapia grupal para ordenar y esclarecer dinámicas familiares inconscientes.
              </p>
            </div>

            {/* Block 7 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Encuentros de Mujeres</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Círculos de palabra, cuidado mutuo y reconexión guiada en la naturaleza.
              </p>
            </div>

            {/* Block 8 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Ayuno Terapéutico y Retiros</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Desintoxicación y depuración celular con zumos y caldos en un entorno pacífico.
              </p>
            </div>

            {/* Block 9 */}
            <div className="text-center p-6 border border-stone-100 rounded-lg hover:border-[#C5A059]/30 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#800020]/10 flex items-center justify-center rounded-full text-[#800020] mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#800020] mb-2">Bienestar Experience & Especiales</h4>
              <p className="text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                Espacios de salud, consciencia y bienestar integral con ponentes y especialistas colaboradores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Galería / Atmósfera Visual */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Atmósfera del Centro
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#800020]">
              Galería de Diapositivas del Centro de Yoga Fuenlabrada
            </h2>
          </div>

          <AtmosphereGallery days={atmosphereDays} />
        </div>
      </section>

      {/* 9. Sección de Vídeos del itinerario */}
      <section id="videos" className="py-24 bg-white border-y border-[#C5A059]/20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Auditorio Virtual
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#800020]">
              Vídeos de Actividades
            </h2>
            <p className="text-sm text-[#1C1C1C]/60 mt-3 max-w-xl mx-auto">
              Visualice las diferentes sesiones, clases y terapias sonoras que articulan el día a día en nuestro centro.
            </p>
          </div>

          <VideoGallery videosExist={videosExist} />
        </div>
      </section>

      {/* 9.5 Sección de Vídeos de Viajes Realizados */}
      <section id="viajes-realizados" className="py-24 bg-[#FAF9F6] border-b border-[#C5A059]/20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Recuerdos de Retiros
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#800020]">
              Retiros ya Realizados
            </h2>
            <p className="text-sm text-[#1C1C1C]/60 mt-3 max-w-2xl mx-auto whitespace-pre-line">
              Reviva la atmósfera de nuestros encuentros pasados a través de los vídeos de recuerdo de cada experiencia en régimen de retiro grupal.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Retiro de Ayuno */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col">
              <div className="relative aspect-video bg-[#1C1C1C] flex items-center justify-center border-b border-stone-100">
                <video
                  src="/videos/previo_ayunos.mp4"
                  poster="/videos/previo_ayunos_poster.jpg"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-serif text-lg font-bold text-[#800020]">
                      Retiro de Ayuno (Enero 2026)
                    </h4>
                    <span className="text-[10px] bg-[#800020]/10 text-[#800020] border border-[#800020]/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                      Recuerdo
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed">
                    Un recorrido completo por las dinámicas, paseos y vivencias compartidas en nuestro último retiro de ayuno consciente del pasado enero de 2026.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Precio y Plazas */}
      <section id="precios" className="py-24 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white border border-[#C5A059]/30 rounded-xl p-8 sm:p-12 shadow-xl">
          <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
            Matrícula y Aportación
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#800020] mb-6">
            Tarifas y Aportaciones
          </h2>

          {/* Banner Informativo Reglas de Yoga */}
          <div className="mb-6 bg-amber-50/95 border-2 border-amber-200/90 rounded-2xl p-5 text-xs text-stone-800 text-left shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧘</span>
              <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                Políticas Oficiales, 1ª Clase de Regalo y Flexibilidad de Alumnos:
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-stone-700 leading-relaxed">
              <div className="space-y-2">
                <p>
                  • 🎁 <strong>1ª Clase de prueba de REGALO:</strong> ¡Tu primera clase de prueba <strong>NO SE COBRA, ES UN REGALO</strong>! (100% gratuita, 0 €, sin permanencia ni compromiso).
                </p>
                <p>
                  • 📅 <strong>Cuotas de Alumno (Turno fijo garantizado):</strong> 1 clase/semana por <strong>{hatha1Price}/mes</strong> o 2 clases/semana por <strong>{hatha2Price}/mes</strong>. Alumno con horario fijo reservado para no tener que estar reservando cita cada semana. Total libertad para darse de alta o baja cuando se desee.
                </p>
                <p>
                  • 🎟️ <strong>Clases sueltas / esporádicas:</strong> <strong>10,00 € por clase</strong> para quien no desee matricularse como alumno mensual, sin permanencia.
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  • 🔄 <strong>Política de recuperaciones (hasta 3 meses / 90 días):</strong> Si no puedes asistir y avisas con antelación, tienes hasta 3 meses para recuperar tu clase en cualquier otro turno con plaza libre.
                </p>
                <p>
                  • ✨ <strong>Meditaciones Guiadas ({meditacionSchedule}):</strong> <strong>¡GRATIS!</strong> para todos los alumnos matriculados en Yoga. No alumnos: {meditacionPrice}/mes (acceso ilimitado) o 3,00 € por meditación suelta (aforo máx. {meditacionCapacity} personas).
                </p>
                <p>
                  • 📩 <strong>Confirmación fehaciente:</strong> Recibirás confirmación inmediata por <strong>Correo Electrónico y por SMS</strong> tras cada reserva, cambio o reprogramación de clase.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8 border-y border-stone-100 mb-8 font-sans">
            <div>
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 mb-1.5">
                🎁 1ª Clase de REGALO (0€)
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">1 Clase Semanal</span>
              <span className="font-serif text-2xl font-black text-[#800020]">{hatha1Price}</span>
              <span className="block text-[10px] text-stone-500 mt-1">Al mes / Turno fijo reservado</span>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-stone-150 pt-4 sm:pt-0">
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 mb-1.5">
                🎁 1ª Clase de REGALO (0€)
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">2 Clases Semanales</span>
              <span className="font-serif text-2xl font-black text-[#800020]">{hatha2Price}</span>
              <span className="block text-[10px] text-stone-500 mt-1">Al mes / 2 turnos fijos reservados</span>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-stone-150 pt-4 md:pt-0">
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 mb-1.5">
                🎟️ Sin Permanencia
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Clases Sueltas / Esporádicas</span>
              <span className="font-serif text-2xl font-black text-[#800020]">10 €</span>
              <span className="block text-[10px] text-stone-500 mt-1">Por clase / Hatha Yoga Terapéutico</span>
            </div>
            <div className="border-t border-stone-150 pt-4">
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 mb-1.5">
                ✨ {meditacionSchedule}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Meditaciones Guiadas</span>
              <span className="font-serif text-xl sm:text-2xl font-black text-[#800020]">GRATIS / {meditacionPrice}</span>
              <span className="block text-[10px] text-stone-500 mt-1">Gratis alumnos · {meditacionPrice}/mes (aforo {meditacionCapacity} plazas)</span>
            </div>
            <div className="border-t sm:border-l border-stone-150 pt-4">
              <span className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Baño de Gong</span>
              <span className="font-serif text-2xl font-black text-[#800020]">{gongPrice}</span>
              <span className="block text-[10px] text-stone-400 mt-1">{gongSchedule} · {gongDuration}</span>
            </div>
            <div className="border-t md:border-l border-stone-150 pt-4">
              <span className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Puja de Gong</span>
              {pujaPrice.length > 25 ? (
                <span className="font-sans text-xs sm:text-sm font-bold text-[#800020] leading-snug block line-clamp-3">
                  {pujaPrice}
                </span>
              ) : (
                <span className="font-serif text-2xl font-black text-[#800020]">{pujaPrice}</span>
              )}
              <span className="block text-[10px] text-stone-400 mt-1">{pujaSchedule} ({pujaDuration})</span>
            </div>
          </div>

          <div className="space-y-3 max-w-xl mx-auto text-xs sm:text-sm text-[#1C1C1C]/85">
            <div className="flex justify-between items-center sm:px-8 py-1.5 border-b border-stone-100">
              <span className="font-semibold text-left">Primera clase de prueba:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">¡GRATIS! Es un regalo (0 €)</span>
            </div>
            <div className="flex justify-between items-center sm:px-8 py-1.5 border-b border-stone-100">
              <span className="font-semibold text-left">Clases sueltas o esporádicas (sin permanencia):</span>
              <span className="font-bold text-[#800020]">10,00 € / clase</span>
            </div>
            <div className="flex justify-between items-center sm:px-8 py-1.5 border-b border-stone-100">
              <span className="font-semibold text-left">Cuotas mensuales (con horario fijo reservado):</span>
              <span className="font-bold text-[#800020]">{hatha1Price} (1 clase/sem) · {hatha2Price} (2 clases/sem)</span>
            </div>
            <div className="flex justify-between items-center sm:px-8 py-1.5 border-b border-stone-100">
              <span className="font-semibold text-left">Plazo de recuperación de clases avisando:</span>
              <span className="font-bold text-[#800020]">Hasta 3 meses (90 días)</span>
            </div>
            <div className="flex justify-between items-center sm:px-8 py-1.5 border-b border-stone-100">
              <span className="font-semibold text-left">Meditaciones guiadas ({meditacionSchedule}):</span>
              <span className="font-bold text-stone-800">¡GRATIS para alumnos! ({meditacionPrice} no alumnos)</span>
            </div>
            <div className="flex justify-between items-center sm:px-8 py-1.5">
              <span className="font-semibold text-left">Confirmación fehaciente de citas y cambios:</span>
              <span className="font-bold text-emerald-700">Por Email y por SMS instantáneo</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <VapiVoiceBookingButton
              buttonText="📞 Reservar por Teléfono (Llamada IA + SMS)"
              serviceHint="Reserva o consulta de plaza de Yoga"
            />
            <Link
              href="/servicios"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#800020] px-6 py-3.5 text-sm font-semibold text-[#800020] hover:bg-[#800020] hover:text-white transition-all"
            >
              Ver Horarios y Catálogo Completo
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Qué Incluye / Qué No Incluye */}
      <section id="incluye" className="py-24 bg-white border-y border-[#C5A059]/20 scroll-mt-24 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Transparencia y Condiciones
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#800020]">
              Detalle de Condiciones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Column 1 - Qué incluye */}
            <div className="bg-[#FAF9F6] p-8 rounded-xl border border-[#2E5A44]/15">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2E5A44] border-b border-stone-200 pb-3 mb-6 flex items-center">
                ✓ Qué incluye la inscripción
              </h3>

              <ul className="space-y-4 text-xs sm:text-sm text-[#1C1C1C]/80">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-[#2E5A44] shrink-0 mr-3 mt-0.5" />
                  <span>Acceso de uso a todo el material necesario de sala (esterillas, mantas, bloques, etc.).</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-[#2E5A44] shrink-0 mr-3 mt-0.5" />
                  <span>Impartición por profesores certificados y profesionales de primer nivel.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-[#2E5A44] shrink-0 mr-3 mt-0.5" />
                  <span>Terapia de sonido con instrumentos originales e importados de la más alta calidad.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-[#2E5A44] shrink-0 mr-3 mt-0.5" />
                  <span>Infusiones ecológicas y agua purificada durante el desarrollo de las vivencias y talleres.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-[#2E5A44] shrink-0 mr-3 mt-0.5" />
                  <span>En los Retiros: Alojamiento en régimen concertado y alimentación específica (caldos, frutas, tés depurativos).</span>
                </li>
              </ul>
            </div>

            {/* Column 2 - Qué no incluye */}
            <div className="bg-[#FAF9F6] p-8 rounded-xl border border-[#800020]/15">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#800020] border-b border-stone-200 pb-3 mb-6 flex items-center">
                ✗ Qué no incluye
              </h3>

              <ul className="space-y-4 text-xs sm:text-sm text-[#1C1C1C]/80">
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-[#800020]/10 rounded-full text-[#800020] font-bold text-center flex items-center justify-center shrink-0 mr-3 mt-0.5 text-xs">-</span>
                  <span>Traslado personal de los participantes hasta el centro de yoga Fuenlabrada o hasta la ubicación de los retiros.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-[#800020]/10 rounded-full text-[#800020] font-bold text-center flex items-center justify-center shrink-0 mr-3 mt-0.5 text-xs">-</span>
                  <span>Toallas personales y ropa de cambio para los retiros.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 12. Formulario de Consulta / Contacto (Canal Email) */}
      <section id="contacto" className="py-16 sm:py-20 bg-[#FAF9F6] scroll-mt-24">
        <span id="reserva" className="block -mt-24 pt-24 invisible pointer-events-none" />
        <span id="consultas" className="block -mt-24 pt-24 invisible pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-3">
            <span className="text-xs uppercase tracking-widest text-[#96680E] font-extrabold block mb-2">
              Centro de Yoga Fuenlabrada (Salvadora Conesa) • Atención Personalizada
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#800020]">
              Consultas y Reservas por Email ó Wassap
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
              ¿Quieres consultar dudas o solicitar tu plaza para clases de yoga, baños de gong, terapias o retiros? Escríbenos directamente y gestionaremos tu solicitud por email de inmediato.
            </p>
          </div>

          <WhatsAppQuickBanner />
          <ContactQueryForm initialServices={services} initialCategories={categories} />
        </div>
      </section>

      {/* 13. Datos Directos de Contacto */}
      <section id="atencion-directa" className="py-24 bg-white border-t border-[#C5A059]/25 text-center font-sans scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-2">
            Atención Especializada & Contacto Directo
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#800020] mb-4">
            ¿Tiene alguna consulta antes de reservar?
          </h2>
          <p className="text-xs sm:text-sm text-[#1C1C1C]/70 max-w-xl mx-auto mb-8">
            Póngase en contacto directamente con Salvadora Conesa. Estaremos encantados de resolver sus preguntas sobre nuestras clases, baños de gong, retiros y talleres.
          </p>

          {/* Card Destacada: Llamada Inmediata con Asistente de Voz IA */}
          <div className="mb-10 max-w-2xl mx-auto bg-gradient-to-br from-[#FAF9F6] via-white to-[#FAF9F6] border border-[#C5A059]/35 rounded-2xl p-6 sm:p-7 shadow-lg shadow-[#800020]/5 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-bl-full pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#800020]/25">
                <Phone className="w-7 h-7 text-[#C5A059]" />
              </div>
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] text-[10.5px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  <span>Asistente de Voz Inteligente 24/7</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#800020]">
                  ¿Prefieres que te llamemos ahora mismo?
                </h3>
                <p className="text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed">
                  Indica tu número de teléfono y nuestro asistente inteligente te llamará de inmediato y de forma gratuita para informarte sobre horarios, aportaciones o formalizar tu reserva.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-stone-500 font-medium text-center sm:text-left">
                Llamada saliente sin coste · Cumple RGPD
              </span>
              <VapiCallButton
                inquiry="Consulta directa desde la sección de contacto"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#800020]/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-[#800020]/20 hover:scale-101 active:scale-98 transition duration-200 cursor-pointer"
              >
                Solicitar llamada inmediata
              </VapiCallButton>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base font-semibold">

            <a
              href="mailto:salvadoraconesa@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3.5 border border-[#800020]/20 rounded-md text-[#800020] bg-[#800020]/5 hover:bg-[#800020]/10 transition shadow-sm"
            >
              <Mail className="w-5 h-5 mr-2 text-[#800020]" />
              salvadoraconesa@gmail.com
            </a>

            <a
              href="tel:695172625"
              className="inline-flex items-center justify-center px-6 py-3.5 border border-[#2E5A44]/20 rounded-md text-[#2E5A44] bg-[#2E5A44]/5 hover:bg-[#2E5A44]/10 transition shadow-sm"
            >
              <Phone className="w-5 h-5 mr-2 text-[#2E5A44]" />
              +34 695 172 625 (Salvadora)
            </a>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/escuelayogasalvadoraconesa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Escuela Yoga Salvadora Conesa"
                title="Instagram"
                className="w-12 h-12 rounded-full border border-[#800020]/20 bg-[#800020]/5 hover:bg-[#800020] hover:text-white flex items-center justify-center transition duration-300 text-[#800020] shadow-sm"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/salvadoraconesa?rdid=6uiPQDgBUxQ7KTQ3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1EhbRPtem8%2F#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Centro de Yoga Salvadora Conesa"
                title="Facebook"
                className="w-12 h-12 rounded-full border border-[#800020]/20 bg-[#800020]/5 hover:bg-[#800020] hover:text-white flex items-center justify-center transition duration-300 text-[#800020] shadow-sm"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 13b. Pantalla de Canal Oficial de WhatsApp - Asistente Escuela Yoga */}
      <WhatsAppContactSection />

      {/* 13c. Pantalla Separada de Baja de Servicios de la Escuela de Yoga (Restricción Técnica) */}
      <BajaServiciosSection />

      {/* 14. Sección de Testimonios de los Alumnos/as */}
      <TestimonialsSection />

      {/* 15. Footer Elegante Unificado */}
      <Footer />
    </div>
  );
}
