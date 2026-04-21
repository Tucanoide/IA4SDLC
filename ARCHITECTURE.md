# Arquitectura del Frontend: Dashboard Análisis COBOL

## Descripción General
Este proyecto es una Prueba de Concepto (POC) construida sobre Next.js (App Router) diseñada para visualizar y explotar información técnica extraída de sistemas COBOL legacy mediante pipelines de n8n almacenados en Qdrant/PostgreSQL.

## Estructura de Directorios (Next.js App Router)
```text
dashboard-frontend/
├── .antigravity/       # Archivos de control para Agentes IA
│   └── LEARNINGS.md    # Registro de problemas crónicos y soluciones
├── docs/               # Documentación técnica
│   └── stack-setup.md  # Instrucciones de setup e integraciones clave
├── src/
│   ├── app/            # Next.js App Router (Páginas, Rutas y Layouts)
│   │   ├── api/        # Rutas de API para consumos indirectos/webhooks
│   │   ├── (dashboard)/# Grupo de rutas para vistas principales
│   │   ├── layout.tsx  # Layout principal (Sidebar, Nav)
│   │   └── page.tsx    # Dashboard principal de entrada
│   ├── components/     # Componentes visuales puros y reusables
│   │   ├── ui/         # Componentes base (ej. Buttons, Inputs, Cards)
│   │   └── dashboard/  # Componentes de negocio (ej. Gauges, Charts)
│   ├── lib/            # Utilidades generales y configuración de clientes
│   │   └── prisma.ts   # Singleton de PrismaClient (Obligatorio)
│   └── actions/        # Server Actions exclusivas para el frontend
└── public/             # Assets estáticos
```

## Do's & Don'ts de la Arquitectura (Hostinger Limitations)

### Do:
1. **Server Components First:** Toda obtención de datos desde PostgreSQL/Prisma debe ocurrir en el backend usando componentes de servidor de React.
2. **Usa `unstable_cache`:** Los datos de la auditoría (cantidad de programas, estadísticas) rara vez cambian en vivo; deben cachearse con tiempos altos (ej. 3600s).
3. **Prisma Singleton:** Obligatoriamente, importa `PrismaClient` desde `src/lib/prisma.ts`. No lo instancies localmente para no reventar el connection pool.
4. **Resguardar Metadatos:** Al enviar datos por Server Actions, asegurar que estén aplanados/serializados correctamente.

### Don't:
1. **Don't use `use client` injustificadamente:** Si el componente no tiene hooks (`useState`, `useEffect`) o eventos manejados directamente, debe ser del lado del servidor.
2. **Evitar I/O Bloqueante:** No uses operaciones tipo `fs.appendFileSync` que atoran el thread ante los lÍmites estrictos de 200 procesos en Hostinger.
3. **No habilitar Debug mode de NextAuth/Prisma en PROD:** El logeo excesivo suma procesos inútiles.

## Conexiones, Bases de Datos y Modelo de n8n
El proyecto actúa como una fina capa de presentación. La lógica dura (análisis, documentación, parsing) recae sobre Agentes de Inteligencia Artificial que corren en n8n.

**El Flujo de N8n (Operaciones Pesadas):**
1. **Frontend Request:** El usuario inicia una ejecución (ej: "Generar Doc Funcional").
2. **Server Action:** Next.js crea un registro de control en PostgreSQL con estado `PENDING` (ej: `Job_ID`) y llama asincrónicamente al Webhook de n8n disparando el agente.
3. **Espera Reactiva:** El frontend consulta periódicamente la BD en modo consulta (Polling) o Server-Sent Events hasta que el estado del registro cambie a `DONE` o `ERROR`.
4. **Respuesta n8n:** El workflow de n8n inserta el resultado (Markdown, JSON) en Qdrant o PostgreSQL modficando el estado, momento en el cual el frontend lo levanta y lo renderiza.
