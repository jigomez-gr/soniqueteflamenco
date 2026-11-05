"use client";

import { useState, useEffect } from "react";
import { Menu, X, Music, PhoneCall } from "lucide-react";
import { triggerCrmChat } from "@/components/ChatBubbleWidget";
import { triggerVapiCall } from "@/components/VapiCallModal";
import { isPorVapiEnabled } from "@/lib/featureFlags";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const showPorVapi = isPorVapiEnabled();

    const menuItems = [
        { label: "Inicio", href: "/#inicio" },
        { label: "Quiénes somos", href: "/#quienes-somos" },
        { label: "Actividades", href: "/#itinerario" },
        { label: "Vídeos", href: "/#videos" },
        { label: "Viajes Realizados", href: "/#viajes-realizados" },
        { label: "Testimonios", href: "/#testimonios" },
        { label: "Qué Incluye", href: "/#incluye" },
        { label: "Plazas y Precios", href: "/#precios" },
        { label: "Consultas / Reservas por Email ó Wassap", href: "/#contacto" },
    ];

    const handleInicioClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (typeof window !== "undefined") {
            if (window.location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                if (window.location.hash) {
                    history.replaceState(null, "", "/");
                }
            } else {
                window.location.href = "/";
            }
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#C5A059]/15 shadow-sm font-sans">
            {/* Desktop Centered Header Layout */}
            <div className="hidden xl:flex flex-col items-center pt-2.5 pb-2.5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
                {/* Logo Image absolutely positioned on the top left (aligned with Brand text, NEVER overlapping the nav below) */}
                <a
                    href="/"
                    onClick={handleInicioClick}
                    className="absolute left-6 lg:left-8 top-2.5 group select-none cursor-pointer z-10"
                    title="Soniquete Flamenco - Inicio"
                >
                    <img
                        src="/logos/soniqueteflamenco_512x512.png"
                        alt="Logo Soniquete Flamenco"
                        className="h-[52px] w-auto object-contain transition duration-300 group-hover:scale-105"
                    />
                </a>

                {/* Centered Brand Text Block */}
                <a href="/" onClick={handleInicioClick} className="flex flex-col items-center leading-tight mb-2.5 select-none cursor-pointer">
                    <div className="flex items-center space-x-1.5 text-[10px] tracking-widest text-[#96680E] uppercase font-extrabold">
                        <span>soniqueteflamenco.com</span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#800020] tracking-wide uppercase font-editorial">
                        PROMOCION ARTISTAS
                    </h2>
                </a>

                {/* Submenu links with vertical pipes */}
                <nav className="flex items-center justify-center space-x-3.5 lg:space-x-5 text-[10.5px] font-bold uppercase tracking-widest text-stone-600">
                    {menuItems.map((item, idx) => {
                        const isInicio = item.label.toLowerCase() === "inicio";
                        return (
                            <span key={item.label} className="flex items-center space-x-3.5 lg:space-x-5">
                                {idx > 0 && <span className="text-[#C5A059]/40 select-none font-light">|</span>}
                                <a
                                    href={item.href}
                                    onClick={isInicio ? handleInicioClick : undefined}
                                    className={`hover:text-[#800020] transition duration-200 ${isInicio ? "cursor-pointer font-extrabold text-[#800020]" : ""}`}
                                >
                                    {item.label}
                                </a>
                            </span>
                        );
                    })}
                    <span className="text-[#C5A059]/40 select-none font-light">|</span>
                    <a
                        href="/servicios"
                        className="text-[#800020] font-extrabold hover:underline transition duration-200"
                    >
                        Reservar Plaza
                    </a>
                    {showPorVapi && (
                        <>
                            <span className="text-[#C5A059]/40 select-none font-light">|</span>
                            <button
                                type="button"
                                onClick={() => triggerVapiCall({ inquiry: "Consulta general sobre servicios y horarios" })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#C5A059]/50 text-[#800020] hover:bg-[#800020] hover:text-white bg-[#FAF9F6] transition duration-200 cursor-pointer text-[10px] font-extrabold uppercase tracking-wider shadow-2xs group"
                                title="Pedir llamada inmediata gratuita con nuestro Asistente de Voz"
                            >
                                <PhoneCall className="w-3 h-3 text-[#C5A059] group-hover:text-white transition-colors" />
                                <span>Te Llamamos</span>
                            </button>
                        </>
                    )}
                </nav>
            </div>

            {/* Mobile Header Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between xl:hidden relative h-[64px]">
                {/* Left side: Hamburger button + Logo */}
                <div className="flex items-center space-x-2 select-none shrink-0">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-[#1C1C1C] hover:text-[#800020] focus:outline-none p-1"
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-stone-700" />}
                    </button>
                    <a href="/" onClick={handleInicioClick} className="cursor-pointer">
                        <img
                            src="/logos/soniqueteflamenco_512x512.png"
                            alt="Logo Soniquete Flamenco"
                            className="h-11 w-auto object-contain transition duration-200"
                        />
                    </a>
                </div>

                {/* Center: Brand TEXT */}
                <div className="flex-1 flex flex-col items-center justify-center select-none text-center px-2 leading-tight min-w-0">
                    <span className="text-[8.5px] xs:text-[9.5px] tracking-wider text-[#96680E] uppercase font-extrabold truncate max-w-full">
                        soniqueteflamenco.com
                    </span>
                    <span className="font-serif text-[15px] xs:text-[18px] font-black text-[#800020] uppercase tracking-wide leading-none mt-1 font-editorial truncate max-w-full">
                        PROMOCION ARTISTAS
                    </span>
                </div>

                {/* Right side spacer to balance layout */}
                <div className="w-[76px] shrink-0" aria-hidden="true" />
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div className="xl:hidden bg-white border-t border-[#C5A059]/15 py-4 px-6 absolute top-full left-0 right-0 shadow-lg animate-slideDown">
                    <nav className="flex flex-col space-y-4 font-semibold text-xs uppercase tracking-widest text-[#1C1C1C]/60">
                        {menuItems.map((item) => {
                            const isInicio = item.label.toLowerCase() === "inicio";
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => {
                                        setIsOpen(false);
                                        if (isInicio) {
                                            handleInicioClick(e);
                                        }
                                    }}
                                    className={`hover:text-[#800020] py-1 transition ${isInicio ? "font-extrabold text-[#800020]" : ""}`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                        {showPorVapi && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    triggerVapiCall({ inquiry: "Consulta general sobre servicios y horarios" });
                                }}
                                className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#C5A059] rounded text-xs font-bold uppercase tracking-widest text-[#800020] bg-[#FAF9F6] hover:bg-[#800020] hover:text-white transition shadow-xs cursor-pointer"
                            >
                                <PhoneCall className="w-4 h-4 text-[#C5A059]" />
                                <span>Te Llamamos Gratis (IA)</span>
                            </button>
                        )}
                        <a
                            href="/servicios"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center py-2.5 border border-transparent rounded text-xs font-bold uppercase tracking-widest text-white bg-[#800020] hover:bg-[#800020]/90 transition"
                        >
                            Reservar Plaza
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
