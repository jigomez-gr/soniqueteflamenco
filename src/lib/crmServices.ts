export interface CrmCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  displayOrder: number;
}

export interface CrmService {
  id: string;
  name: string;
  serviceType: "recurring" | "event" | string;
  description?: string | null;
  scheduleText?: string | null;
  weeklySchedule?: Record<string, string[]> | null;
  eventDatesText?: string | null;
  durationMinutes: number;
  price?: string | null;
  currency?: string;
  maxCapacity?: number | null;
  paymentType?: string;
  externalPaymentUrl?: string | null;
  allowedModalities?: string[];
  requiresApproval?: boolean;
  firstClassFree?: boolean;
  freeForYogaStudents?: boolean;
  whatsappBookingUrl?: string;
  categoryId?: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  categoryDescription?: string | null;
  flyerPath?: string | null;
  flyerUrl?: string | null;
  flyerParticularPath?: string | null;
  flyerParticularUrl?: string | null;
  videoParticularPath?: string | null;
  videoParticularUrl?: string | null;
  videoPath?: string | null;
  videoUrl?: string | null;
  textoespecifico?: string | null;
  editions?: Array<{
    id: string;
    title?: string;
    isDateDefinite: boolean;
    scheduledAt?: string;
    startsAt?: string;
    endsAt?: string;
    tentativeDateText?: string;
    isPriceDefinite: boolean;
    price?: string;
    tentativePriceText?: string;
    minParticipants?: number;
    maxCapacity?: number;
    enrolledCount?: number;
    quorumReached?: boolean;
    status: string;
  }>;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  displayOrder?: number;
  sinfechadefinitiva?: string | null;
  textosinfechadefinitiva?: string | null;
  sinpreciodefinitivo?: string | null;
  textosinpreciodefinitivo?: string | null;
}

export interface CrmServicesResponse {
  success: boolean;
  businessName: string;
  businessDescription?: string;
  brandColor?: string;
  logoUrl?: string | null;
  whatsappNumber: string;
  categories?: CrmCategory[];
  services: CrmService[];
}

export const CRM_API_BASE_URL =
  process.env.CRM_API_URL ||
  process.env.NEXT_PUBLIC_CRM_API_URL ||
  "https://crm.soniqueteconarte.jigretera.com";

export const CRM_SERVICES_ENDPOINT = `${CRM_API_BASE_URL}/api/widget/services`;

export const MAINTENANCE_MESSAGE =
  "Los servicios en línea de la Escuela de Yoga de Salvadora Conesa No están operativos en estos momentos Intentelo más tarde ";
export const BLOCKED_USER_MESSAGE =
  "Usuario Bloqueado por restricción técnica puede apelar enviando un correo a jigomezjub@gmail.com  y si lo consideramos nos pondremos en contacto con vd ";

export async function checkCrmMaintenanceAndContact(
  phone?: string,
  email?: string
): Promise<{
  allowed: boolean;
  maintenance: boolean;
  blocked: boolean;
  message?: string;
  statusCode?: number;
}> {
  try {
    const params = new URLSearchParams();
    if (phone) params.append("phone", phone);
    if (email) params.append("email", email);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `${CRM_API_BASE_URL}/api/widget/check-contact?${params.toString()}`,
      {
        cache: "no-store",
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.maintenance) {
        return {
          allowed: false,
          maintenance: true,
          blocked: false,
          message: data.message || MAINTENANCE_MESSAGE,
          statusCode: 503,
        };
      }
      if (data.blocked) {
        return {
          allowed: false,
          maintenance: false,
          blocked: true,
          message: data.message || BLOCKED_USER_MESSAGE,
          statusCode: 403,
        };
      }
    }
  } catch (err) {
    console.warn("Could not check CRM maintenance and contact status:", err);
  }
  return { allowed: true, maintenance: false, blocked: false };
}


export async function requestBookingVerification(
  phone: string,
  email?: string,
  name?: string
): Promise<{
  requiresOtp: boolean;
  isValidContact: boolean;
  contactId?: string;
  channel?: 'whatsapp' | 'sms' | 'email';
  destinationPhone?: string;
  destinationEmail?: string | null;
  message: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${CRM_API_BASE_URL}/api/contacts/booking-verification/request`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, name }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        requiresOtp: Boolean(data.requiresOtp),
        isValidContact: Boolean(data.isValidContact),
        contactId: data.contactId,
        channel: data.channel,
        destinationPhone: data.destinationPhone,
        destinationEmail: data.destinationEmail,
        message: data.message || 'Verificación procesada.',
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al solicitar verificación.');
    }
  } catch (err: any) {
    console.warn('requestBookingVerification CRM error:', err.message);
    throw err;
  }
}

export async function confirmBookingVerification(
  phone: string,
  code: string,
  email?: string,
  name?: string
): Promise<{
  verified: boolean;
  contactId?: string;
  contact?: any;
  message: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${CRM_API_BASE_URL}/api/contacts/booking-verification/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, email, name }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        verified: Boolean(data.verified),
        contactId: data.contactId,
        contact: data.contact,
        message: data.message || 'Verificación completada.',
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        verified: false,
        message: errData.message || 'Código de verificación incorrecto o expirado.',
      };
    }
  } catch (err: any) {
    console.warn('confirmBookingVerification CRM error:', err.message);
    return {
      verified: false,
      message: err.message || 'Error al conectar con el servicio de verificación.',
    };
  }
}

// Fallback catalog in case of temporary network unavailability
export const FALLBACK_CRM_SERVICES: CrmService[] = [
  {
    id: "d3b4566d-e1da-430c-be1f-b2bd1d0a0bad",
    name: "Hatha Yoga Terapéutico (1 clase semanal)",
    serviceType: "recurring",
    description: "Práctica consciente de asanas, alineación corporal, respiración terapéutica y relajación profunda. Horarios: Martes (9:45, 11:15, 17:00, 18:30, 20:00), Miércoles (20:15) y Jueves (9:45, 11:15, 16:00, 17:30, 19:00). Aforo del listado: 20 plazas (con margen de hasta 28 para recuperaciones). Precio: 25€/mes. Pago en el centro.",
    scheduleText: "Martes (9:45, 11:15, 17:00, 18:30, 20:00), Miércoles (20:15) y Jueves (9:45, 11:15, 16:00, 17:30, 19:00)",
    durationMinutes: 90,
    price: "25.00",
    currency: "EUR",
    maxCapacity: 20,
    allowedModalities: ["in_person"],
    firstClassFree: true,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/yoga.jpeg",
    videoParticularUrl: "/videos/itinerario-1.mp4",
    videoParticularPath: "media_base/videos/itinerario-1.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Hatha%20Yoga%20Terap%C3%A9utico%20(1%20clase%20semanal).",
  },
  {
    id: "15f33ff9-210c-45ab-b6fd-e660854505b4",
    name: "Hatha Yoga Terapéutico (2 clases semanales)",
    serviceType: "recurring",
    description: "Práctica consciente de asanas, alineación corporal, respiración terapéutica y relajación profunda (2 clases a la semana). Horarios: Martes (9:45, 11:15, 17:00, 18:30, 20:00), Miércoles (20:15) y Jueves (9:45, 11:15, 16:00, 17:30, 19:00). Aforo del listado: 20 plazas. Precio: 42€/mes. Pago en el centro.",
    scheduleText: "Martes (9:45, 11:15, 17:00, 18:30, 20:00), Miércoles (20:15) y Jueves (9:45, 11:15, 16:00, 17:30, 19:00)",
    durationMinutes: 90,
    price: "42.00",
    currency: "EUR",
    maxCapacity: 20,
    allowedModalities: ["in_person"],
    firstClassFree: true,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/yoga.jpeg",
    videoParticularUrl: "/videos/itinerario-1.mp4",
    videoParticularPath: "media_base/videos/itinerario-1.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Hatha%20Yoga%20Terap%C3%A9utico%20(2%20clases%20semanales).",
  },
  {
    id: "469fa9b9-227d-4168-bda7-cac5cf3e7f46",
    name: "Bienestar Experience (Longevidad y Bienestar Integral)",
    serviceType: "event",
    description: "Bienestar Experience es un espacio de encuentro dedicado al bienestar integral, el autoconocimiento y el cuidado de cuerpo y mente. Primer evento: Bienestar Experience 2026 · Más allá del tumor en Impact Hub Gobernador (Madrid). Una mirada integrativa sobre el cáncer con Txiki Soto, Giulliana Gabaldoni y María Salvadora Conesa (Baño de Gong). Precio: 19,99 €.",
    scheduleText: "Viernes 13 de noviembre de 2026 (16:30 a 21:30 h)",
    eventDatesText: "Viernes 13 de noviembre de 2026 (16:30 a 21:30 h)",
    durationMinutes: 300,
    price: "19.99",
    currency: "EUR",
    maxCapacity: 100,
    allowedModalities: ["in_person"],
    requiresApproval: false,
    firstClassFree: false,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/bienestar.png",
    flyerParticularUrl: "/flyers/flyer13nov2026vivemasparticular.jpeg",
    flyerParticularPath: "public/flyers/flyer13nov2026vivemasparticular.jpeg",
    videoParticularUrl: "/videos/Promo_Bienestar-Experience-2026_1920x1080.mp4",
    videoParticularPath: "media_base/videos/Promo_Bienestar-Experience-2026_1920x1080.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20reservar%20para%20Bienestar%20Experience%202026%20M%C3%A1s%20All%C3%A1%20del%20Tumor.",
  },
  {
    id: "8d243111-8e4c-40e3-ac5a-b4301fe6cfb9",
    name: "Meditaciones Guiadas",
    serviceType: "recurring",
    description: "Sesión grupal de meditación y centramiento. Lunes y Jueves de 9:15 a 9:45. Gratuitas para alumnos del centro de Yoga. Precio general: 15€/mes. Pago en el centro.",
    scheduleText: "Lunes y Jueves de 09:15 a 09:45",
    durationMinutes: 30,
    price: "15.00",
    currency: "EUR",
    maxCapacity: 28,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: true,
    flyerUrl: "/flyers/meditacion.jpeg",
    videoParticularUrl: "/videos/itinerario-2.mp4",
    videoParticularPath: "media_base/videos/itinerario-2.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Meditaciones%20Guiadas.",
  },
  {
    id: "3886172f-4a00-4af7-9d5f-5c4015e07f9c",
    name: "Baño de Gong y Meditación Sonora",
    serviceType: "event",
    description: "Un sábado al mes (el último sábado de cada mes). Sesión completa de 2 horas: preparación, baño de sonido envolvente con gongs y meditación integradora. Próxima sesión: Sábado 21 de Noviembre de 2026 (18:00 a 20:00). Aforo máximo: 30 personas. Precio: 16€. Pago en el centro.",
    scheduleText: "Sábado 21 de Noviembre (18:00 a 20:00)",
    eventDatesText: "Sábado 21 de Noviembre de 2026 (18:00 a 20:00)",
    durationMinutes: 120,
    price: "16.00",
    currency: "EUR",
    maxCapacity: 30,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    textoespecifico: "Próxima sesión confirmada: Sábado 21 de Noviembre de 2026 de 18:00 a 20:00 h. Mejoraremos el Hígado. Precio: 16 € (14 € si vienes acompañado/acompañada).",
    flyerUrl: "/flyers/banogongparticular.jpg",
    flyerParticularUrl: "/flyers/banogongparticular.jpg",
    videoParticularUrl: "/videos/Bano-de-Gong_particular.mp4",
    videoParticularPath: "media_base/videos/Bano-de-Gong_particular.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Ba%C3%B1o%20de%20Gong%20y%20Meditaci%C3%B3n%20Sonora.",
  },
  {
    id: "f929b07c-3505-42b8-907f-be7a1bca9af6",
    name: "Puja de Gongs (Noche Sagrada de Sonido - 11h)",
    serviceType: "event",
    description: "Evento anual de inmersión y transformación sonora durante toda la noche (11 horas continuas de sonido). Próximamente / Marzo 2027. Aforo: 30 personas por sesión. Reserva anticipada. Pago en el centro.",
    eventDatesText: "Dos encuentros: la primera puja es próximamente y la segunda en marzo 2027",
    durationMinutes: 660,
    price: "0.00",
    currency: "EUR",
    maxCapacity: 30,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    sinfechadefinitiva: "S",
    textosinfechadefinitiva: "Dos encuentros: la primera puja es próximamente y la segunda en marzo 2027",
    sinpreciodefinitivo: "S",
    textosinpreciodefinitivo: "El precio se determinará en función de las características del viaje y alojamiento",
    flyerUrl: "/flyers/banogong.jpeg",
    videoParticularUrl: "/videos/itinerario-4.mp4",
    videoParticularPath: "media_base/videos/itinerario-4.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Puja%20de%20Gongs%20(Noche%20Sagrada%20de%20Sonido%20-%2011h).",
  },
  {
    id: "a1dde6cd-f1bf-4175-95ee-34a53f4838e9",
    name: "Constelaciones Familiares (Constelar / Asunto Propio)",
    serviceType: "event",
    description: "Taller vivencial mensual de sanación de vínculos y patrones familiares. Modalidad para trabajar un asunto o síntoma personal propio. Próxima fecha: Sábado 14 de Noviembre de 2026 (10:00 a 14:00). Precio: 60€. Aforo: 25 personas. Pago en el centro.",
    eventDatesText: "Sábado 14 de Noviembre de 2026 (10:00 a 14:00)",
    scheduleText: "Sábado 14 de Noviembre (10:00 a 14:00)",
    durationMinutes: 240,
    price: "60.00",
    currency: "EUR",
    maxCapacity: 25,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/constelaciones_familiares_particular.jpg",
    flyerParticularUrl: "/flyers/constelaciones_familiares_particular.jpg",
    flyerParticularPath: "public/flyers/constelaciones_familiares_particular.jpg",
    videoUrl: "/videos/itinerario-6.mp4",
    videoParticularUrl: "/videos/constelacionesparticular.mp4",
    videoParticularPath: "media_base/videos/constelacionesparticular.mp4",
    textoespecifico: "Próxima fecha confirmada: Sábado 14 de Noviembre de 2026 de 10:00 a 14:00 h en el centro. Precio: 60 € (Constelar / Asunto propio) o 20 € (Participar / Representar).",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Constelaciones%20Familiares%20(Constelar).",
  },
  {
    id: "2acd3c74-abae-47d0-9b67-147cbbe1a657",
    name: "Constelaciones Familiares (Participante / Representante)",
    serviceType: "event",
    description: "Taller vivencial mensual de sanación de vínculos familiares. Modalidad para participar como representante u observador en el campo de trabajo. Próxima fecha: Sábado 14 de Noviembre de 2026 (10:00 a 14:00). Precio: 20€. Aforo: 25 personas. Pago en el centro.",
    eventDatesText: "Sábado 14 de Noviembre de 2026 (10:00 a 14:00)",
    scheduleText: "Sábado 14 de Noviembre (10:00 a 14:00)",
    durationMinutes: 240,
    price: "20.00",
    currency: "EUR",
    maxCapacity: 25,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/constelaciones_familiares_particular.jpg",
    flyerParticularUrl: "/flyers/constelaciones_familiares_particular.jpg",
    flyerParticularPath: "public/flyers/constelaciones_familiares_particular.jpg",
    videoUrl: "/videos/itinerario-6.mp4",
    videoParticularUrl: "/videos/constelacionesparticular.mp4",
    videoParticularPath: "media_base/videos/constelacionesparticular.mp4",
    textoespecifico: "Próxima fecha confirmada: Sábado 14 de Noviembre de 2026 de 10:00 a 14:00 h en el centro. Precio: 20 € (Participar / Representante) o 60 € (Constelar / Asunto propio).",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Constelaciones%20Familiares%20(Participante).",
  },
  {
    id: "6bfc9e2b-bef8-42d5-9c25-bd3b7554229a",
    name: "Retiro de Ayuno Terapéutico",
    serviceType: "event",
    description: "Retiro de depuración y ayuno consciente después del verano para subir tu energía vital. Del viernes 9 al lunes 12 de octubre. Lugar paradisíaco y aislado a hora y media de Madrid donde bañarnos y hacer paseos por el monte. Actividades diarias: activación y gimnasia al amanecer, yoga al mediodía, meditación al atardecer y baño de gong en la noche. Dirigido por Salvadora Conesa (40 años como profesora de yoga, 26 como terapeuta Gestalt, 30 años dirigiendo grupos de ayuno). Inversión: 250 € (230 € reservando antes del 12 de septiembre, descuento con acompañante o en grupo). Aforo: 20 plazas.",
    eventDatesText: "Del viernes 9 al lunes 12 de Octubre de 2026",
    durationMinutes: 1440,
    price: "250.00",
    currency: "EUR",
    maxCapacity: 20,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/ayuno.jpeg",
    flyerPath: "public/flyers/ayuno.jpeg",
    flyerParticularUrl: "/flyers/ayuno_particular.jpg",
    flyerParticularPath: "public/flyers/ayuno_particular.jpg",
    videoParticularUrl: "/videos/ayunoterapeuticoparticular.mp4",
    videoParticularPath: "media_base/videos/ayunoterapeuticoparticular.mp4",
    videoUrl: "/videos/itinerario-8.mp4",
    videoPath: "media_base/videos/itinerario-8.mp4",
    textoespecifico: "estamos seleccionando ya el lugar del próximo retiro",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Retiro%20de%20Ayuno%20Terap%C3%A9utico.",
  },
  {
    id: "076c81be-6ce8-4f14-87a9-f507b01ba465",
    name: "Terapia Gestalt (Sesión Individual)",
    serviceType: "recurring",
    description: "Sesión individual de psicoterapia Gestalt presencial u online. Enfoque humanista y toma de conciencia. Horario convenido individualmente entre terapeuta y alumno/paciente. Requiere aprobación previa por parte de la terapeuta y responsable (Salvadora Conesa Martinez). Precio: 35€ por sesión de 1 hora. Pago en el centro.",
    durationMinutes: 60,
    price: "35.00",
    currency: "EUR",
    maxCapacity: 1,
    allowedModalities: ["in_person", "virtual"],
    scheduleText: "Lunes y algún Miércoles (con aprobación previa)",
    requiresApproval: true,
    firstClassFree: false,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/gestalt.jpeg",
    videoParticularUrl: "/videos/itinerario-5.mp4",
    videoParticularPath: "media_base/videos/itinerario-5.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Terapia%20Gestalt%20(Sesi%C3%B3n%20Individual).",
  },
  {
    id: "7cf9b55a-3249-4eee-a043-ea8e6bf6be7e",
    name: "Hatha Yoga Terapéutico",
    serviceType: "recurring",
    description: "Práctica consciente de asanas, alineación postural, respiración consciente y relajación profunda en grupo regular.",
    scheduleText: "Martes y Jueves (Varios turnos disponibles de mañana y tarde)",
    durationMinutes: 90,
    price: "25.00",
    currency: "EUR",
    maxCapacity: 20,
    allowedModalities: ["in_person"],
    firstClassFree: true,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/yoga.jpeg",
    videoParticularUrl: "/videos/itinerario-1.mp4",
    videoParticularPath: "media_base/videos/itinerario-1.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Hatha%20Yoga%20Terap%C3%A9utico.",
  },
  {
    id: "5f0693fa-adf1-4e65-a8ea-e4eda92ff942",
    name: "Encuentro de Mujeres (Primavera)",
    serviceType: "event",
    description: "Círculo y espacio de conexión femenina, dinámicas grupales, sanación emocional y meditación.",
    eventDatesText: "fecha por confirmar",
    durationMinutes: 240,
    price: "0.00",
    currency: "EUR",
    maxCapacity: 25,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    sinfechadefinitiva: "S",
    textosinfechadefinitiva: "fecha por confirmar",
    sinpreciodefinitivo: "S",
    textosinpreciodefinitivo: "fecha por confirmar",
    flyerUrl: "/flyers/encuentros_mujeres.jpeg",
    videoParticularUrl: "/videos/itinerario-7.mp4",
    videoParticularPath: "media_base/videos/itinerario-7.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Encuentro%20de%20Mujeres.",
  },
  {
    id: "510e05b8-da1e-4bbb-a9ed-d41b16ca429f",
    name: "Sesión Mensual de Fin de Semana (Baño de Gong / Talleres)",
    serviceType: "recurring",
    description: "Talleres mensuales: Baño de Gong, Constelaciones Familiares, Chi Kung, Masajes, Meditación y Yoga Nidra.",
    scheduleText: "Una sesión al mes en fin de semana (Sábados/Domingos)",
    durationMinutes: 120,
    price: "35.00",
    currency: "EUR",
    maxCapacity: 30,
    allowedModalities: ["in_person"],
    firstClassFree: false,
    freeForYogaStudents: false,
    flyerUrl: "/flyers/banogong.jpeg",
    flyerPath: "public/flyers/banogong.jpeg",
    videoParticularUrl: "/videos/Bano-de-Gong_particular.mp4",
    videoParticularPath: "media_base/videos/Bano-de-Gong_particular.mp4",
    whatsappBookingUrl: "https://wa.me/34695172625?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20y%20disponibilidad%20para%20Sesi%C3%B3n%20Mensual%20de%20Fin%20de%20Semana%20(Ba%C3%B1o%20de%20Gong%20%2F%20Talleres).",
  },
];

export const FALLBACK_CRM_CATEGORIES: CrmCategory[] = [
  {
    id: "cat_yoga",
    code: "yoga_meditacion",
    name: "Clases Regulares de Yoga y Meditación",
    description: "ESCUELA SALVADORA CONESA · CLASES REGULARES\nHatha Yoga Terapéutico, Meditaciones y Terapias",
    displayOrder: 1,
  },
  {
    id: "cat_salud",
    code: "salud_terapeutica",
    name: "Salud Terapéutica y Sesiones Individuales",
    description: "CONSULTAS PERSONALIZADAS Y ACOMPAÑAMIENTO INDIVIDUAL\nAcompañamiento psicoterapéutico individual (Gestalt).",
    displayOrder: 2,
  },
  {
    id: "cat_talleres",
    code: "talleres_eventos",
    name: "Talleres Vivenciales, Retiros y Eventos",
    description: "ENCUENTROS, RETIROS Y EXPERIENCIAS TRANSFORMADORAS\nBaños de Gong, Pujas de 11h, Constelaciones Familiares y Retiros de Ayuno.",
    displayOrder: 3,
  },
  {
    id: "cat_longevidad",
    code: "longevidad_artes",
    name: "Actividades Especiales",
    description: "ACTIVIDADES ESPECIALES\nBienestar Experience, longevidad activa, biohacking y disciplinas complementarias.",
    displayOrder: 4,
  },
];

/**
 * Fetches services from CRM API with timeout, filters and fallback.
 */
export async function fetchCrmServices(filters?: {
  category?: string;
  type?: string;
}): Promise<{
  success: boolean;
  businessName: string;
  whatsappNumber: string;
  categories: CrmCategory[];
  services: CrmService[];
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.set("category", filters.category);
    if (filters?.type) queryParams.set("type", filters.type);
    const queryString = queryParams.toString();
    const endpointUrl = queryString ? `${CRM_SERVICES_ENDPOINT}?${queryString}` : CRM_SERVICES_ENDPOINT;

    const res = await fetch(endpointUrl, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CRM returned HTTP status ${res.status}`);
    }

    const data: CrmServicesResponse = await res.json();
    if (data && data.services && Array.isArray(data.services) && data.services.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const visibleServices = data.services.filter((s) => {
        const from = s.fechaDesde || "2000-01-01";
        const until = s.fechaHasta || "2099-12-31";
        return todayStr >= from && todayStr <= until;
      });

      const rawCategories = data.categories && data.categories.length > 0 ? data.categories : FALLBACK_CRM_CATEGORIES;
      const sortedCategories = [...rawCategories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      const sortedServices = [...visibleServices].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      const resolveUrl = (url?: string | null) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/api/")) return `${CRM_API_BASE_URL}${url}`;
        return url;
      };

      const resolvedServices = sortedServices.map((s) => {
        const isGong = /baño de gong/i.test(s.name) || /baños de gong/i.test(s.name) || s.id === "3886172f-4a00-4af7-9d5f-5c4015e07f9c";
        let eventDatesText = s.eventDatesText;
        let scheduleText = s.scheduleText;
        let description = s.description;
        let flyerUrl = resolveUrl(s.flyerUrl);
        let flyerParticularUrl = resolveUrl(s.flyerParticularUrl);
        let flyerPath = s.flyerPath;
        let flyerParticularPath = s.flyerParticularPath;

        let textoespecifico = s.textoespecifico;
        if (isGong) {
          eventDatesText = s.eventDatesText || "Sábado 21 de Noviembre de 2026 (18:00 a 20:00)";
          scheduleText = s.scheduleText || "Sábado 21 de Noviembre (18:00 a 20:00)";
          textoespecifico = "Próxima sesión confirmada: Sábado 21 de Noviembre de 2026 de 18:00 a 20:00 h. Mejoraremos el Hígado. Precio: 16 € (14 € si vienes acompañado/acompañada).";
          if (description) {
            description = description
              .replace(/31\s*de\s*octubre/gi, "21 de Noviembre")
              .replace(/26\s*de\s*septiembre/gi, "21 de Noviembre")
              .replace(/17\s*de\s*octubre/gi, "21 de Noviembre");
          }
          // Siempre servir los flyers actualizados con fecha 21 de Noviembre
          flyerUrl = "/flyers/banogongparticular.jpg";
          flyerParticularUrl = "/flyers/banogongparticular.jpg";
          flyerPath = "public/flyers/banogongparticular.jpg";
          flyerParticularPath = "public/flyers/banogongparticular.jpg";
        }

        let videoParticularUrl = resolveUrl(s.videoParticularUrl);
        let videoParticularPath = s.videoParticularPath;

        const isConstelaciones = /constelaci/i.test(s.name);
        if (isConstelaciones) {
          eventDatesText = "Sábado 14 de Noviembre de 2026 (10:00 a 14:00)";
          scheduleText = "Sábado 14 de Noviembre (10:00 a 14:00)";
          textoespecifico = "Próxima fecha confirmada: Sábado 14 de Noviembre de 2026 de 10:00 a 14:00 h en el centro. Precio: 60 € (Constelar / Asunto propio) o 20 € (Participar / Representar).";
          flyerUrl = "/flyers/constelaciones_familiares_particular.jpg";
          flyerParticularUrl = "/flyers/constelaciones_familiares_particular.jpg";
          flyerPath = "public/flyers/constelaciones_familiares_particular.jpg";
          flyerParticularPath = "public/flyers/constelaciones_familiares_particular.jpg";
          videoParticularUrl = "/videos/constelacionesparticular.mp4";
          videoParticularPath = "media_base/videos/constelacionesparticular.mp4";
        }

        const isBienestar = /bienestar experience/i.test(s.name) || s.id === "469fa9b9-227d-4168-bda7-cac5cf3e7f46";

        if (isBienestar) {
          eventDatesText = "Viernes 13 de noviembre de 2026 (16:30 a 21:30 h)";
          scheduleText = "Viernes 13 de noviembre de 2026 (16:30 a 21:30 h)";
          flyerUrl = "/flyers/bienestar.png";
          flyerPath = "public/flyers/bienestar.png";
          flyerParticularUrl = "/flyers/flyer13nov2026vivemasparticular.jpeg";
          flyerParticularPath = "public/flyers/flyer13nov2026vivemasparticular.jpeg";
          videoParticularUrl = "/videos/Promo_Bienestar-Experience-2026_1920x1080.mp4";
          videoParticularPath = "media_base/videos/Promo_Bienestar-Experience-2026_1920x1080.mp4";
        }

        return {
          ...s,
          eventDatesText,
          scheduleText,
          description,
          textoespecifico,
          flyerUrl,
          flyerParticularUrl,
          flyerPath,
          flyerParticularPath,
          videoUrl: resolveUrl(s.videoUrl),
          videoParticularUrl,
          videoParticularPath,
        };
      });

      return {
        success: true,
        businessName: data.businessName || "Centro de Yoga y Bienestar Salvadora",
        whatsappNumber: data.whatsappNumber || "34695172625",
        categories: sortedCategories,
        services: resolvedServices,
      };
    }

    throw new Error("Empty services returned from CRM");
  } catch (err: any) {
    console.warn(
      `[CRM Integration] Fallback used. Could not fetch live services from CRM (${err.message}).`
    );
    return {
      success: true,
      businessName: "Centro de Yoga y Bienestar Salvadora",
      whatsappNumber: "34695172625",
      categories: [...FALLBACK_CRM_CATEGORIES].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
      services: [...FALLBACK_CRM_SERVICES].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    };
  }
}

/**
 * Human-readable price formatting based on CRM data.
 */
export function formatServicePrice(service: CrmService): string {
  if (service.sinpreciodefinitivo === "S") {
    return service.textosinpreciodefinitivo || "Precio por confirmar";
  }

  if (service.price === null || service.price === undefined || service.price === "") {
    return "A consultar";
  }

  const num = parseFloat(service.price);
  if (isNaN(num)) {
    return service.price;
  }

  if (num === 0) {
    return "Prueba Gratis (0 €)";
  }

  const formattedNum = num.toFixed(2).replace(".00", "") + " €";

  if (service.serviceType === "recurring") {
    if (service.name.toLowerCase().includes("clase semanal")) {
      return `${formattedNum} / mes`;
    }
    if (
      service.name.toLowerCase().includes("sesión") ||
      service.name.toLowerCase().includes("gestalt") ||
      service.name.toLowerCase().includes("experience")
    ) {
      return `${formattedNum} / sesión`;
    }
    return `${formattedNum} / mes`;
  }

  return formattedNum;
}

/**
 * Human-readable date / schedule formatting based on CRM data.
 */
export function formatServiceDate(service: CrmService): string {
  if (service.sinfechadefinitiva === "S") {
    return service.textosinfechadefinitiva || "Fecha por confirmar";
  }
  const dateText = service.eventDatesText || service.scheduleText || "";
  if (/constelaci/i.test(service.name) && /27\s*de\s*septiembre/i.test(dateText)) {
    return "Domingo 25 de Octubre de 2026 (10:00 a 14:00)";
  }
  if (/baño de gong|gong/i.test(service.name)) {
    return service.eventDatesText || "Sábado 21 de Noviembre de 2026 (18:00 a 20:00)";
  }
  return dateText;
}

/**
 * Format duration minutes nicely (e.g., 90 min, 2 horas, 11 horas).
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "Consultar";
  if (minutes < 60) return `${minutes} min`;
  if (minutes === 60) return "60 min (1h)";
  if (minutes % 60 === 0) return `${minutes / 60} horas`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}min`;
}

/**
 * Map legacy booking keys to CRM service ID or lookup service by key/ID.
 */
export function findServiceByCodeOrId(
  services: CrmService[],
  identifier: string
): CrmService | undefined {
  if (!identifier) return undefined;
  const target = identifier.trim().toLowerCase();

  // 1. Direct UUID match
  const byId = services.find((s) => s.id.toLowerCase() === target);
  if (byId) return byId;

  // 2. Direct name match
  const byName = services.find((s) => s.name.toLowerCase() === target);
  if (byName) return byName;

  // 3. Legacy slugs mapping
  const legacyMap: Record<string, string> = {
    clase_semanal: "1 clase semanal",
    dos_clases_semanal: "2 clases semanales",
    gong: "baño de gong",
    puja: "puja de gong",
    constelaciones_constelar: "constelar",
    constelaciones_participar: "participante",
    retiro_encuentro: "retiro de ayuno",
    bienestar_experience: "bienestar experience",
    meditacion: "meditaciones guiadas",
    gestalt: "terapia gestalt",
  };

  const matchKey = legacyMap[target];
  if (matchKey) {
    const found = services.find((s) => s.name.toLowerCase().includes(matchKey));
    if (found) return found;
  }

  // 4. Loose substring match
  return services.find((s) => s.name.toLowerCase().includes(target));
}

/**
 * Dynamic categorization for landing display sections.
 * Prioritizes CRM assigned categoryCode if present, falling back to name/type heuristics.
 */
export function categorizeCrmServices(services: CrmService[]) {
  const destacadas: CrmService[] = [];
  const regularesYoga: CrmService[] = [];
  const talleresEventos: CrmService[] = [];
  const saludTerapeutica: CrmService[] = [];

  for (const s of services) {
    if (s.categoryCode === "longevidad_artes") {
      destacadas.push(s);
      continue;
    }
    if (s.categoryCode === "yoga_meditacion") {
      regularesYoga.push(s);
      continue;
    }
    if (s.categoryCode === "talleres_eventos") {
      talleresEventos.push(s);
      continue;
    }
    if (s.categoryCode === "salud_terapeutica") {
      saludTerapeutica.push(s);
      continue;
    }

    const lower = s.name.toLowerCase();

    // Activities in Bienestar Experience
    if (
      lower.includes("bienestar experience") ||
      lower.includes("bienestar")
    ) {
      destacadas.push(s);
      continue;
    }

    // Health / Gestalt
    if (
      lower.includes("gestalt")
    ) {
      saludTerapeutica.push(s);
      continue;
    }

    // Events, retreats, workshops
    if (
      s.serviceType === "event" ||
      lower.includes("gong") ||
      lower.includes("puja") ||
      lower.includes("constelaciones") ||
      lower.includes("retiro") ||
      lower.includes("conferencia") ||
      lower.includes("encuentro")
    ) {
      talleresEventos.push(s);
      continue;
    }

    // Regular Yoga & Meditation
    regularesYoga.push(s);
  }

  const sortByOrder = (a: CrmService, b: CrmService) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  destacadas.sort(sortByOrder);
  regularesYoga.sort(sortByOrder);
  talleresEventos.sort(sortByOrder);
  saludTerapeutica.sort(sortByOrder);

  return {
    destacadas,
    regularesYoga,
    talleresEventos,
    saludTerapeutica,
    all: [...services].sort(sortByOrder),
  };
}

/**
 * Robust category matching helper. Matches by categoryId, categoryCode, or name/type heuristics.
 */
export function serviceMatchesCategory(s: CrmService, cat: CrmCategory): boolean {
  if (s.categoryId && (s.categoryId === cat.id || s.categoryId === cat.code)) return true;
  if (s.categoryCode && (s.categoryCode === cat.code || s.categoryCode === cat.id)) return true;

  // Fallback heuristics if neither categoryId nor categoryCode is assigned to the service
  if (!s.categoryId && !s.categoryCode) {
    const lower = s.name.toLowerCase();
    if (cat.code === "longevidad_artes" || cat.code === "longevidad") {
      return lower.includes("bienestar");
    }
    if (cat.code === "salud_terapeutica") {
      return lower.includes("gestalt");
    }
    if (cat.code === "talleres_eventos") {
      return (
        s.serviceType === "event" ||
        lower.includes("gong") ||
        lower.includes("puja") ||
        lower.includes("constelaciones") ||
        lower.includes("retiro") ||
        lower.includes("conferencia")
      );
    }
    if (cat.code === "yoga_meditacion") {
      return (
        !lower.includes("bienestar") &&
        !lower.includes("gestalt") &&
        s.serviceType !== "event" &&
        !lower.includes("gong") &&
        !lower.includes("puja") &&
        !lower.includes("constelaciones") &&
        !lower.includes("retiro")
      );
    }
  }
  return false;
}
