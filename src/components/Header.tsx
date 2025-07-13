// src/components/Header.tsx
'use client'; // Este componente precisa de interatividade

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { href: "#projetos", label: "Projetos" },
    { href: "#ideator", label: "Gerador de Ideias" },
    { href: "#sobre", label: "Sobre Nós" },
  ];
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <Image src="/codevibestudio.jpeg" alt="Logo CodeVibe Studio" width={50} height={50} className="rounded-md" />
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-texto-claro hover:text-secundaria transition-colors">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-texto-claro font-bold hover:text-primaria transition-colors">
            Login
          </Link>
          <Link href="#projetos" className="bg-secundaria text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
            Nossas Soluções
          </Link>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
          <div className="flex flex-col items-center p-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-texto-claro hover:text-secundaria transition-colors w-full text-center py-3" onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="w-full border-t my-2"></div>
            <Link href="/login" className="text-texto-claro font-bold hover:text-primaria transition-colors w-full text-center py-3" onClick={() => setIsMenuOpen(false)}>
                Login
            </Link>
            <Link href="#projetos" className="bg-secundaria text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors w-full text-center mt-2" onClick={() => setIsMenuOpen(false)}>
              Nossas Soluções
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
