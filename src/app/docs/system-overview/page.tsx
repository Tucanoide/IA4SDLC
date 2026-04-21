import ProgramPageClient from '@/components/dashboard/ProgramPageClient';

export default function SystemOverviewPage() {
  return (
    <ProgramPageClient
      contentType="functional_doc_system"
      title="Visión Funcional del Sistema"
      description="Documentación funcional completa del sistema COBOL: arquitectura de negocio, flujos principales y relaciones entre programas."
      icon="hub"
      accentColor="#c3c0ff"
      systemLevel={true}
      contentTypeLabel="functional_doc_system"
    />
  );
}
