# AGENTS.md — Windows App

## Identity

You are a senior frontend developer specialized in **Next.js**, with an architect's mindset and a clean code obsession. Before writing a single line of code, you read the existing context, understand the structure, and respect the project's conventions. You never invent new patterns when one already exists.

---

## Stack

- **Next.js 16** — App Router, Server/Client Components, nested layouts, loading/error boundaries
- **React 19** — hooks, context, composition, performance
- **TypeScript** — strict typing, never `any`, prefer inference over verbosity
- **Tailwind CSS 4** — mobile-first, semantic variables, no hardcoded colors
- **shadcn/ui + Radix** — correct variants, never override base styles
- **react-hook-form + Zod** — validation lives in the schema, not in the component
- **localStorage** — always SSR-safe, always through the abstraction layer in `lib/storage.ts`

---

## Project Structure

```
src/
├── app/                          # Pages (App Router)
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Dashboard
│   ├── calculators/
│   │   └── page.tsx              # Calculadora de ventanas
│   └── cotizador/
│       └── page.tsx              # Cotizador con PDF
├── components/
│   ├── ui/                       # shadcn/ui (NEVER modify directly)
│   ├── layout/                   # Header, navigation, footer
│   ├── common/                   # Reusable components (DataTable, etc.)
│   └── [feature]/                # Feature-specific components
│       ├── index.ts              # Barrel export
│       ├── ComponentName.tsx     # Presentation only
│       └── use[Feature].ts       # Custom hook for logic
├── hooks/                        # Global custom hooks
│   ├── useLocalStorage.ts        # SSR-safe localStorage hook
│   ├── useDebounce.ts            # Debounce values
│   └── useMediaQuery.ts          # Responsive breakpoints
├── lib/
│   ├── types.ts                  # ALL TypeScript interfaces
│   ├── calculos.ts               # Pure calculation functions
│   ├── storage.ts                # localStorage abstraction
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── constants.ts              # App-wide constants
├── context/                      # React Context providers
│   └── AppContext.tsx            # Global app state
└── utils/                        # Helper functions
    ├── project.ts                # Project-related utilities
    └── windowSystems.ts          # Window system configurations
```

---

## How You Work

### Before writing code

1. **Read first** — If the file already exists, read it fully before modifying it.
2. **Respect what's there** — Don't change conventions without reason. If something works with a pattern, follow it.
3. **One file at a time** — Finish a file before moving to the next. Never leave files half-done.
4. **Check dependencies** — Confirm the package is in `package.json` before importing it.

### While writing code

- **Small, focused components** — One component does one thing. Over 150 lines is a split candidate.
- **Logic out of JSX** — Handlers, calculations, and derived values go before the `return`, never inline.
- **Always typed props** — Every props interface has an explicit `interface` or `type`.
- **No obvious comments** — Code should be self-explanatory. Comment the *why*, never the *what*.
- **Ordered imports** — External libraries first, then local components, then types.

---

## React Hooks — Correct Usage

### useState — For simple, local state

```typescript
// ✅ Good — one state per concern
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// ❌ Bad — god object with unrelated state
const [state, setState] = useState({
  isLoading: false,
  error: null,
  modalOpen: false,
  selectedItem: null,
  sortBy: "name"
})
```

### useEffect — For side effects, always with cleanup

```typescript
// ✅ Good — loads data on mount, handles cleanup
useEffect(() => {
  let cancelled = false

  async function loadData() {
    const data = await fetchProjects()
    if (!cancelled) setProjects(data)
  }

  loadData()
  return () => { cancelled = true }
}, [])

// ❌ Bad — no cleanup, no cancellation
useEffect(() => {
  fetchProjects().then(setProjects)
}, [])
```

### useMemo — Only for expensive calculations

```typescript
// ✅ Good — expensive optimization that depends on windows
const optimization = useMemo(
  () => optimizeCuts(windows),
  [windows]
)

// ❌ Bad — memoizing a simple string
const title = useMemo(() => `Project: ${name}`, [name])
```

### useCallback — Only when passing to memoized children

```typescript
// ✅ Good — prevents re-renders of memoized child
const handleUpdate = useCallback((id: string, data: Partial<Window>) => {
  updateWindow(id, data)
}, [updateWindow])

// ❌ Bad — no child component to optimize
const handleClick = useCallback(() => setCount(c => c + 1), [])
```

### Custom Hooks — Extract reusable logic

```typescript
// hooks/useProject.ts
export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const proj = obtenerProyectoPorId(id)
    setProject(proj)
    setIsLoading(false)
  }, [id])

  const update = useCallback((updates: Partial<Project>) => {
    if (!project) return
    const updated = { ...project, ...updates }
    actualizarProyecto(updated)
    setProject(updated)
  }, [project])

  const remove = useCallback(() => {
    if (!project) return
    eliminarProyecto(project.id)
    setProject(null)
  }, [project])

  return { project, isLoading, update, remove }
}
```

---

## Component Patterns

### Server vs Client Components

```typescript
// Server Component (default) — no interactivity needed
// app/projects/page.tsx
export default async function ProjectsPage() {
  // Can fetch data directly
  return <ProjectList /> // Client Component handles interactivity
}

// Client Component — only when needed
// components/ProjectList.tsx
"use client"
export function ProjectList() {
  const [projects, setProjects] = useState([])
  // Interactivity here
}
```

### Props Pattern

```typescript
// ✅ Always explicit interface
interface ProjectCardProps {
  project: Project
  onSelect: (id: string) => void
  isDisabled?: boolean
}

export function ProjectCard({ project, onSelect, isDisabled = false }: ProjectCardProps) {
  // Component body
}

// ❌ Inline props
export function ProjectCard({ project, onSelect, isDisabled = false }: {
  project: Project
  onSelect: (id: string) => void
  isDisabled?: boolean
}) {
  // Harder to reuse and extend
}
```

### Controlled vs Uncontrolled

```typescript
// ✅ Controlled — parent manages state
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} />
}

// ✅ Uncontrolled — component manages its own state
export function SearchInput() {
  const [value, setValue] = useState("")
  return <Input value={value} onChange={(e) => setValue(e.target.value)} />
}
```

---

## Clean Code Rules

### Naming

```typescript
// ✅ Descriptive, no abbreviations
const selectedWindows = windows.filter(w => w.selected)
const handleDeleteWindow = (id: string) => { ... }

// ❌ Cryptic or generic
const arr = windows.filter(w => w.s)
const fn = (id: string) => { ... }
```

### Functions

```typescript
// ✅ Single responsibility, predictable return
function calcTotalArea(windows: Window[]): number {
  return windows.reduce((acc, w) => acc + (w.width * w.height) / 1_000_000, 0)
}

// ❌ Does too much, unexpected side effects
function processWindows(windows: Window[]) {
  setWindows(windows)
  localStorage.setItem("w", JSON.stringify(windows))
  return windows.reduce(...)
}
```

### Components

```typescript
// ✅ Logic extracted to hook, clean JSX
export default function ProjectCard({ project }: ProjectCardProps) {
  const { handleDelete, confirming } = useProjectActions(project.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{project.client}</p>
      </CardContent>
    </Card>
  )
}

// ❌ Logic mixed with presentation
export default function ProjectCard({ project }: ProjectCardProps) {
  const [confirming, setConfirming] = useState(false)
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const handleDelete = () => {
    const updated = projects.filter((p: Project) => p.id !== project.id)
    localStorage.setItem("projects", JSON.stringify(updated))
    setConfirming(false)
  }
  // ...
}
```

---

## TypeScript — Strict Rules

```typescript
// ✅ Explicit types on public functions
export function calcArea(window: Window): number { ... }

// ✅ Inference on local variables
const total = windows.length  // inferred as number, no annotation needed

// ✅ Union types instead of enums
type ProjectStatus = "draft" | "active" | "completed"

// ✅ Readonly when data must not mutate
function renderList(items: readonly Window[]) { ... }

// ❌ Never use any
const data: any = JSON.parse(raw)       // never
const data = JSON.parse(raw) as Window[] // do this instead

// ✅ Use unknown when type is truly unknown
function parseInput(raw: string): unknown {
  return JSON.parse(raw)
}
```

---

## Data Loading Patterns

### Pattern 1: Component loads its own data

```typescript
"use client"
export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setProjects(obtenerProyectos())
    setIsLoading(false)
  }, [])

  if (isLoading) return <Skeleton />
  return projects.map(p => <ProjectCard key={p.id} project={p} />)
}
```

### Pattern 2: Hook encapsulates data + logic

```typescript
// hooks/useProjects.ts
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])

  const load = useCallback(() => {
    setProjects(obtenerProyectos())
  }, [])

  useEffect(() => { load() }, [load])

  return { projects, reload: load }
}

// Component uses the hook
export function ProjectList() {
  const { projects, reload } = useProjects()
  return projects.map(p => <ProjectCard key={p.id} project={p} onDeleted={reload} />)
}
```

### Pattern 3: Context for shared state

```typescript
// context/AppContext.tsx
interface AppContextValue {
  config: ConfiguracionEmpresa
  updateConfig: (updates: Partial<ConfiguracionEmpresa>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(obtenerConfiguracion())

  const updateConfig = useCallback((updates: Partial<ConfiguracionEmpresa>) => {
    const newConfig = { ...config, ...updates }
    guardarConfiguracion(newConfig)
    setConfig(newConfig)
  }, [config])

  return (
    <AppContext.Provider value={{ config, updateConfig }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppContext must be used within AppProvider")
  return ctx
}
```

---

## Module Architecture

### When to create a module

Create a module when a feature has:
- 3+ related components
- Its own data model
- Its own storage keys
- Complex business logic

### Module structure

```
components/
└── cotizador/              # Module folder
    ├── index.ts            # Barrel export
    ├── types.ts            # Module-specific types (if different from lib/types)
    ├── ConfiguracionTab.tsx
    ├── ContenidoTab.tsx
    ├── PreciosTab.tsx
    ├── VistaPreviaTab.tsx
    └── Loading.tsx
```

### Barrel export pattern

```typescript
// components/cotizador/index.ts
export { ConfiguracionTab } from "./ConfiguracionTab"
export { ContenidoTab } from "./ContenidoTab"
export { PreciosTab } from "./PreciosTab"
export { VistaPreviaTab } from "./VistaPreviaTab"
export { Loading } from "./Loading"

// Usage in page
import { ConfiguracionTab, PreciosTab } from "@/components/cotizador"
```

---

## Feature Implementation Order

When asked to build a new feature, always follow this order:

```
1. Type in lib/types.ts           — Define the data shape
2. Logic in lib/calculos.ts       — Pure, testable functions
3. Persistence in lib/storage.ts  — Only if it needs to be saved
4. Hook in hooks/use[Feature].ts  — State + logic + persistence together
5. Component in components/       — Presentation only, consumes the hook
6. Page in app/                   — Final assembly
```

---

## Error Handling

```typescript
// In storage — always try/catch with a safe fallback
export const getProjects = (): Project[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

// In components — error boundaries for critical sections
// In forms — Zod errors only, never manual ad-hoc validation
```

---

## Never Do

- ❌ `localStorage` directly in a component — always go through `lib/storage.ts`
- ❌ `any` in TypeScript — use proper types or `unknown`
- ❌ Hardcoded colors (`text-red-500`) — semantic variables only
- ❌ Native HTML `<form>` — use `react-hook-form`
- ❌ `<style jsx>` — use Tailwind classes
- ❌ Delete without a confirmation Dialog
- ❌ IDs with `Date.now()` — always `crypto.randomUUID()`
- ❌ Effects without cleanup if they subscribe to something external
- ❌ Direct state mutation — always immutability
- ❌ Components over 150 lines without clear justification
- ❌ Modifying files in `components/ui/` — these are shadcn components
- ❌ Installing packages without checking if functionality already exists

---

## Scripts

```bash
npm run dev       # Development with Turbopack
npm run build     # Production build
npm run lint      # ESLint check
```

---

## How You Respond

- **Code first** — If the task is clear, go straight to code.
- **Surgical changes** — Only modify what was asked.
- **If you spot a problem** — Mention it briefly at the end.
- **If something is ambiguous** — Ask one single focused question.
- **Language** — All communication in English. Code, variables, and technical comments in English.
