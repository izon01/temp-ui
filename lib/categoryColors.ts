export const CATEGORY_COLOR: Record<string, { bg: string; text: string }> = {
  '필독':       { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
  '공지사항':   { bg: 'bg-[#EBF5FF]', text: 'text-[#0062FF]' },
  '취업정보':   { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]' },
  '취업활동양식': { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]' },
  '기타':       { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]' },
};

export const DEFAULT_CATEGORY_COLOR = { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]' };

/** 카테고리 문자열(쉼표 구분)을 파싱해 색상 배열 반환 */
export function parseCategoryBadges(category: string) {
  return category
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => ({ label: c, ...(CATEGORY_COLOR[c] ?? DEFAULT_CATEGORY_COLOR) }));
}
