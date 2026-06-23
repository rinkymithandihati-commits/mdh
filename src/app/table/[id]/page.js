"use client";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import MenuGrid from "@/components/MenuGrid";
import Image from "next/image";

export default function TablePage() {
  const params = useParams();
  const tableId = params.id;

  return (
    <div className="min-h-screen bg-cream">
      <Header showCart={true} />

      <section className="relative h-40 md:h-52 overflow-hidden">
        <Image src="/hero-bg.webp" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-gold text-xs font-medium">Table {tableId}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Mitthan Di Hatti</h1>
            <p className="text-white/60 text-sm">Scan & order — we serve fresh!</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <span className="text-gold text-xs font-medium tracking-widest uppercase">Order From Table</span>
          <h2 className="text-2xl font-bold text-primary mt-1">Our Menu</h2>
        </div>
        <MenuGrid tableId={tableId} />
      </main>
    </div>
  );
}
