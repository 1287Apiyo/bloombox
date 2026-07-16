import Image from 'next/image';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Eyebrow } from './BrandShell';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  panelTitle: string;
  panelText: string;
  details: string[];
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  panelTitle,
  panelText,
  details,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f9fa] text-[#191c1d]">
      <div className="absolute left-0 top-0 h-[52%] w-full bg-[#ae2f34] lg:h-full lg:w-[58%]" />
      <div className="absolute bottom-0 right-0 h-[48%] w-full bg-[#fffaf7] lg:h-full lg:w-[42%]" />

      <main className="relative">
        <section>
          <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-[0.95fr_0.9fr] lg:items-center lg:py-12">
            <div className="grid gap-4 self-stretch sm:gap-5 lg:max-w-2xl">
              <Link href="/" className="flex w-fit items-center gap-3">
                <span className="relative h-11 w-11 overflow-hidden rounded-full border border-stone-300 bg-white">
                  <Image src="/bloom1.png" alt="BloomBox" fill sizes="44px" className="object-cover" priority />
                </span>
                <span className="text-xl font-bold tracking-tight text-white">BloomBox</span>
              </Link>

              <div className="relative min-h-[280px] overflow-hidden border border-[#fed4c8] bg-white shadow-[8px_8px_0_#8c1520] sm:min-h-[440px] lg:min-h-[560px]">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14090c]/68 via-[#14090c]/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
                  <Eyebrow>{eyebrow}</Eyebrow>
                  <h1 className="mt-5 max-w-2xl font-serif text-4xl font-semibold leading-none text-white sm:text-5xl">
                    {title}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#fff5f0]">{text}</p>
                </div>
              </div>

              <div className="grid border border-[#fed4c8] bg-[#fff5f0] sm:grid-cols-[1fr_1.2fr]">
                <div className="border-b border-[#e0bfbd] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Account flow</p>
                  <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">{panelTitle}</h2>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[#584140]">{panelText}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {details.map((detail) => (
                      <span key={detail} className="border border-[#e0bfbd] bg-white px-3 py-1 text-xs font-semibold text-[#584140]">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full border border-[#e0bfbd] bg-white p-5 shadow-[8px_8px_0_#f4dfdc] sm:p-7 lg:p-8">
                {children}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
