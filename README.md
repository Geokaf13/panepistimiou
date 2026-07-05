# ΠΑΝΕΠΙΣΤΗΜΙΟΥ 065 — React/TSX version

Το ίδιο app (login, εισαγωγή παραγωγής, YTD, στόχοι, άδειες, υπερωρίες, ράλλυ καρτών)
σπασμένο σε ξεχωριστά αρχεία, ώστε να είναι εύκολο να κάνεις αλλαγές στο μέλλον.

## Πώς να το τρέξεις

```bash
npm install
npm run dev
```

Θα ανοίξει σε `http://localhost:5173`. Για production build: `npm run build`
(βγάζει static αρχεία στο `dist/`, που μπορείς να τα ανεβάσεις οπουδήποτε — Netlify,
Vercel, GitHub Pages, κ.λπ.).

## Πού να ψάξεις όταν θέλεις να αλλάξεις κάτι

| Θέλω να... | Πήγαινε στο αρχείο |
|---|---|
| Προσθέσω/αλλάξω κατηγορία παραγωγής | `src/config.ts` → `CATEGORIES` |
| Προσθέσω/αφαιρέσω εργαζόμενο ή αλλάξω PIN | `src/config.ts` → `EMPLOYEES`, `EMPLOYEE_PINS` |
| Αλλάξω τους στόχους του 2026 | `src/config.ts` → `TARGETS` |
| Αλλάξω το budget υπερωριών (160h) ή τον στόχο ράλλυ (30) | `src/config.ts` → `OT_BUDGET`, `RALLY_TARGET_APPROVALS` |
| Αλλάξω το PIN admin/περιφέρειας | `src/config.ts` → `ADMIN_PIN`, `REGIONAL_PIN` |
| Αλλάξω χρώματα/fonts/στυλ | `src/styles.css` (CSS variables στην κορυφή) |
| Πειράξω τη σελίδα εισαγωγής παραγωγής | `src/components/admin/EntryTab.tsx` |
| Πειράξω τη σελίδα YTD σύνοψης | `src/components/admin/YtdTab.tsx` |
| Πειράξω τις άδειες (χρησιμοποιείται και από admin και regional) | `src/components/shared/VacationsPanel.tsx` |
| Πειράξω τις υπερωρίες (admin + regional) | `src/components/shared/OvertimesPanel.tsx` |
| Πειράξω το ράλλυ καρτών (πλήρες, με edit) | `src/components/admin/RallyTab.tsx` |
| Πειράξω την προβολή εργαζομένου | `src/components/employee/EmployeeView.tsx` + υποαρχεία στο `employee/` |
| Πειράξω την προβολή περιφέρειας | `src/components/regional/RegionalView.tsx` |
| Αλλάξω τη σύνδεση με Supabase | `src/lib/supabaseClient.ts` |
| Βοηθητικές συναρτήσεις (ημερομηνίες, CSV export) | `src/lib/utils.ts` |

## Δομή φακέλων

```
src/
  config.ts                 # ΟΛΕΣ οι σταθερές: εργαζόμενοι, PIN, κατηγορίες, στόχοι
  types.ts                  # TypeScript types (Vacation, Overtime, RallyCard...)
  styles.css                # Το ίδιο design, σε ένα αρχείο
  App.tsx                   # Ενώνει login + τα 3 views ανά ρόλο
  main.tsx                  # React entry point

  lib/
    supabaseClient.ts        # Supabase client (1 μέρος, εύκολο να αλλάξεις URL/key)
    utils.ts                 # formatDate, countWorkdays, fmtHours, downloadCSV...

  context/
    AuthContext.tsx           # login/logout/ρόλος - διαθέσιμο παντού
    ToastContext.tsx          # showToast('μήνυμα', 'success'|'error')

  components/
    Login.tsx
    Topbar.tsx

    shared/                  # κοινά components που τα χρησιμοποιούν 2+ views
      TargetsView.tsx          # πίνακας στόχων 2026 (admin + employee)
      VacationCalendar.tsx     # το ημερολόγιο αδειών (admin + regional)
      VacationsPanel.tsx       # όλο το tab αδειών (readOnly prop)
      OvertimesPanel.tsx       # όλο το tab υπερωριών (readOnly prop)
      RallyHeroStats.tsx       # το πάνω μπάνερ στατιστικών ράλλυ
      RallyBadges.tsx          # μικρά badges (status, island)

    admin/
      AdminView.tsx             # tabs container
      EntryTab.tsx              # εισαγωγή ημερήσιας παραγωγής
      YtdTab.tsx                # προοδευτικά σύνολα
      RallyTab.tsx              # πλήρες CRUD ράλλυ καρτών

    employee/
      EmployeeView.tsx          # container
      EmployeeStats.tsx         # μηνιαία tabs + στατιστικά
      MyVacations.tsx
      MyOvertimes.tsx
      MyRally.tsx

    regional/
      RegionalView.tsx          # tabs container (read-only)
      RegionalRallyPanel.tsx
```

## Σημειώσεις

- Το `VacationsPanel` και το `OvertimesPanel` χρησιμοποιούνται **και** από τον
  admin **και** από την περιφέρεια, με τη διαφορά ότι στην περιφέρεια περνάμε
  `readOnly={true}` (κρύβει τη φόρμα προσθήκης και τα κουμπιά διαγραφής).
  Αν αλλάξεις κάτι εκεί, αλλάζει και στα δύο views αυτόματα.
- Το ράλλυ καρτών έχει *δύο* ξεχωριστά components (`admin/RallyTab.tsx` πλήρες,
  `regional/RegionalRallyPanel.tsx` απλό read-only) γιατί διαφέρουν αρκετά στη
  διάταξη, αλλά μοιράζονται το `RallyHeroStats.tsx` για το πάνω μπάνερ.
- Δεν έχει γίνει `npm install` / build σε αυτό το περιβάλλον (δεν υπάρχει
  πρόσβαση στο internet εδώ) — τρέξε τα δύο commands παραπάνω τοπικά στον
  υπολογιστή σου για να το δοκιμάσεις.
