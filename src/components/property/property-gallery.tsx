"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-xl bg-zinc-100 dark:bg-zinc-900" />
    );
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  const thumbnails = images.slice(0, 4);
  const extraCount = images.length - 4;

  return (
    <div>
      {/* Mobile: carrusel deslizable con contador */}
      <div className="relative sm:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, i) => (
            <div
              key={url}
              className="relative aspect-[4/3] w-full flex-shrink-0 snap-center bg-zinc-100 dark:bg-zinc-900"
            >
              <Image
                src={url}
                alt={`${title} - foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
            {mobileIndex + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {/* Desktop: foto grande + miniaturas */}
      <div className="hidden h-[420px] gap-2 sm:flex">
        <div className="relative flex-[3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={images[heroIndex]}
            alt={title}
            fill
            className="object-cover"
            sizes="800px"
            priority
          />
        </div>
        {thumbnails.length > 0 ? (
          <div className="flex flex-1 flex-col gap-2">
            {thumbnails.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setHeroIndex(i)}
                className="relative flex-1 overflow-hidden rounded-lg bg-zinc-100 ring-inset dark:bg-zinc-900"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className={`object-cover ${heroIndex === i ? "ring-2 ring-zinc-900 dark:ring-white" : ""}`}
                  sizes="150px"
                />
                {i === 3 && extraCount > 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
                    +{extraCount} fotos
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
