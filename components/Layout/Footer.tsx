export default function Footer() {
  return (
    <footer className="bg-[#f3f4f5] mt-10 mb-16 md:mb-0">
      <div className="w-full py-6 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1200px] mx-auto">
        <span className="font-bold text-xl text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
          경북청년인재스쿨
        </span>
        <div className="flex gap-6">
          <a href="#" className="text-sm text-[#434653] hover:text-[#00327d] transition-colors">이용약관</a>
          <a href="#" className="text-sm text-[#434653] hover:text-[#00327d] transition-colors">개인정보처리방침</a>
          <a href="#" className="text-sm text-[#434653] hover:text-[#00327d] transition-colors">고객센터</a>
        </div>
      </div>
    </footer>
  );
}
