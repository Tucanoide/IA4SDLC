import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomeClient from '@/components/dashboard/HomeClient';
import ProgramPageClient from '@/components/dashboard/ProgramPageClient';
import ImpactClient from '@/components/dashboard/ImpactClient';
import DocQueryClient from '@/components/dashboard/DocQueryClient';

const mockPrograms = [
  { program_name: 'CBACT01C', program_type: 'CBL' },
  { program_name: 'CBACT02C', program_type: 'CBL' },
];

const mockSystemData = {
  system: { name: 'CardDemo', description: 'Mainframe Migration POC' },
  totalPrograms: 42,
  totalLines: 500,
  totalDependencies: 128,
};

describe('Dashboard Queries Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Option: SYSLOG (Home)', () => {
    it('should display metrics correctly without program selection', () => {
      render(<HomeClient data={mockSystemData} error={null} />);
      expect(screen.getByText('42')).toBeInTheDocument(); // totalPrograms
      expect(screen.getByText('500')).toBeInTheDocument(); // totalLines (no fmt for < 1000)
      expect(screen.getByText(/PROG_ANALYZED/i)).toBeInTheDocument();
    });
  });

  describe('Option: TECH_SPEC / FUNC_DECODE / UX_VECTORS / VOID_CONFIG / USE_CASES', () => {
    const contentTypes = [
      { type: 'technical_doc', title: 'Technical Documentation' },
      { type: 'functional_doc', title: 'Functional Documentation' },
      { type: 'quality_audit', title: 'Quality Audit' },
      { type: 'code_audit', title: 'Code Audit' },
      { type: 'use_cases', title: 'Use Cases' },
    ];

    contentTypes.forEach(({ type, title }) => {
      it(`should require program selection for ${title} and fetch data`, async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'completed' }),
        }).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ content_md: `# Content for ${type}` }),
        });

        render(
          <ProgramPageClient
            programs={mockPrograms}
            contentType={type}
            title={title}
            description="Test"
            icon="description"
          />
        );

        // Should show initial state
        expect(screen.getByText(/Seleccioná un programa para continuar/i)).toBeInTheDocument();

        // Select program
        fireEvent.click(screen.getByText(/Buscá un programa/i));
        fireEvent.click(screen.getByText('CBACT01C'));

        await waitFor(() => {
          expect(screen.getByText(`Content for ${type}`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Option: SYS_OVERVIEW / ONBOARD (System Level)', () => {
    it('should load System Overview automatically without program selection', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'completed' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ content_md: '# System Arch' }) });

      render(
        <ProgramPageClient
          contentType="functional_doc_system"
          title="System Overview"
          description="Test"
          icon="hub"
          systemLevel={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('System Arch')).toBeInTheDocument();
      });
    });

    it('should load Onboarding chapters automatically', async () => {
      const mockChapters = {
        status: 'completed',
        chapters: [
          { chapter_order: 1, title: 'Intro', content_html: '<p>Welcome</p>', estimated_minutes: 5 }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'completed' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChapters,
      });

      render(
        <ProgramPageClient
          contentType="onboarding"
          title="Onboarding"
          description="Test"
          icon="school"
          systemLevel={true}
        />
      );

      await waitFor(() => {
        // Use getAllByText because it appears in nav and content
        expect(screen.getAllByText('Intro')[0]).toBeInTheDocument();
        expect(screen.getByText('Welcome')).toBeInTheDocument();
      });
    });
  });

  describe('Option: NEURAL_CORE (Impact Analysis)', () => {
    it('should require program and analyze impact', async () => {
      const mockImpactData = {
        result: {
          programId: 'CBACT01C',
          analysis: 'Impact evidence found.',
          directDependencies: ['FILE_A'],
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockImpactData),
      });

      render(<ImpactClient programs={mockPrograms} dbError={null} />);

      // Select and Analyze
      fireEvent.click(screen.getByText(/Select a program…/i));
      fireEvent.click(screen.getByText('CBACT01C'));
      fireEvent.click(screen.getByRole('button', { name: /Analyze Impact/i }));

      await waitFor(() => {
        expect(screen.getByText('Impact evidence found.')).toBeInTheDocument();
        expect(screen.getByText('FILE_A')).toBeInTheDocument();
      });
    });
  });

  describe('Option: DOC_QUERY', () => {
    it('should require program and prompt content', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ content: 'Result from AI' }),
      });

      render(<DocQueryClient programs={mockPrograms} dbError={null} />);

      fireEvent.click(screen.getByText(/Select a program…/i));
      fireEvent.click(screen.getByText('CBACT01C'));
      
      const textarea = screen.getByPlaceholderText(/Ask something about this program/i);
      fireEvent.change(textarea, { target: { value: 'How it works?' } });

      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Result from AI')).toBeInTheDocument();
      });
    });
  });
});
