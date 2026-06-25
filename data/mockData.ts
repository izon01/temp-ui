export type ParticipantStatus = '정상' | '주의' | '위험';

export interface Participant {
  id: number;
  name: string;
  team: string;
  track: string;
  status: ParticipantStatus;
  attendance: number;
  lastAccess: string;
}

export interface Assignment {
  id: number;
  week: number;
  title: string;
  description: string;
  deadline: string;
  daysLeft: number | null;
  submitted: boolean;
}

export interface Notice {
  id: number;
  title: string;
  content?: string;
  date: string;
  views: number;
  isPinned: boolean;
  category: string;
  icon: string;
}

export interface CommunityPost {
  id: number;
  category: '자유게시판' | '취업/진로' | '스터디모집';
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  comments: number;
  hasImage?: boolean;
  imageUrl?: string;
}

export const participants: Participant[] = [];

export const assignments: Assignment[] = [
  {
    id: 1,
    week: 10,
    title: '스타트업 비즈니스 모델 캔버스 작성',
    description: '제시된 템플릿에 따라 본인의 사업 아이템을 9가지 영역으로 분석하여 제출하세요.',
    deadline: '2026-06-26',
    daysLeft: 3,
    submitted: false,
  },
  {
    id: 2,
    week: 9,
    title: '경북 특화 산업 동향 분석 리포트',
    description: '로컬 크리에이터로서 바라본 경상북도 산업의 현재와 미래에 대한 분석 보고서.',
    deadline: '2026-06-16',
    daysLeft: null,
    submitted: true,
  },
  {
    id: 3,
    week: 8,
    title: '퍼스널 브랜딩 전략 기획안',
    description: '전문 인재로서 자신의 강점을 분석하고 차별화된 시장 가치를 창출하는 전략 수립.',
    deadline: '2026-06-09',
    daysLeft: null,
    submitted: true,
  },
  {
    id: 4,
    week: 7,
    title: '지역 사회 문제 해결 프로젝트 기획서',
    description: '경북 지역의 특정 문제를 선정하고 청년 관점에서의 해결 방안을 제안하세요.',
    deadline: '2026-06-02',
    daysLeft: null,
    submitted: true,
  },
];

export const notices: Notice[] = [
  { id: 1, title: '개인정보 처리방침 개정 안내 및 동의 절차', date: '2026.06.20', views: 4521, isPinned: true, category: '필독', icon: 'notification_important' },
  { id: 2, title: '경북청년인재스쿨 6월 정기 휴관 일정 안내', date: '2026.06.18', views: 2890, isPinned: true, category: '필독', icon: 'campaign' },
  { id: 3, title: '신규 취업 역량 강화 워크숍 선착순 모집', date: '2026.06.15', views: 1204, isPinned: false, category: '프로그램', icon: 'description' },
  { id: 4, title: '제 3회 경북 청년 창업 아이디어 경진대회 결과 발표', date: '2026.06.12', views: 856, isPinned: false, category: '공지', icon: 'celebration' },
  { id: 5, title: '자주 묻는 질문(FAQ) 업데이트 안내', date: '2026.06.10', views: 542, isPinned: false, category: '공지', icon: 'help_center' },
  { id: 6, title: '2026 하반기 인재 양성 프로그램 선발 안내', date: '2026.06.05', views: 3210, isPinned: false, category: '프로그램', icon: 'school' },
  { id: 7, title: '멘토 매칭 시스템 오픈 안내', date: '2026.05.28', views: 998, isPinned: false, category: '공지', icon: 'groups' },
  { id: 8, title: '6월 네트워킹 데이 행사 안내', date: '2026.05.20', views: 1467, isPinned: false, category: '프로그램', icon: 'event' },
];

export const communityPosts: CommunityPost[] = [
  {
    id: 1,
    category: '스터디모집',
    title: '파이썬 데이터 분석 기초 스터디 같이 하실 분 계신가요?',
    content: '경북 지역 청년들끼리 모여서 매주 주말마다 카페에서 파이썬 기초부터 실무 데이터 분석까지 차근차근 배워보고 싶습니다. 열정 있으신 분 환영합니다!',
    author: '김인재',
    timeAgo: '방금 전',
    comments: 8,
  },
  {
    id: 2,
    category: '취업/진로',
    title: '포트폴리오 피드백 부탁드려도 될까요?',
    content: '이번에 UI/UX 디자이너로 전향하려고 준비 중인 취준생입니다. 프로젝트 정리가 쉽지 않네요. 현직자 선배님들의 조언이 간절합니다.',
    author: '박디자인',
    timeAgo: '2시간 전',
    comments: 15,
  },
  {
    id: 3,
    category: '자유게시판',
    title: '청년창업 지원사업 합격했습니다!',
    content: '준비하면서 힘들었는데 인재스쿨 멘토님들 덕분에 큰 힘이 되었습니다. 모두 포기하지 말고 끝까지 달려봐요!',
    author: '최성공',
    timeAgo: '5시간 전',
    comments: 32,
    hasImage: true,
  },
  {
    id: 4,
    category: '자유게시판',
    title: '오늘 점심 메뉴 추천받아요',
    content: '안동 캠퍼스 근처에 맛집 아시는 분 계신가요? 날씨가 좋아서 좀 맛있는거 먹고 싶네요.',
    author: '이청년',
    timeAgo: '어제',
    comments: 4,
  },
  {
    id: 5,
    category: '취업/진로',
    title: '면접 대비 스피치 팁 공유합니다',
    content: '지난주 면접 보면서 느꼈던 점들이랑, 떨지 않고 말하는 법 몇 가지 정리해봤습니다. 도움 되셨으면 좋겠어요.',
    author: '장멘토',
    timeAgo: '어제',
    comments: 21,
  },
  {
    id: 6,
    category: '스터디모집',
    title: '정보처리기사 실기 스터디 하실 분!',
    content: '이번 회차 실기 시험 같이 준비하실 분들 모십니다. 온라인으로 주 2회 진행할 예정이에요.',
    author: '김자격',
    timeAgo: '2일 전',
    comments: 6,
  },
];
