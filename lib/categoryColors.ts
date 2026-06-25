export const CATEGORY_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  '필독':         { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', icon: '🔔' },
  '공지사항':     { bg: 'bg-[#EBF5FF]', text: 'text-[#0062FF]', icon: '📢' },
  '취업정보':     { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', icon: '💼' },
  '취업활동양식': { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]', icon: '📝' },
  '기타':         { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', icon: '💬' },
};

export const DEFAULT_CATEGORY_STYLE = { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', icon: '💬' };

/** 카테고리 문자열(쉼표 구분)을 파싱해 뱃지 배열 반환 */
export function parseCategoryBadges(category: string) {
  return category
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => ({ label: c, ...(CATEGORY_STYLE[c] ?? DEFAULT_CATEGORY_STYLE) }));
}
