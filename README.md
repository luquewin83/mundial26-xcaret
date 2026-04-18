# Mundial 2026 · Xcaret Gamification App

Web app mobile-first de gamificación para huéspedes del Resort Xcaret durante el Mundial 2026.

**Stack:** React + Vite + Tailwind CSS + Zustand + Supabase · Deploy en Vercel

---

## Requisitos previos

- Node.js 18+
- Cuenta en [supabase.com](https://supabase.com) (gratis)
- Cuenta en [vercel.com](https://vercel.com) (gratis)

---

## 1 · Crear proyecto en Supabase

1. Ve a [app.supabase.com](https://app.supabase.com) → **New project**
2. Elige un nombre (ej. `mundial26-xcaret`), región **US East** y contraseña segura
3. Espera ~2 min a que el proyecto arranque

---

## 2 · Ejecutar el schema SQL

1. En tu proyecto Supabase → **SQL Editor** → **New query**
2. Copia todo el contenido de [`schema.sql`](./schema.sql) y pégalo
3. Pulsa **Run** (▶)

Esto crea todas las tablas, índices, el trigger de puntos, las políticas RLS
y los **48 partidos de fase de grupos** más las ofertas flash del partido demo.

> El partido **México vs Portugal (Grupo C · 18 Jun 2026 20:00h CDT)** se inserta
> con `status = 'live'`, `home_score = 1`, `away_score = 0`, `minute = 67`
> para que puedas probar la vista **DURANTE** directamente.

---

## 3 · Obtener las variables de entorno

1. En Supabase → **Project Settings** → **API**
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

---

## 4 · Configurar el proyecto local

```bash
# Clona / entra al directorio
cd "Mundial26"

# Crea el archivo .env
cp .env.example .env
```

Edita `.env` con tus valores reales:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 5 · Instalar dependencias y arrancar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu teléfono o navegador.
La app es **mobile-first** — usa DevTools en modo 390×844 para la mejor vista.

---

## 6 · Deploy en Vercel

### Opción A — Vercel CLI

```bash
npx vercel --prod
```

Cuando te pida variables de entorno, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### Opción B — GitHub + Vercel Dashboard

1. Sube el proyecto a un repositorio de GitHub
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo
3. En **Environment Variables** agrega las dos vars de Supabase
4. **Deploy** — Vercel detecta Vite automáticamente

El archivo `vercel.json` ya incluye el rewrite para SPA routing.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── Header.jsx          # Barra superior con nombre del huésped
│   ├── PhaseNav.jsx        # Tabs Antes / Durante / Después
│   ├── RegisterScreen.jsx  # Registro inicial (nombre + habitación)
│   └── MatchSelector.jsx   # Lista de partidos para seleccionar
├── pages/
│   ├── AntesPage.jsx       # Cuenta regresiva + predicción
│   ├── DurantePage.jsx     # Marcador live + ofertas + ranking + momentos
│   └── DespuesPage.jsx     # Resultado + podio + valoración + próximo partido
├── store/
│   └── useStore.js         # Estado global (Zustand + persist)
├── hooks/
│   ├── useTimer.js         # Cuenta regresiva a kick_off
│   ├── useMatch.js         # Marcador en tiempo real (Supabase realtime)
│   └── useRanking.js       # Ranking en tiempo real (Supabase realtime)
└── lib/
    └── supabase.js         # Cliente Supabase
```

---

## Lógica de puntos

| Acierto | Puntos |
|---|---|
| Ganador correcto | 100 pts |
| Marcador final exacto | +200 pts |
| Marcador de descanso exacto | +50 pts |
| **Máximo por partido** | **350 pts** |

Los puntos se calculan automáticamente mediante un **trigger PostgreSQL**
(`trg_match_finished`) que se dispara cuando el `status` de un partido
cambia a `'finished'`.

---

## Simular un partido en vivo (demo)

Desde el **SQL Editor** de Supabase puedes actualizar el marcador del partido demo:

```sql
-- Actualizar minuto y marcador
UPDATE matches
SET home_score = 2, away_score = 1, minute = 78
WHERE home_team = 'México' AND away_team = 'Portugal';

-- Finalizar el partido y disparar el cálculo de puntos
UPDATE matches
SET status = 'finished', home_score = 2, away_score = 1, minute = 90,
    home_score_ht = 1, away_score_ht = 0
WHERE home_team = 'México' AND away_team = 'Portugal';
```

Los clientes conectados verán los cambios en tiempo real gracias a
las **Supabase Realtime subscriptions**.

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |

---

## Próximas mejoras sugeridas

- [ ] Supabase Auth con magic link para identificar huéspedes de forma segura
- [ ] Panel de administración para actualizar marcadores en tiempo real
- [ ] Push notifications cuando empiece el partido seleccionado
- [ ] Fase eliminatoria con bracket interactivo
- [ ] Integración con PMS del resort para verificar habitaciones
