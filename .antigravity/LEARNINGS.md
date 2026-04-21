# Issue: Falta diseño multi-sistema (Multi-Tenant) para programas.
# Root Cause: El análisis inicial de COBOL se centró en un solo sistema monolítico como POC, acoplando `program_name` como clave única universal.
# Solution: Añadir `system_id` como FK en `cobol_analysis.programs` proveniente de `public."System"`. Actualizar índices únicos a `(system_id, program_name)` y migrar las cascadas a las tablas hijas (divisiones, accesos).
# Date: 2026-04-12
# Universal Rule: Todo modelo que represente artefactos del cliente (programas, configuraciones) debe incluir una relación a su tenant o Sistema correspondiente para permitir aislamientos de datos por defecto.
