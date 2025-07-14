// src/components/ClientImage.tsx
"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";

interface ClientImageProps extends ImageProps {
  fallbackText: string;
}

export default function ClientImage({ src, alt, width, height, className, fallbackText }: ClientImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://placehold.co/${width}x${height}/e2e8f0/4a5568?text=${fallbackText}`;
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
}
