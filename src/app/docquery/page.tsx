import { getPrograms } from '@/lib/metrics';
import DocQueryClient from '@/components/dashboard/DocQueryClient';

export default async function DocQueryPage() {
  let programs: Awaited<ReturnType<typeof getPrograms>> = [];
  let dbError: string | null = null;

  try {
    programs = await getPrograms();
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Failed to load programs';
  }

  return <DocQueryClient programs={programs} dbError={dbError} />;
}
