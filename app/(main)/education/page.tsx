import { auth } from '@/auth';
import { getAssignments } from '@/actions/assignments';
import EducationClient from './EducationClient';

export default async function EducationPage() {
  const session = await auth();
  const userId   = session?.user?.id;
  const userName = session?.user?.name ?? '학생';
  const isAdmin  = session?.user?.role === 'admin';

  const assignments = await getAssignments(userId);

  return (
    <EducationClient
      initialAssignments={assignments}
      userName={userName}
      isAdmin={isAdmin}
    />
  );
}
