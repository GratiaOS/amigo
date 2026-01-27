# Signal Engine

Status: Canonical / v0.1

## Purpose

Signal Engine este motorul de traducere intre stare → parametri → experienta audio-vizuala.
Nu este un feature. Este stratul de baza peste care se construiesc UI, moduri, walkie, survival.

## Canon

- C = Miez (stare, prezenta, reglare)
- A = Periferie (canal, degradare, conditii)

C este centrul. A este contextul.

## Inputs

- Unitati (signets / trupe)
- Mod (Good / Low / Survival)
- Intensitate (daca exista)
- Context (solo / amigo / walkie)

## Core Parameters (draft)

Vizual:
- glow
- damping
- jitter
- blur
- pulse rate
- color space

Audio:
- low-pass / high-cut
- noise floor
- distortion / saturation
- reverb size
- dynamic range

## Outputs

### Miez (C)

- Doar stare, prezenta, reglare.
- Nu devine UI de analiza.
- Nu devine instrument "de masurat".

### Canal (A)

- Osciloscop murdar (subtil).
- Arata calitatea canalului, nu mesajul.
- Poate disparea complet cand canalul e stabil.

## Survival canonical mapping (prima implementare)

- ⚓ Ground / Anchor
- 🚬 The Ground
- 🐯 Pressure / Force
- 🐦‍🔥 Burn / Edge
- 🧱 Fortify / Hold

Trade-offs si praguri se documenteaza aici pe masura ce apar.

## Non-goals

Signal Engine nu este:
- dashboard
- biofeedback medical
- music player
- gamification

## Notes

Daca trebuie sa tai tot si sa ramana un singur lucru, ramane C (miezul).
Restul sunt unelte.
