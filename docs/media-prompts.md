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
Code-glass look, EDIT mode (a new pose redraws his face). Attach ONLY `media-src/about-portrait/ref-straight-1024x1536.jpg` (no style reference: its face leaks in). Concept: he looks at the viewer through the code.

**Step 1, scene + light:**
> Edit this photo. Do not redraw, reshape or retouch his face: keep his face, eyes, eyebrows, nose, lips, beard, hair, skin tone, head angle, expression and gaze exactly as they are in this photo, pixel for pixel. Change only the scene and the light. Replace the background with a dark room that falls to near-black. Place a transparent glass display in front of him, between him and the camera, covered in glowing lines of code in amber and orange with a few deep red lines; the code is soft and out of focus and fills the left side of the frame and the lower part over his jacket and chest, with only one or two very faint blurred lines passing across the edge of his cheek, never over his eyes, nose or mouth. Relight the photo as if the glowing code were the only light: a low-key image, warm amber light falling on the left side of his face and the edge of his beard, the right side of his face in soft shadow, the background deep neutral black. His eyes keep their natural dark brown colour. Keep the same framing and camera angle. Photorealistic, like a real photo taken through glass, natural skin texture, shadows neutral black not orange, no teal, cyan or blue, no grain or noise, code unreadable, no logos, no watermark. Output exactly 1024×1536 px.

**Step 2 (optional), black tee instead of the white shirt:** attach the step 1 result.
> Edit this photo. Change only his shirt: replace the white shirt under the blazer with a plain black crew-neck T-shirt. Keep everything else exactly the same — his face, hair, beard, expression, the blazer, the code, the light and the colours; do not redraw his face. Output exactly 1024×1536 px.

---

## 3. Expertise section (5 accordion images, also used as the cursor-preview image)

All five: `.webp` · R · 6:7 · 720×840. These are still lifes with no person, so no reference photo is needed. Each one ends with the style line, minus the portrait wording.

- **`expertise-01.webp` (Backend & Real-Time):** Dark server rack in a black room, bundles of cables glowing with thin orange light pulses, shallow depth of field, moody orange rim lighting, no readable labels.
- **`expertise-02.webp` (Mobile):** Two hands holding a rugged handheld RFID scanner and a smartphone, screens glowing softly orange, dark background, cinematic close-up, no readable text on screens.
- **`expertise-03.webp` (Web Platforms):** Abstract grid of light trails reflected on dark glass, like a live dashboard dissolved into light, orange and deep red, minimal.
- **`expertise-04.webp` (Web3 & Security):** A matte black hardware key next to a phone, a padlock glyph formed by thin orange light lines floating above it, dark surface, macro shot.
- **`expertise-05.webp` (Cloud, DevOps & AI):** Stacked shipping-container shapes in miniature on a dark surface, crossed by beams of orange light and faint haze, abstract and architectural.

Shared ending for these five: *cinematic still life, monochrome orange-to-crimson grade, deep near-black shadows #0D0D0D, shallow depth of field, subtle film grain, no text, no letters, no logos, no watermark.*

---

## 4. Selected Work (6 projects)

**Real screenshots are better.** For covers, a real screenshot of the app placed in a phone or laptop mockup on a dark, orange-lit set looks far more credible than generated UI. Blur any client data. If you can't show the real app, use these generated scenes instead.

The 6 slugs are `aasl-access-control`, `jova-wallet`, `offline-expense-platform`, `uhf-rfid-scanner`, `techsalary-lk` and `ai-chatbot-backend`.

Every project gets two files:
- `work-<slug>-cover.webp` · R · 4:3 · 2400×1800: the card on the home page. Keep the subject in the middle 70%.
- `work-<slug>-banner.webp` · R · 14:9 · 2800×1800: the top image on the case-study page. Keep the subject in the middle 66% vertically, because it zooms on scroll.

Use the same scene for both and just reframe for the aspect ratio. End each prompt with the still-life ending from section 3.

| Slug | Scene prompt |
|---|---|
| `aasl-access-control` | Airport security access gate at night, glass turnstiles and a scanning panel glowing orange, long empty terminal corridor behind, reflections on polished floor, cinematic wide shot |
| `jova-wallet` | A smartphone floating at a slight angle above a dark surface, its screen emitting a soft orange glow with abstract coin-like light orbs rising from it, no readable text |
| `offline-expense-platform` | Rugged tablet resting on a steel beam at a construction site at dusk, its screen glowing orange, cranes silhouetted against a deep red sky, shallow depth of field |
| `uhf-rfid-scanner` | Close-up of a rugged handheld UHF RFID scanner in a hand, a thin orange laser-like scan line hitting a small tag, dark industrial background |
| `techsalary-lk` | Abstract cloud architecture: seven glowing orange cubes connected by thin light lines floating in dark space, isometric, minimal |
| `ai-chatbot-backend` | Abstract scene of a paper document dissolving into glowing orange particles that reform into chat-bubble shapes, dark background, no readable text |

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
