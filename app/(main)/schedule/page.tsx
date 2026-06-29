import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getScheduleEvents } from '@/actions/schedule';
import ScheduleClient from './ScheduleClient';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/home');

  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const events = await getScheduleEvents(year, month);

  return <ScheduleClient year={year} month={month} events={events} />;
}
