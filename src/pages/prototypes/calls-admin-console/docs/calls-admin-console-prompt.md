# Prompt — Calls admin console

Scaffold a prototype from this Figma frame of the admin console for the Calls plugin:

- Reuse the existing admin console shell.
- Reuse the right admin panel components and form components for the main content area.

Figma frame: https://www.figma.com/design/feH2AjJIzIkgRATJSxYyH6/Calls-System-Console-Config?node-id=2003-33339

## Frame contents (read from Figma)

Page title **Calls**, beta banner, then seven `AdminPanel` sections, then the page Save / Cancel footer:

1. **General settings** — Test mode, Max call participants, Allow screen sharing, Enable simulcast for screen sharing (Experimental), Enable call ringing (Beta), Enable IPv6 support (Experimental).
2. **RTCD Service** (Enterprise tag) — RTCD service URL.
3. **RTC Server** — RTC Server Address (UDP / TCP), RTC Server Port (UDP / TCP).
4. **ICE and TURN Configuration** — ICE Host Override, ICE Host Port Override, ICE Servers Configurations (JSON), TURN Static Auth Secret, TURN Credentials Expiration (minutes), Server Side TURN.
5. **Call recording** (Enterprise tag) — Enable call recordings (Beta), Job service URL, Maximum call recording duration, Call recording quality.
6. **Call transcription** (Enterprise tag) — Enable call transcriptions (Experimental), Call transcriber model size, Call transcriber threads.
7. **Live captions** (Enterprise tag) — Enable live captions (Experimental), model size, number of transcribers, threads per transcriber, language.
