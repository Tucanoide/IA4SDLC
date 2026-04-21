@AGENTS.md

# IA4SDLC — Onboarding para IA del proyecto fusionado

## Qué es este proyecto

**IA4SDLC** es un sistema de análisis e inteligencia artificial para código COBOL legado, construido sobre n8n como motor de workflows. Genera automáticamente documentación técnica, funcional, casos de uso, casos de prueba, auditorías de calidad y material de onboarding para programas COBOL.

El proyecto tiene **dos partes** que se están fusionando:
- **Este lado (backend/n8n)**: workflows que procesan el código COBOL y exponen webhooks con los resultados.
- **El otro lado (frontend)**: interfaz que el usuario opera para disparar los workflows y visualizar la información generada.

---

## Stack técnico

| Componente    | Detalle |
|---------------|---------|
| Workflow engine | n8n — https://n8n.srv1187720.hstgr.cloud/ |
| Base de datos | PostgreSQL, schema `cobol_analysis` |
| Vector store  | Qdrant, colección `carddemo_cobol_simple` (chunks por párrafo COBOL) |
| LLM           | Gemini 2.0 Flash (generación de texto) |
| Embeddings    | Gemini Embedding 2 |
| Fuente COBOL  | Google Drive — carpeta con archivos `.cbl` y `.cpy` |

---

## Workflows n8n — estado actual

### Workflows pre-existentes (no tocar)
| ID | Nombre | Función |
|----|--------|---------|
| `CwIg34zcWcrvbEAj` | Ingesta BATCH COBOL | Lee GDrive → parsea → carga PostgreSQL + Qdrant |
| `p3E3FbkvRxI8rN9o` | BOT (chat) | Webhook → AI Agent con RAG sobre Qdrant + SQL tool sobre PostgreSQL |

### Workflows nuevos (creados en este proyecto)
Todos los archivos JSON están en `/Users/juanpablodarocha/Documents/Claude/n8n/IA4SDLC Batch/`

| Archivo JSON | Webhook path | Función |
|---|---|---|
| `IA4SDLC - Init Content Status.json` | `POST /webhook/ia4sdlc-init-content-status` | Inicializa registros en `content_generation_status` |
| `IA4SDLC - Content Status API.json` | `GET /webhook/ia4sdlc-content-status` | Retorna estado de generación por programa |
| `IA4SDLC - Quality Audit.json` | (ver JSON) | Genera auditoría de calidad por programa |
| `IA4SDLC - Technical Doc.json` | (ver JSON) | Genera documentación técnica por programa |
| `IA4SDLC - Use Cases.json` | (ver JSON) | Genera casos de uso por programa |
| `IA4SDLC - Onboarding Generator.json` | (ver JSON) | Genera capítulos de onboarding interactivos |
| `IA4SDLC - Run All.json` | (ver JSON) | Orquesta la generación de todos los tipos para un programa |
| `IA4SDLC - Cleanup.json` | (ver JSON) | Limpia datos generados (uso en desarrollo/reset) |

---

## Base de datos — schema `cobol_analysis`

### Tablas originales (ingesta)
`programs`, `program_versions`, `program_divisions`, `data_sections`, `program_calls`, `copybook_inclusions`, `file_accesses`, `db2_accesses`, `ingestion_logs`

### Tablas nuevas (generación de contenido)
| Tabla | Contenido |
|-------|-----------|
| `content_generation_status` | Tabla de control central. Un registro por programa × tipo de contenido. Estados: `pending`, `in_progress`, `completed`, `stale`, `error` |
| `technical_docs` | Documentación técnica generada por programa |
| `functional_docs` | Documentación funcional (por programa y por sistema) |
| `quality_audits` | Auditoría de calidad por programa |
| `use_cases` | Casos de uso por programa |
| `test_cases` | Casos de prueba por programa |
| `onboarding_chapters` | Capítulos HTML del material de onboarding interactivo |

---

## Patrón de cada workflow de generación

Todos los workflows de generación siguen el mismo patrón interno:

```
Webhook (POST con program_name)
  → Consultar content_generation_status
      → SI existe y está "completed" y vigente: retornar contenido existente
      → NO (pending/stale/error): generar con LLM
          → Guardar en tabla correspondiente
          → Actualizar content_generation_status a "completed"
          → Retornar contenido generado
```

---

## Decisiones de diseño importantes

1. **Los workflows se disparan manualmente desde el frontend** — no hay automatización automática. El usuario decide cuándo generar qué.

2. **El BOT de chat es independiente** — genera respuestas online desde Qdrant + PostgreSQL. No usa las tablas de contenido pre-generado.

3. **Init Content Status es separado de la ingesta** — para no tocar lo que funciona. Se puede llamar de forma independiente. Si en el futuro se quiere encadenar tras la ingesta, agregar un HTTP Request al final del workflow de ingesta apuntando a `POST /webhook/ia4sdlc-init-content-status` con `{ mode: "single", program_name: "..." }`.

4. **Todo el contenido se genera en español.**

5. **Onboarding**: el HTML es renderizado por el frontend. El contenido está en `onboarding_chapters`. No hay tracking de progreso implementado (fue simplificado). Los tests son opcionales y todo está desbloqueado.

---

## Fases de construcción (referencia)

- **Fase 1 (infraestructura)**: Init Content Status + Content Status API — COMPLETA
- **Fase 2 (análisis)**: Quality Audit + Impact Analysis en BOT — Quality Audit COMPLETO
- **Fase 3 (docs por programa)**: Technical Doc + Use Cases + Test Cases + Functional Doc — Technical Doc y Use Cases COMPLETOS
- **Fase 4 (sistema)**: Functional Doc sistema + Onboarding — Onboarding COMPLETO
- **Pendiente**: Test Cases, Functional Doc (funcional por sistema/grupo)

---

## Convenciones y preferencias del usuario

- Diseñar y acordar antes de construir.
- Workflows nuevos en lugar de modificar los existentes.
- Iterativo: fase por fase, validar antes de seguir.
- Respuestas directas, sin preámbulos.
- Diseño previo con tablas y diagramas cuando aplica.
