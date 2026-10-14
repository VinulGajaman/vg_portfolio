# Media prompts for the portfolio

Image and video prompts for every media slot on the site. Generate each one, save it under the **exact filename** shown, and drop it into `public/media/`. The site picks it up on the next build. Until then, each slot shows an animated placeholder labelled with its filename.

## How to use

- **Attach your reference photo every time** you generate a shot that includes you. Tell the tool to keep your face and identity the same (Midjourney: `--cref <photo> --cw 100`; ChatGPT, Gemini or Flux: "use the attached photo as the person, keep their face identical").
- **Paste the style line** at the end of every photo prompt, word for word, so every image looks like one shoot:

> Real photograph shot in a professional studio, single warm orange key glow behind the subject on a seamless backdrop, physically accurate lighting, warm orange-to-deep-red colour grade (#F65802 to #8A1206), crisp warm rim light on hair, ear, jaw and shoulders, low-key lighting underexposed by about one stop, face mostly in soft shadow with only a faint warm fill and natural skin texture, the rim light brighter than the face, deep blacks, 85mm lens at f/2, shallow depth of field, clean image with no film grain or noise, high contrast, not a composite, not an edit, no cut-out halo, no teal or blue tint, no text, no letters, no logos, no watermark.

- **No text inside images.** Every word on the site is real HTML, so reject any image where letters or logos appear.
- **Keep the empty space empty.** Each prompt says where text will sit on top. If the generator fills that area with detail, regenerate.
- **Formats.**
  - Photos: `.webp` (or `.jpg`/`.png`) at the listed resolution.
  - Cut-outs: transparent `.png` or `.webp`.
  - Videos: `.mp4` (H.264, no audio, under 6 MB).
- **Videos are made from stills.** Generate the image first, then feed it to an image-to-video tool (Kling, Runway, Veo or Sora) as the **first frame**, together with the video prompt.

R = required for the site to look finished. O = optional upgrade.

---

## 1. Hero (top of the home page)

### `hero-portrait.webp` · R · 16:9 · 3200×1800
> A new cinematic studio photograph. Same man as the reference photos, his face must stay identical: South Asian man in his late twenties, warm medium-brown skin, oval face with a defined jawline and slightly prominent cheekbones, dark brown almond-shaped eyes with a calm focused gaze, thick dark straight eyebrows, straight nose with a softly rounded tip, full well-groomed dark beard trimmed short with a clean cheek line and a connected moustache, short dark hair with volume on top swept up and back and shorter tapered sides, ears slightly visible, lean build. Wearing a plain black crew-neck T-shirt. Three-quarter side profile facing right, head and shoulders, placed in the horizontal centre of the frame with the head in the upper-middle (top of the hair about 12% from the top) and the shoulders reaching into the bottom 30%, calm confident expression. Warm orange-to-red glow on the backdrop behind his head, fading to deep red and near-black towards the edges and bottom. Leave empty background on both sides of the head (text sits top-left, thumbnails top-right) and let the bottom 30% fall dark, a giant wordmark will overlap the shoulders. [style line]

### `hero-portrait-mobile.webp` · R · 9:16 · 1080×1920
> A new cinematic studio photograph, vertical. Same man as the reference photos, his face must stay identical: South Asian man in his late twenties, warm medium-brown skin, oval face with a defined jawline and slightly prominent cheekbones, dark brown almond-shaped eyes with a calm focused gaze, thick dark straight eyebrows, straight nose with a softly rounded tip, full well-groomed dark beard trimmed short with a clean cheek line and a connected moustache, short dark hair with volume on top swept up and back and shorter tapered sides, ears slightly visible, lean build. Wearing a plain black crew-neck T-shirt. Three-quarter side profile facing right, head and shoulders large in the upper-middle of the frame. Warm orange glow behind his head, fading to deep red, the bottom 40% of the frame falling to near-black and empty for text. [style line]

### `hero-thumb-01.webp`, `hero-thumb-02.webp`, `hero-thumb-03.webp` · R · 6:5 · 520×440
These are small thumbnails (130×110 on screen), so keep each one simple and bold.
- **01:** Front-facing portrait of the person from the reference photo, chest up, slight smile, against a flat glowing orange backdrop, rim light on both sides. [style line]
- **02:** The person from the reference photo seated at a desk, working on a laptop, seen from the side; the laptop screen casts a soft glow on their face; orange rim light from behind; dark room. [style line]
- **03:** Close-up of the person's hand holding a rugged handheld RFID scanner (or a phone) towards the camera, their face softly out of focus behind it, orange rim light. [style line]

### `hero-bg-plate.webp` · O · 16:9 · 3200×1800
For the layered 3D-depth hero. Generate it from `hero-portrait` with the person removed.
> The exact same backdrop as the hero portrait, an orange-to-crimson glowing gradient with the same light falloff and grain, with no person in the frame. Empty, clean, seamless. [style line]

### `hero-subject.png` · O · 16:9 · 3200×1800, transparent
> Cut out the person from `hero-portrait.webp` onto a fully transparent background, keeping the rim-light edge glow and hair detail. It must line up pixel-for-pixel with the original.

Use a background remover (Photoshop "Remove background", remove.bg or Photoroom) on `hero-portrait`. Don't generate a new image. Both the plate and the cut-out are needed: the layered mode only switches on when both files exist.

### `hero-loop.mp4` · O · video · 16:9 · 1920×1080 · 6–8s seamless loop
First frame: `hero-portrait.webp`.
> Locked-off static camera. The person stays perfectly still with only a subtle natural breath. The orange backlight slowly breathes brighter and dimmer, and a faint haze drifts slowly across the backdrop. Nothing enters or leaves the frame. Seamless loop: the last frame matches the first. No camera movement, no text.

---

## 2. About section

### `about-portrait.webp` · R · 2:3 · 1200×1800
Front portrait, server-room bokeh, lit by a code monitor with faint code reflections on face and body (no eye slit). Attach: (1) the light-slit generation to edit, (2) `media-src/about-portrait/ref-straight-1024x1536.jpg` for face / eye accuracy.
> Edit image 1. Image 2 is a real photo of the same man: use it only to keep his face and especially his eyes accurate — same eye shape, eyelids, size, dark brown iris colour and gaze straight into the camera. Keep everything in image 1 the same: his pose, framing, expression, hair, beard, black crew-neck T-shirt and the out-of-focus server-room bokeh behind him. Change only the lighting. Remove the horizontal orange line of light across his eyes completely. New light: a monitor just below and in front of the camera, showing code in a dark theme with amber text, is now the main light. It casts a soft, low warm amber glow from slightly below onto his face, neck and T-shirt, so his whole face is evenly but dimly lit, a little brighter on the lower half, with deep shadows at the edges. Very subtle reflections of the code: faint, soft, blurred horizontal bands of slightly brighter light from the lines of text on the screen fall across his face, neck and T-shirt and bend naturally over the shape of his face — barely visible, about as strong as a reflection on skin, no readable characters, no hard lines. A small warm catchlight from the screen in each eye. Colour: deep neutral blacks and charcoal, warm amber only in the light from the screen and in the bokeh, his skin keeps its natural brown tone, no orange wash over the image. Real photograph, natural skin texture, not a composite, clean image with no grain or noise, no green, blue or teal, no text, no logos, no watermark. Output exactly 1024×1536 px, same framing.

---

## 3. Expertise section (5 accordion images, also used as the cursor-preview image)

All five: `.webp` · R · 6:7 (generate 1200×1400). They show the software itself as a cinematic film still that matches the hero (orange backlight, drifting smoke, deep blacks). Paste the shared ending after each scene:

> *Cinematic film still of a 3D scene, shot on a 35mm anamorphic lens from a slightly low angle: one main subject in sharp focus, everything else falling out of focus into the darkness. The interfaces float in a dark, hazy space; soft orange smoke drifts slowly between them; a warm orange-to-deep-red glow behind the main subject like a stage backlight; crisp orange rim light on the glass edges; soft volumetric light beams through the haze; a subtle anamorphic flare from the brightest screen; fine glowing dust in the air; reflections on a glossy black floor. Interfaces in a dark theme with orange accents. Colour: deep neutral blacks, warm orange and deep red the only colours, high contrast, soft film-like highlight roll-off. Clean image with no grain or noise, interface text tiny and softly blurred so nothing is readable, no logos, no watermark. Vertical 6:7, 1200×1400 px, main subject centred so it still works when cropped to a wide frame.*

- **`expertise-01.webp` (Backend & Real-Time):** Floating translucent glass panels in a dark space, layered in depth. The main panel shows a microservices system-design diagram: an API gateway box at the top connected by glowing orange lines to service boxes (auth, orders, inventory, payments), a message-queue bar in the middle and database cylinders at the bottom, with small bright pulses travelling along the lines. Behind it, a panel with backend code in a dark editor, and a panel with an ERP module map of connected blocks.
- **`expertise-02.webp` (Mobile):** Three smartphones floating at different angles in a dark space, their screens showing one polished mobile app in a dark theme with orange accents: a home dashboard with rounded cards, a scanning screen with a viewfinder frame, and a list screen with a small offline-sync icon. Soft reflections of the screens on the glossy floor below.
- **`expertise-03.webp` (Web Platforms):** A large floating browser window showing an ERP web application in a dark theme with orange accents: a left sidebar with menu icons, KPI cards along the top, a data table with filters and pagination, and line and bar charts. In front of it, slightly smaller and angled, the same app in a tablet frame, showing the responsive layout.
- **`expertise-04.webp` (Web3 & Security):** Floating glass panels showing a crypto wallet app in a dark theme with orange accents: a balance card, a list of tokens with round coin icons, send and receive buttons, and a transaction confirmation with a padlock icon. Behind the panels, a blockchain drawn as a chain of glowing translucent 3D blocks linked by bright orange connections, receding into the darkness.
- **`expertise-05.webp` (Cloud, DevOps & AI):** A Kubernetes cluster visualised in a dark space: three glowing translucent server instances, each holding a grid of small glowing cubes for containers, some cubes lighting up as they deploy, connected to a central control plane. Around them floating glass panels: a dashboard with CPU and memory graphs for each instance, a deployment pipeline with stages and check marks, and an AI chat panel with a prompt, a response and a small token-usage chart for LLM monitoring.
---

## 4. Selected Work (6 projects)

**Real screenshots are better.** For covers, a real screenshot of the app placed in a phone or laptop mockup on a dark, orange-lit set looks far more credible than generated UI. Blur any client data. If you can't show the real app, use these generated scenes instead.

The 6 slugs are `aasl-access-control`, `jova-wallet`, `offline-expense-platform`, `uhf-rfid-scanner`, `techsalary-lk` and `ai-chatbot-backend`.

Every project gets two files:
- `work-<slug>-cover.webp` · R · 4:3 · 2400×1800: the card on the home page. Keep the subject in the middle 70%.
- `work-<slug>-banner.webp` · R · 14:9 · 2800×1800: the top image on the case-study page. Keep the subject in the middle 66% vertically, because it zooms on scroll.

Use the same scene for both and just reframe for the aspect ratio.

Shared ending for every cover (paste after each scene): *Real photograph, cinematic, 35mm lens, shallow depth of field, deep neutral blacks, warm orange and amber light only from the light sources in the scene, natural materials, no orange wash over the whole image, clean image with no grain or noise, no people, no text, no letters, no numbers, no logos, no watermark. Landscape 4:3, 2400×1800 px.*

| Slug | Scene prompt |
|---|---|
| `aasl-access-control` | A secure staff corridor in an airport at night, empty. In the foreground a row of glass security access gates, each with a thin strip of warm orange status light and a small card reader glowing amber. The long corridor behind fades into darkness, with the orange lights reflected on the polished floor. |
| `jova-wallet` | A smartphone lying at a slight angle on a dark slate surface next to a matte black hardware security key. The phone screen glows warm amber with simple abstract wallet shapes — rounded cards and a few small circles, nothing readable. Soft reflections of the screen on the slate, the rest falling into darkness. |
| `offline-expense-platform` | A rugged smartphone resting on a raw concrete block at a construction site at dusk, next to a worn hard hat and steel rebar. Its screen glows warm amber with simple abstract list shapes, nothing readable. Out of focus behind: scaffolding and a crane silhouetted against a deep red dusk sky. |
| `uhf-rfid-scanner` | A gloved hand holding a rugged handheld RFID scanner in a dark warehouse aisle, aimed at stacked shipping crates. A thin warm orange scan beam from the scanner falls across small tags on the crates. The aisle recedes into shadow, lit only by the scanner and a few distant amber lights. |
| `techsalary-lk` | A dark data-centre aisle in perspective, tall black server racks on both sides, hundreds of tiny amber status lights glowing and blurring into soft bokeh, neat bundles of cables, light haze in the air, the aisle vanishing into darkness. |
| `ai-chatbot-backend` | An open product manual lying on a dark desk under a single warm spotlight. Tiny glowing amber particles lift off its pages and drift upward, gathering into a soft glowing speech-bubble shape of light floating above the book. Everything else falls into darkness. |

**Optional extras per project (O):**
- `work-<slug>-hover.webp` (4:3, 2400×1800): a second angle or UI close-up that fades in when the card is hovered.
- `work-<slug>-gallery-01.webp` and `-02.webp` (5:4, 1600×1280): detail shots for the case-study page.
- `work-<slug>-gallery-03.webp` (7:4, 2800×1600): a wide context shot.
- `work-<slug>-preview.mp4` (4:3, 1600×1200, 4–6s): a slow screen-recording pan of the real app that plays on hover. A screen recording of the real app works best here.

---

## 5. Showreel (pinned video that zooms to full screen)

### `showreel.mp4` · R · video · 16:9 · 1920×1080 · 10–15s seamless loop
First frame: generate a still with the prompt below, then animate it.
> **Still:** The person from the reference photo coding at night in a dark room, seen from a three-quarter back angle, two monitors glowing, warm orange practical lights (a desk lamp and a neon strip) in the background, haze in the air. [style line]
>
> **Video:** Slow continuous dolly-in towards the person at the desk, monitors flickering softly with code-like light patterns (no readable text), haze drifting through the orange light. Smooth, cinematic, no cuts or a single soft cut. Seamless loop: the last frame matches the first. No text overlays.

Optionally, cut in 2–3 seconds of real screen recordings (the AASL console, the wallet app) graded orange.

`showreel-720.mp4` (O) is the same clip re-encoded at 1280×720 for phones.

---

## 6. Contact section background

### `contact-bg.webp` · R · 3:2 · 3000×2000
> The person from the reference photo looking down thoughtfully, in silhouette, with a motion-blur double-exposure ghost of their profile offset beside them, orange and red halo glow. Place them in the left 45% of the frame; keep the right 55% darker, calm and empty (a contact form sits there). [style line]

### `contact-bg-mobile.webp` · R · 4:5 · 1080×1350
> Same scene, vertical: the person and their double-exposure ghost in the upper 60% of the frame, the bottom 40% fading to near-black. [style line]

### `contact-loop.mp4` · O · video · 3:2 · 1920×1280 · 6–8s
First frame: `contact-bg.webp`.
> Locked-off camera. The double-exposure ghost drifts very slowly sideways and breathes in opacity; the orange halo pulses faintly. The person stays still. Seamless loop, no text.

---

## 7. Social share image

### `og-image.jpg` · R · 1.91:1 · 1200×630
Crop this from `hero-portrait.webp` with the face in the right half, and leave the left half dark. Don't generate text into it: your name gets added in code or by hand.

---

## 8. Not generated (for reference)

- **Tech logos** (`logo-nestjs.svg` and the others): official white SVGs from simpleicons.org. The full id list is in `public/media/README.md`.
- **`cv-pdf.pdf`:** a copy of your CV **without the References section**, if you want a "Download CV" button.

---

## Priority order

If you only have time for some of these, do them in this order:
1. `hero-portrait` + `hero-portrait-mobile`
2. `about-portrait`
3. The 6 `work-*-cover` images
4. `showreel.mp4`
5. `contact-bg` + `contact-bg-mobile`
6. The 6 `work-*-banner` images
7. `expertise-01…05`
8. `hero-thumb-01…03` and `og-image`
9. Everything optional
