# Voice Input Feature — Voice Everywhere

> User directive 2026-10-23: voice input on ALL sections.
> 100% local, no cloud AI, no external API.

## UI spec

Every page that has an input area will get a floating microphone
button below the primary CTA. The button shows:


- Icon: lucide `Mic`
- Text: "پیام بزار من برات انجام میدم" + a warm emoji (😊 / 🙂)
- Mobile-first: 48px min-height, RTL
- Tap → starts voice recording

## Behavior

1. User taps mic → recording starts (mic permission requested once).
2. User speaks (Persian).
3. Transcription via **Vosk** (local, ~50 MB Persian model).
4. Transcription shown to user with a **Preview & Confirm** dialog:


5. On تأیید → fills the form / creates the entity.
6. On ویرایش → user edits fields manually.

## Architecture (all local, no cloud)


## All Sections (intents to support in Phase 1)

| Section | Intent | Example | Backend target |
|---|---|---|---|
| Obligations | create_obligation | «بیمه ماشین تمدید ۵ آذر» | POST /api/obligations |
| Finance | create_expense | «امروز ۴ میلیون میوه دادم» | POST /api/finance/expense |
| Assets | create_asset | «ماشین پراید مدل ۹۸» | POST /api/assets |
| Documents | upload_document (record name) | «بیمه‌نامه ماشین» | POST /api/documents |
| Family | invite_member | «همسرم مریم را دعوت کن» | POST /api/family/invite |
| Notifications | (read-only — no voice) | — | — |
| Settings | (read-only — no voice) | — | — |
| Converters | (no voice) | — | — |
| Market | (no voice) | — | — |
| IP | (no voice) | — | — |
| Calendar | create_event | «جلسه شنبه ساعت ۱۰» | POST /api/calendar |

## Phase plan

- **F-V1** — Backend: install Vosk + Persian model + `POST /api/voice/transcribe` endpoint
- **F-V2** — Backend: `VoiceParser` rule-based NLU (intent + entities + Jalali date)
- **F-V3** — Frontend: `<VoiceButton>` reusable component + Preview modal
- **F-V4** — Integration: add to Obligations / Finance / Assets (Phase 1)
- **F-V5** — Extend to Documents / Family / Calendar
- **F-V6** — (optional) move STT to WebAssembly in browser for privacy

## Constraints

- No external API, no cloud LLM, no external ASR
- Vosk Persian model `vosk-model-small-fa-0.42` (~50 MB) downloaded once,
  stored at `/var/www/zarvan/models/vosk-fa/`
- Model files must be gitignored
- Server must run CPU-only (no GPU)

## Approval rule

Voice transcription is NEVER auto-submitted. Always a preview
dialog with تأیید / ویرایش / لغو.

Last updated: 2026-10-23
