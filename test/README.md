# 🧪 Estrategia de Testing - Markwater Decode

Este directorio contiene todas las pruebas automatizadas del proyecto, diseñadas para garantizar la fiabilidad de la identificación simbólica y la estabilidad de la aplicación a largo plazo.

El proyecto utiliza **Vitest** como runner principal debido a su compatibilidad nativa con Vite, velocidad y soporte para TypeScript.

---

## 📂 Organización de las Pruebas

La estructura de tests refleja la arquitectura del código fuente para facilitar la navegación:

```
test/
├── unit/                  # Pruebas Unitarias (Lógica pura y aislada)
│   ├── utils/             # Algorithms críticos (codificación, comodines)
│   └── composables/       # Lógica reactiva y hooks
├── component/             # Pruebas de Componentes (Vue Test Utils)
│   └── HorizontalSymbols  # Validaciones de renderizado visual
└── integration/           # Pruebas de Integración (Flujos completos - Planeado)
```

---

## ✅ Pruebas Implementadas y su Relevancia

### 1. Pruebas Unitarias de Utilidades (`test/unit/utils/`)

Estas son las pruebas más críticas del sistema, ya que validan el núcleo matemático y lógico. Cero tolerancia a fallos aquí.

- **`encoding.test.ts` / `decoding.test.ts`**:
  - **Objetivo**: Verificar que la conversión `IdPersona` $\leftrightarrow$ `Secuencia Simbólica` sea matemáticamente exacta y reversible.
  - **Relevancia**: Un error aquí significaría identificar incorrectamente a una persona. Es la base de todo el negocio.
- **`wildcard.test.ts`**:
  - **Objetivo**: Validar el algoritmo de expansión combinatoria de comodines (`?`).
  - **Relevancia**: Asegura que el sistema genere **todos** los candidatos posibles sin omitir ninguno y sin generar duplicados inválidos.
- **`border.test.ts`**:
  - **Objetivo**: Testear la geometría pura y el parsing de estilos CSS desacoplado del DOM.
  - **Relevancia**: Garantiza que los cálculos para dibujar el borde SVG sean correctos antes de intentar renderizarlos.

### 2. Pruebas Unitarias de Composables (`test/unit/composables/`)

- **`useSymbolicBorderRenderer.test.ts`**:
  - **Objetivo**: Verificar que el hook maneje correctamente las opciones de configuración y manipulación del DOM (en un entorno simulado con jsdom).
  - **Relevancia**: Valida la interacción lógica de la capa de presentación.

### 3. Pruebas de Componentes (`test/component/`)

- **`HorizontalSymbols.test.ts`**:
  - **Objetivo**: Asegurar que el componente visualice correctamente la secuencia dada y reaccione a cambios de props.
  - **Relevancia**: Garantiza que el operador vea exactamente lo que el sistema internamente procesó.

---

## 📈 Verificación de Cobertura

Para analizar qué porcentaje del código está cubierto por las pruebas, ejecuta:

```bash
npm run test:unit
```

El comando está configurado (vía `vitest --coverage`) para generar un reporte en consola mostrando:

- **% Statements**: Sentencias ejecutadas.
- **% Branches**: Ramas de decisión (if/else) recorridas.
- **% Functions**: Funciones llamadas.
- **% Lines**: Líneas de código tocadas.

### Objetivos de Cobertura

- **Utils**: **100%**. No deben quedar caminos sin probar en la lógica algorítmica.
- **Stores**: **>90%**. El estado global debe ser predecible.
- **Componentes**: **>80%**. Enfocarse en la lógica de interacción y renderizado condicional, no en estilos triviales.

---

## 🆕 Guía para Añadir Nuevas Pruebas

Al desarrollar nuevas funcionalidades, sigue este proceso:

1.  **Identifica el Tipo**:
    - ¿Es lógica pura (matemáticas, transformación de datos)? $\rightarrow$ **Unit Test (`unit/utils`)**.
    - ¿Es lógica de estado o reacción? $\rightarrow$ **Composable/Store Test (`unit/`)**.
    - ¿Es visual o interacción de UI? $\rightarrow$ **Component Test (`component/`)**.

2.  **Crea el Archivo**:
    Usa la convención `NombreDelArchivo.test.ts` junto al código original o en la carpeta espejo dentro de `test/`.

3.  **Estructura del Test (Patrón AAA)**:
    - **Arrange (Preparar)**: Configura las variables e inputs.
    - **Act (Actuar)**: Ejecuta la función o monta el componente.
    - **Assert (Afirmar)**: Verifica que el resultado sea el esperado (usando `expect`).

4.  **Principios a Respetar**:
    - **Independencia**: Ningún test debe depender del resultado de otro.
    - **Determinismo**: El test debe dar siempre el mismo resultado con los mismos inputs.
    - **Rapidez**: Los tests unitarios deben correr en milisegundos.

### Ejemplo de Test Unitario

```typescript
import { expandWildcards } from "@domain/utils/wildcard";

describe("Wildcard Expansion", () => {
  it("should generate 3 candidates for a single wildcard with 3 symbols", () => {
    // Arrange
    const sequence = "A?";
    const symbols = ["1", "2", "3"];

    // Act
    const result = expandWildcards(sequence, symbols);

    // Assert
    expect(result).toHaveLength(3);
    expect(result).toContain("A1");
  });
});
```

---

## 🎯 Cómo Alcanzar los Objetivos

1.  **TDD (Test Driven Development)**: Intenta escribir el test (o al menos definir los casos de uso) antes de escribir la lógica compleja.
2.  **Refactorización Segura**: Si refactorizas código (como hicimos con SOLID), corre los tests continuamente. Si pasan, tu refactorización no rompió nada.
3.  **Revisión de Cobertura**: Antes de dar por finalizada una tarea, corre el reporte de cobertura. Si añadiste un `if` nuevo, ¿hay un test que entre por ese `if`?

---

> "El código sin tests es código legado por definición."
