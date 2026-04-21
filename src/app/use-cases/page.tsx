import ProgramPageClient from '@/components/dashboard/ProgramPageClient';

export default function UseCasesPage() {
  return (
    <ProgramPageClient
      contentType="use_cases"
      title="Use Cases"
      description="Casos de uso del sistema generados a partir del análisis COBOL."
      icon="fact_check"
      accentColor="#00e639"
      systemLevel={true}
    />
  );
}
