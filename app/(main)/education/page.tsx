import { auth } from '@/auth';
import { getAssignments, getAssignmentSubmissionRate } from '@/actions/assignments';
import EducationClient from './EducationClient';

export default async function EducationPage() {
  const session = await auth();
  const userId   = session?.user?.id;
  const userName = session?.user?.name ?? '학생';
  const isAdmin  = session?.user?.role === 'admin';

  const [assignments, submissionRate] = await Promise.all([
    getAssignments(userId),
    getAssignmentSubmissionRate(),
  ]);

  return (
    <EducationClient
      initialAssignments={assignments}
      userName={userName}
      isAdmin={isAdmin}
      submissionRate={submissionRate}
    />
  );
}
