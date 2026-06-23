"use client";
import Header from "@/components/Header";
import MenuGrid from "@/components/MenuGrid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-cream">
      <Header transparent={false} showCart={true} />

      <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        <Image
          src="/hero-new.webp"
          alt="Mitthan Di Hatti Sweets"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 md:mb-6">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              <span className="text-gold text-xs md:text-sm font-medium tracking-wider uppercase">Since 1890</span>
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Mitthan Di Hatti
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 font-light">
              Premium Indian Sweets & Restaurant — Panipat
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="#menu"
                className="px-6 md:px-8 py-3 bg-gold text-maroon font-bold rounded-full text-sm md:text-base hover:bg-gold/90 transition shadow-lg"
              >
                Explore Menu
              </a>
              <Link
                href="/cart"
                className="px-6 md:px-8 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-medium rounded-full text-sm md:text-base hover:bg-white/20 transition"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <section id="menu" className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <span className="text-gold text-sm font-medium tracking-widest uppercase">Our Collection</span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mt-1">Premium Menu</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3 rounded-full" />
        </div>
        <MenuGrid />
      </section>

      <footer className="bg-primary text-white/60 py-8 mt-8 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" style={{ width: 32, height: 32 }} />
            <span className="text-white font-bold text-lg">Mitthan Di Hatti</span>
          </div>
          <p className="text-sm">Since 1890 | Panipat, Haryana</p>
          <p className="text-xs mt-2 opacity-50">Premium Indian Sweets & Restaurant</p>
        </div>
        <div
          onClick={() => router.push("/admin/login")}
          className="absolute bottom-2 right-2 w-3 h-3 bg-gray-500/30 hover:bg-gray-500/50 rounded-full cursor-pointer transition"
        />
      </footer>
    </div>
  );
}
