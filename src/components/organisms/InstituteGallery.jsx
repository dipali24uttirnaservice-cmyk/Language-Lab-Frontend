"use client";

import Image from "next/image";

const GALLERY_ITEMS = [
  {
    src: "/image.jpg",
    alt: "Aerial view of institute campus",
    caption: "Our Campus",
  },
  {
    src: "/image1.jpg",
    alt: "Students walking through the education center",
    caption: "Student Life",
  },
  {
    src: "/image2.png",
    alt: "Institute building exterior",
    caption: "Modern Facilities",
  },
];

export default function InstituteGallery() {
  return (
    <section className="relative w-full py-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-slate-900">
            Life at the Institute
          </h2>
          <p className="mt-3 text-base text-slate-600">
            A glimpse of our campus, facilities, and student community.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.src}
              className="group relative overflow-hidden rounded-2xl border-2 border-amber-400/70 shadow-[0_20px_50px_rgba(245,158,11,0.15)]"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm font-semibold text-white">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
