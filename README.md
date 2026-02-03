# Markwater Decode

**SPA de Identificación de Personas mediante Codificación Simbólica**

Este proyecto es una aplicación de una sola página (SPA) desarrollada con Vue 3, diseñada para asistir en la identificación de personas a partir de marcas de agua simbólicas. Actúa como una herramienta crítica de análisis y verificación en entornos productivos, permitiendo decodificar secuencias de símbolos en identificadores únicos (`idPersona`) y viceversa.

---

## 🏗 Arquitectura y Diseño

El proyecto sigue una arquitectura modular basada en componentes y el patrón de gestión de estado centralizado (Store Pattern), con un fuerte énfasis en los principios **SOLID** y **Clean Code**.

### Decisiones Arquitectónicas Clave

1.  **Separación de Responsabilidades (SRP)**:
    - **Vista (Components)**: Responsable únicamente de la presentación y la captura de eventos de usuario. No contiene lógica de negocio compleja.
    - **Estado (Stores)**: Gestiona la lógica de negocio, el estado de la aplicación y la comunicación con servicios externos. Ejemplo: `candidates.ts` maneja la generación y filtrado de candidatos.
    - **Utilidades Puras (Utils)**: Lógica algorítmica aislada, libre de efectos secundarios y dependencias de UI. Ejemplo: `border.ts` calcula geometría pura, `wildcard.ts` maneja la expansión de combinaciones.

2.  **Clean Code**:
    - **Nombres Descriptivos**: Se prohíbe el uso de variables de una sola letra (excepto en contextos matemáticos estándar muy acotados). Todo nombre debe revelar su intención (ej. `candidate` en lugar de `c`, `symbolIndex` en lugar de `i`).
    - **Funciones Pequeñas**: Las funciones hacen una sola cosa y la hacen bien.

3.  **Modularidad**:
    - Los componentes están organizados por dominio (`candidates`, `input`, `common`).
    - El código es altamente reutilizable y testable.

4.  **Patrón Store vs Composable (Data Layer vs View Layer)**:
    - **Global Data (Store)**: Se usa Pinia (`stores/`) para datos que deben persistir o compartirse globalmente. _Ejemplo_: La lista maestra de candidatos y las acciones de borrado permanente.
    - **Local State Logic (Composable)**: Se usa Composables (`composables/`) para lógica de estado compleja pero específica de una vista o UI.
      - _Caso de Estudio_: `useCandidateFilter`. Contiene la lógica de filtrado visual (qué ver) y el estado de los filtros (qué botones están activos).
      - **¿Por qué?**: Si moviéramos la lógica de filtrado visual (`selectedFilters`) al Store, estaríamos contaminando el estado global con detalles específicos de una vista. Si mañana quisieras tener dos listas de candidatos en la misma pantalla filtradas de forma distinta, no podrías hacerlo si el filtro fuera global. Al usar un composable, cada componente puede tener su propio estado de filtrado independiente.

---

## 🛠 Stack Tecnológico

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estricto)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Framework**: [Quasar](https://quasar.dev/)
- **Gestión de Estado**: [Pinia](https://pinia.vuejs.org/)
- **Internacionalización**: [Vue I18n](https://kazupon.github.io/vue-i18n/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linter**: ESLint + Prettier

---

## 📂 Estructura del Proyecto

```
src/
├── App.vue                # Componente raíz de la aplicación Vue
├── main.ts                # Punto de entrada de la aplicación
├── assets/                # Recursos estáticos (imágenes, fuentes, SVG)
├── components/            # Componentes Vue organizados por dominio/feature
│   ├── candidates/        # Componentes para la gestión de candidatos (Lista, Ítem, Detalle)
│   ├── common/            # Componentes genéricos y reutilizables (Selectores, etc.)
│   ├── input/             # Componentes especializados en entrada de datos (Formularios)
│   └── symbolic/          # Componentes para la representación visual de símbolos y bordes
├── composables/           # Lógica de estado reactiva reutilizable (Hooks de Vue)
├── constants/             # Constantes centralizadas de la aplicación (Estados, Configuraciones)
├── i18n/                  # Configuración y archivos de internacionalización (es, en, pt)
│   ├── en/
│   ├── es/
│   └── pt/
├── layouts/               # Componentes de diseño principal (Layouts)
├── pages/                 # Componentes de página/pantalla (Vistas de enrutador)
├── router/                # Configuración del enrutador de Vue Router
├── services/              # CAPA DE SERVICIOS: Lógica de integración con APIs externas
│                          # (Actualmente vacío - destinado a los servicios de API)
├── stores/                # Stores de Pinia para la gestión del estado global
├── styles/                # Estilos globales y variables (ej. temas Quasar)
├── types/                 # Definiciones de tipos e interfaces de TypeScript
└── utils/                 # Funciones puras y lógica algorítmica de utilidad
    ├── border.ts          # Cálculos geométricos y parsing para bordes simbólicos
    ├── decoding.ts        # Lógica de decodificación (Símbolos -> ID)
    ├── encoding.ts        # Lógica de codificación (ID -> Símbolos)
    ├── symbols.ts         # Configuración y constantes del set de símbolos
    ├── validation.ts      # Reglas de validación de entrada
    └── wildcard.ts        # Algoritmo de expansión de comodines ('?')
```

---

## 🚀 Guía para Desarrolladores

### Prerrequisitos

- Node.js (v24+ recomendado)
- npm o yarn

### Instalación

```bash
npm install
```

### Ejecución en Desarrollo

Inicia el servidor de desarrollo con recarga en caliente (HMR):

```bash
npm run dev
```

### Compilación para Producción

Genera los archivos optimizados en `dist/`:

```bash
npm run build
```

### Testing y Calidad

Ejecutar tests unitarios:

```bash
npm run test:unit
```

Analizar y corregir estilo de código:

```bash
npm run lint
```

---

## 📏 Estándares de Codificación

Para mantener la calidad del proyecto, todo desarrollador debe adherirse a las siguientes reglas, forzadas mediante ESLint y Code Reviews:

1.  **Nombres Expresivos**:
    - ❌ Incorrecto: `const a = fn(x)`
    - ✅ Correcto: `const candidate = findCandidate(idPersona)`
2.  **Tipado Estricto**:
    - No usar `any` salvo casos de fuerza mayor justificados.
    - Definir interfaces para todas las estructuras de datos en `src/shared/types`.    

3.  **Principio de Responsabilidad Única (SRP)**:
    - Si un componente tiene lógica compleja de cálculo, muévela a un `util` o `composable`.
    - Si un componente maneja estado global complejo, usa el `store`.
4.  **Comentarios**:
    - El código debe ser auto-documentado. Usar comentarios solo para explicar el "POR QUÉ", no el "QUÉ".
    - Usar JSDoc para funciones utilitarias complejas.

---

## 🧩 Conceptos Clave del Dominio

### IdPersona

El identificador único (entero positivo). Es la fuente de la verdad.

### Secuencia Simbólica

Representación visual del `IdPersona`. Se genera mediante una conversión de base numérica utilizando un set predefinido de símbolos.

### Comodines (`?`)

Caracteres especiales que permiten buscar candidatos cuando un símbolo es ilegible. El sistema expande estos comodines generando todas las combinaciones posibles.

### Candidato

Una posible identidad válida derivada de una secuencia (manual o expandida). Contiene el `IdPersona`, la secuencia y el estado de validación.

---

## 🧪 Testing

El proyecto utiliza **Vitest** para pruebas unitarias. Los tests deben cubrir:

- Funciones de utilidad (`utils/`) para asegurar la corrección matemática de la codificación/decodificación.
- Lógica de los Stores (`stores/`) para verificar la gestión de estado.
- Validaciones críticas.

---

_Documentación generada para facilitar el onboarding y mantenimiento a largo plazo._
