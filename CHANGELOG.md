# 🧱 CHANGELOG — amigo

> "Nu ce am lansat. Ci ce s-a întărit."

Amigo este construit ca un obiect, nu ca un produs.
Fiecare intrare marchează un prag, o decizie, un os nou pus în corp.

## [Unreleased] - The Field Phase 🚜

_Status: Hardening & Tuning_

### 🛠️ În lucru

- **Field Device UI:** Stabilizarea interfeței de "Walkie-Talkie" (Input greu, butoane mecanice).
- **Control Room:** Implementarea logicii de `/api/sh` cu flow-ul de _One-Time Read_.
- **Tactile Feedback:** Eliminarea umbrelor "soft" în favoarea "hard shadows" (Beguer style).

---

## 2026-01-21 — Jungle Radio Protocol 📻

_Status: Receiver Core Stabilized_

### 📡 Room / Receiver

- **Break Seal Flow:** Trei stări clare — _sealed → tuning → open_ — cu CTA unic în buclă.
- **Tuning Scramble:** Efect de decriptare cu performanță optimizată (refs + mutate in place).
- **Auto-Open Fix:** Ritual mode pornește după tuning, fără dead-ends.
- **Diagnostics Header:** FREQ / CHANNEL / STATUS în loc de caption (radio feel).

### 🧭 Routing & Identity

- **Canonical Callsign Route:** `/:callsign/:slug` (default `@garden`).
- **Legacy Redirects:** `/r/:slug` și `/:slug` trimit către `@garden`.
- **Docs Poster Stub:** `/docs/room/:slug` — artefact printabil (MVP).

---

## 2026-01-20 — The Beguer Era & Wolf's Shield 🛡️

_Status: Structural Shift / Ethical Foundation_

### 🏛️ Philosophy & License

- **License Change:** Proiectul a trecut oficial la **AGPL-3.0-only**.
  - _Intent:_ Suveranitate. "The Wolf's Shield". Codul rămâne liber și protejat de închidere.
- **Design Canon Updated:**
  - **"Testul de Spate" (The Spine Test):** Dacă e doar pentru ochi și nu se simte greu, nu trece.
  - **Estetica Beguer:** Trecerea de la "Web Clean" la "Industrial Oxide".
  - **Palette:** Beguer Green (`#556B2F`), Rust (`#C04000`), Primer Grey (`#8C8C8C`).

### ⚡ Features

- **Field Unit Concept:** Room-ul nu mai este o pagină web, este un dispozitiv.
- **Heavy Inputs:** Terminal-style inputs pentru creare.
- **Smart Signets v1:** Logică de detectare automată a vibe-ului (`/peek`).

---

## 2026-01-19 — Dawn Paper & The Vibe 🌅

_Status: Emotional Core_

### 🎨 Visuals

- **Dawn Paper High (High Gold):** Gradientul canonic pentru speranță și lumină.
- **Smart Signets:** Sistemul de emoji-uri care dictează "temperatura" link-ului.
- **OG Images:** Generare server-side (Edge) pentru preview-uri de WhatsApp/iMessage care arată a "Vedere", nu a link.

### 🧠 Logic

- **Meta Headers:** Titluri dinamice ("Un prieten 🐺 ți-a trimis asta").
- **Privacy:** Preview-ul nu arată conținutul, doar intenția.

---

## 2026-01-XX — Genesis 🌑

_Status: Ignition_

### 🌱 Roots

- **Concept:** Transport de intenție.
- **Core Loop:** Scrie -> Sigilează -> Trimite -> Arde.
- **Stack:** Next.js, Rust (logic), KV (storage).
