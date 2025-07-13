// src/components/Footer.tsx

import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";

// O Ícone do Instagram precisa ser definido aqui para que o componente seja auto-suficiente.
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Exportamos o componente como padrão para que possa ser importado em outras páginas.
export default function Footer() {
  const socialLinks = [
    {
      icon: MessageCircle,
      href: "[https://wa.me/5532998111973](https://wa.me/5532998111973)",
      label: "WhatsApp",
    },
    {
      icon: InstagramIcon,
      href: "[https://instagram.com/codevibestudio](https://instagram.com/codevibestudio)",
      label: "Instagram",
    },
    { icon: Mail, href: "mailto:codevibe.br@gmail.com", label: "Email" },
  ];

  return (
    <footer id="contato" className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6 text-center">
        <Image
          src="/codevibestudiologo.png"
          alt="Logo CodeVibe Studio"
          width={70}
          height={70}
          className="rounded-md mx-auto mb-4"
        />
        <p className="text-lg font-bold mb-4">CodeVibe Studio</p>
        <p className="text-gray-400 mb-6">
          Transformando ideias em realidade digital.
        </p>
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <link.icon size={28} />
            </a>
          ))}
        </div>
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} CodeVibe Studio. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
