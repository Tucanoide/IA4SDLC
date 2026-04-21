import { getPrograms } from '@/lib/metrics';
import ImpactClient from '@/components/dashboard/ImpactClient';

export default async function ImpactPage() {
  let programs: Awaited<ReturnType<typeof getPrograms>> = [];
  let dbError: string | null = null;

  try {
    programs = await getPrograms();
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Failed to load programs';
  }

  return <ImpactClient programs={programs} dbError={dbError} />;
}
