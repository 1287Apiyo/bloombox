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
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8f9fa] text-[#191c1d]">
      <div className="absolute left-0 top-0 h-[40%] w-full bg-[#ae2f34] sm:h-[48%] lg:h-full lg:w-[58%]" />
      <div className="absolute bottom-0 right-0 h-[60%] w-full bg-[#fffaf7] sm:h-[52%] lg:h-full lg:w-[42%]" />

      <main className="relative">
        <section>
          <div className="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-[0.95fr_0.9fr] lg:items-center lg:py-12">
            {/* Branding + hero — second on mobile so the form is above the fold */}
            <div className="order-2 grid gap-3 self-stretch sm:gap-5 lg:order-1 lg:max-w-2xl">
              <Link href="/" className="hidden w-fit items-center gap-2.5 sm:gap-3 lg:flex">
                <span className="relative h-10 w-10 overflow-hidden rounded-full border border-stone-300 bg-white sm:h-11 sm:w-11">
                  <Image src="/bloom1.png" alt="BloomBox" fill sizes="44px" className="object-cover" priority />
                </span>
                <span className="text-lg font-bold tracking-tight text-white sm:text-xl">BloomBox</span>
              </Link>

              <div className="relative min-h-[200px] overflow-hidden rounded-md border border-[#fed4c8] bg-white shadow-[4px_4px_0_#8c1520] sm:min-h-[360px] sm:shadow-[8px_8px_0_#8c1520] lg:min-h-[560px]">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14090c]/70 via-[#14090c]/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-8 lg:p-10">
                  <Eyebrow>{eyebrow}</Eyebrow>
                  <h1 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-none text-white sm:mt-5 sm:text-5xl">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#fff5f0] sm:mt-5 sm:text-base sm:leading-7">
                    {text}
                  </p>
                </div>
              </div>

              <div className="hidden overflow-hidden rounded-md border border-[#fed4c8] bg-[#fff5f0] sm:grid sm:grid-cols-[1fr_1.2fr]">
                <div className="border-b border-[#e0bfbd] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Account flow</p>
                  <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">{panelTitle}</h2>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[#584140]">{panelText}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {details.map((detail) => (
                      <span key={detail} className="rounded-md border border-[#e0bfbd] bg-white px-3 py-1 text-xs font-semibold text-[#584140]">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form panel — first on mobile for faster access */}
            <div className="order-1 flex flex-col gap-3 sm:gap-0 lg:order-2 lg:items-center">
              <Link href="/" className="flex w-fit items-center gap-2.5 lg:hidden">
                <span className="relative h-10 w-10 overflow-hidden rounded-full border border-stone-300 bg-white">
                  <Image src="/bloom1.png" alt="BloomBox" fill sizes="40px" className="object-cover" priority />
                </span>
                <span className="text-lg font-bold tracking-tight text-white">BloomBox</span>
              </Link>
              <div className="w-full rounded-md border border-[#e0bfbd] bg-white p-4 shadow-[4px_4px_0_#f4dfdc] sm:p-7 sm:shadow-[8px_8px_0_#f4dfdc] lg:p-8">
                {children}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
