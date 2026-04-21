import ProgramPageClient from '@/components/dashboard/ProgramPageClient';

export default function OnboardingPage() {
  return (
    <ProgramPageClient
      contentType="onboarding"
      contentTypeLabel="onboarding_functional"
      title="Onboarding"
      description="Material interactivo de incorporación al sistema COBOL completo."
      icon="school"
      accentColor="#9bd598"
      systemLevel
    />
  );
}
