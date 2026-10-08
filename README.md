# Poornaa Shree Praveenraj — Portfolio

Personal portfolio site: machine learning, data analytics and IoT cloud systems.

It is a plain static site (HTML, CSS and vanilla JavaScript, no build step).

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Main one-page portfolio: about, skills, projects, experience, ProtoSem logs, IoT summary, contact |
| `iot.html` | IoT case study: Tasks 1–5 (ESP32 web server, Adafruit IO MQTT, IFTTT voice, Firebase dashboard, historical logging) |
| `styles.css` | Shared styles for both pages |
| `script.js` | Particle background, card tilt, magnet buttons, menu, accordion and contact form |
| `assets/iot/` | Screenshots and demo videos for the IoT page |
| `downloads/` | Source files offered as downloads on the IoT page |

## Running locally

Open `index.html` in a browser, or use the VS Code launch configs in `.vscode/launch.json`.
For a local server: `python3 -m http.server` and visit http://localhost:8000.

## Notes

- The contact form has no backend. Submitting it opens the visitor's email app with the message pre-filled to the address in `script.js` (`CONTACT_EMAIL`).
- Animations are switched off for visitors who set "reduce motion" in their OS, and the tilt/magnet effects only run on devices with a mouse.
