export default function Footer() {
  return (
    <footer className="bg-[#f3f4f5] mt-10 mb-16 md:mb-0">
      <div className="w-full py-6 px-4 md:px-6 flex items-center gap-6 max-w-[1200px] mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo2.png" alt="로고 2" className="h-8 md:h-10 w-auto object-contain" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo3.png" alt="로고 3" className="h-8 md:h-10 w-auto object-contain" />
      </div>
    </footer>
  );
}
