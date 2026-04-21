# Diseño Multi-Sistema (Multi-Tenant) para Entidades COBOL

## Problema Actual
El modelo `cobol_analysis.programs` asume un escenario mono-sistema (un solo conjunto de programas COBOL por instancia de base de datos). Esto se ve reflejado en su actual clave única `uq_program_name` enfocada exclusivamente en `program_name`. En un ambiente donde analizamos código de múltiples clientes o sistemas lógicos diferentes, esto causa conflictos (por ejemplo, múltiples sistemas pueden tener un programa llamado `LOGIN01C`).

## Solución: Arquitectura Multi-Sistema Jerárquica

El modelo de datos COBOL se anidará estructuralmente debajo del modelo existente `System` (que vive en el esquema `public`).

### 1. Cambios a la Tabla Base: `cobol_analysis.programs`

- **Añadir Columna:** `system_id` (UUID o Integer dependiendo de la resolución de la PK de System).
  `ALTER TABLE cobol_analysis.programs ADD COLUMN system_id UUID NOT NULL;`
- **Llave Foránea (FK):** Establecer la relación contra `public."System"(id)`.
  `ALTER TABLE cobol_analysis.programs ADD CONSTRAINT fk_program_system FOREIGN KEY (system_id) REFERENCES public."System" (id) ON DELETE CASCADE;`
- **Ajuste de Índices Únicos:** Eliminar `uq_program_name` y reemplazarlo por uno compuesto.
  `ALTER TABLE cobol_analysis.programs DROP CONSTRAINT uq_program_name;`
  `ALTER TABLE cobol_analysis.programs ADD CONSTRAINT uq_system_program_name UNIQUE (system_id, program_name);`

### 2. Cascadas y Subtablas (Hijas)

El esquema actual posee tablas hijas que representan el análisis particionado del programa (como AST o dependencias cross-functional):

1. **`cobol_analysis.program_divisions`**
2. **`cobol_analysis.program_versions`**
3. **`cobol_analysis.data_sections`**
4. **`cobol_analysis.program_calls`**
5. **`cobol_analysis.file_accesses`**
6. **`cobol_analysis.db2_accesses`**
7. **`cobol_analysis.copybook_inclusions`**

**Decisión Arquitectónica para las Hijas:**
No se necesita desnormalizar (añadir `system_id` a todas estas tablas) a menos que haya fuertes requerimientos de acceso asíncrono o particionamiento físico (Sharding). Con mantener la relación atada al `program_id`, la integridad de datos funciona y el borrado en cascada (ON DELETE CASCADE) desde el registro padre de `System` > `programs` automáticamente limpia todas las subtablas de dependencias cuando se purga un sistema completo.

*Excepción - Master Data Transversal:*
Si en algún punto entidades como `copybooks` o `db2_tables` se configuran de forma global (unidades reusables en todo un modelo organizativo), esas sí deberían llevar un `system_id` como catálogo propio, en una tabla `master_copybooks` a nivel sistema. Por el momento, asumiendo relaciones jerárquicas estrictas, heredar la granularidad mediante el padre `programs` es el diseño óptimo.

### 3. Impacto en el Modelo Prisma

El archivo `prisma/schema.prisma` necesitará reflejar estos cambios como un One-to-Many entre `System` y `models`:

```prisma
model System {
  id          String   @id @default(uuid())
  name        String
  ...
  programs    Program[] // Relación Multi-Tenant habilitada
}

model Program {
  id              Int       @id @default(autoincrement())
  systemId        String    @map("system_id") // El enlace
  programName     String    @map("program_name") @db.VarChar(100)
  ...
  
  system          System    @relation(fields: [systemId], references: [id], onDelete: Cascade)
  
  @@unique([systemId, programName], name: "uq_system_program_name")
  @@schema("cobol_analysis") // Dependiendo si tienes multi-esquema activo en Prisma
}
```

### 4. Directiva de Diseño y Regla Universal
Cualquier Job disparado hacia N8N (ya soportado en la tabla `Job` en Prisma) debe inevitablemente incluir su `system_id` en el Payload de la request webhook, para que N8N en sus inserts de Postgres también referencie correctamente el ambiente.
