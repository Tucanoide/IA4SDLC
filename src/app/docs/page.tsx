import { getPrograms } from '@/lib/metrics';
import DocsClient from '@/components/dashboard/DocsClient';

export default async function DocsPage() {
  let programs: Awaited<ReturnType<typeof getPrograms>> = [];
  let dbError: string | null = null;

  try {
    programs = await getPrograms();
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Failed to load programs';
  }

  return <DocsClient programs={programs} dbError={dbError} />;
}
