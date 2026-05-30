"use client";

type LoadingScreenProps = {
  isFading: boolean;
};

export default function LoadingScreen({ isFading }: LoadingScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#0B0F0E] transition-opacity duration-[600ms] ease-out ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading UmmahConnect"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="font-serif text-3xl font-semibold text-[#F5D78A] sm:text-4xl">
          Ummah<span className="text-white">Connect</span>
        </div>
        <div className="animate-pulse text-xl text-white/70" lang="ar" dir="rtl">
          بسم الله الرحمن الرحيم
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-[#F5D78A]" />
      </div>
    </div>
  );
}
