# PRODUCT SCOPE: IA4SDLC - Forensic Architect Dashboard

## 1. Resumen Ejecutivo
El proyecto busca dotar de un Frontend moderno y de alto rendimiento (Next.js) al motor de análisis de sistemas legacy (COBOL). El sistema funciona como un modelo de **Orquestación Asincrónica (Pipeline Control)**, en donde el frontend lidera la ingesta de repositorios a una base vectorial (Qdrant) y relacional (PostgreSQL) vía **n8n**, para luego desbloquear progresivamente herramientas de auditoría y análisis de impacto para los analistas técnicos.

## 2. Definición Técnica (Data & Stack)
*   **Frontend:** Next.js (App Router), Tailwind CSS (v4), TypeScript.
*   **Estética:** Design System *Forensic Architect* (Dark mode, JetBrains Mono, glassmorphism, interfaces densas de alto contraste).
*   **Performance:** Hostinger Sites. Restricción de 200 procesos concurrentes: Prohibidas las escrituras en disco (I/O bloqueante) y uso del Singleton in-memory de Prisma.
*   **Backend & IA:** Orquestación total mediante n8n (Microservicios LLM).

## 3. Core Feature List (MVP Iterativo)
La plataforma es **Multi-Sistema** (orientada a Workspaces/Proyectos). El progreso estará limitado por un patrón de "Desbloqueo Progresivo".

### 3.1. Estado 0: Workspaces (A crear en la Fase 1)
*   **Workspace Hub:** Pantalla para ver/crear sistemas. 
*   **Ingesta (RAG):** El sistema asume que el código fuente ya está disponible en las carpetas base de n8n o historizado en Postgres. El usuario aprieta un botón ("Iniciar Ingesta RAG") y el front entra en modo "Loading/Background Process" con una micro-animación mientras `n8n` vectoriza el sistema.

### 3.2. Estado 1: RAG Cargado
Una vez completada la ingesta vectorial, se habilita el Dashboard core:
*   **Impact Analysis (Desbloqueado):** Ya que depende únicamente del parseo e inserción de relaciones, la vista del árbol de dependencias e impacto relacional pasa a estar inmediatamente disponible.
*   **Quality Audit & Documentation (Grisados / CTA):** Estos paneles aún *no están calculados* ya que requieren prompts pesados al LLM. Si el usuario ingresa, no ve datos, sino una pantalla o "CTA (Call to Action)" que indica: *"Este sistema aún no ha sido Auditado/Documentado. [Ejecutar Acción]"*.

### 3.3. Estado 2: Deep Analysis Cargado
El usuario hace clic en el CTA de Auditoría o Documentación (Trigger masivo del piloto).
*   **Ejecución Masiva:** n8n procesa *todo* el sistema. 
*   **Desbloqueo:** Una vez que finaliza, los paneles muestran el Semáforo de Riesgo (Quality Audit) y la Documentación (Code vs Functional text).

## 4. Estado Actual / Siguientes Pasos
**Foco Prioritario (Fase 1 - End-to-End Ingesta):**
Resolveremos primero y de principio a fin el flujo base: creación lógica de un `Sistema` en PostgreSQL, el botón que dispara el Webhook a n8n para la "*Carga de RAG*", la animación de espera en Next.js (Polling o SSE), y el cambio de estado a completado. Todo lo referente a Análisis e Impacto quedará en segundo plano hasta tener dominado este primer túnel de datos.
