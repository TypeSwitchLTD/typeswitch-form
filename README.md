# TypeSwitch Survey Form

Multilingual typing survey app (React + Vite + TypeScript + Supabase).
The app runs a demographics questionnaire, an optional typing challenge
(Hebrew/Arabic/Russian + English), shows a scored results report, and
saves responses to Supabase.

## Structure

```
project/
  src/
    App.tsx                  # Screen flow, state, save orchestration
    types.ts                 # Shared type definitions
    components/              # One component per survey screen
      TypingExercise.tsx     # Typing test + metrics (alignment-based error detection)
      ResultsReport.tsx      # Score report shown to the user
      ...
    lib/
      scoring.ts             # SINGLE SOURCE OF TRUTH for the overall score
      supabase.ts            # Persistence (uses lib/scoring for overall_score)
      translations.ts        # EN + HE UI strings
      deviceTracking.ts      # Fingerprint / duplicate-submission detection
```

## Commands

```bash
cd project
npm install
npm run dev        # local dev server
npx tsc -b         # typecheck (vite build does NOT typecheck!)
npm run build      # production build to dist/
```

## Rules

- Never duplicate the scoring logic — import from `src/lib/scoring.ts`.
  The score saved to Supabase must always match the score shown on screen.
- `npm run build` passing does not mean the types are fine; run `npx tsc -b`.
