import { getParticipantCount, getParticipants } from '@/actions/participants';
import { participants as mockParticipants } from '@/data/mockData';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [dbParticipants, participantCount] = await Promise.all([
    getParticipants(),
    getParticipantCount(),
  ]);

  // DB 참여자가 있으면 DB 데이터, 없으면 mock fallback
  const participants = dbParticipants && dbParticipants.length > 0
    ? dbParticipants
    : mockParticipants.map(p => ({ ...p, lastAccess: p.lastAccess }));

  return (
    <HomeClient
      participants={participants}
      participantCount={participantCount || participants.length}
    />
  );
}
