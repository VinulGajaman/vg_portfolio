# /public/media

Flat media folder (DESIGN.md §5). Drop a file named `<slot-id>.<ext>` here and rebuild; `<MediaSlot id>` swaps its placeholder for the real file automatically. The full registry (alt text, briefs) lives in `src/content/media.ts`.

- Images resolve in the order .avif, .webp, .jpg, .jpeg, .png. Video: .mp4, .webm. Logos: .svg.
- Video posters: `<slot-id>-poster.<image ext>` (first frame of the clip).
- Prefer .webp (q80–85) at the listed size; cut-outs need alpha. No text inside any generated image.
- Never publish the CV with its References section.

R = required for a finished look, O = optional.

| Slot id | Kind | Aspect | Recommended px | R/O | Expected path |
|---|---|---|---|---|---|
| `hero-portrait` | image | 16:9 | 3200×1800 | R | `/public/media/hero-portrait(.webp|.jpg|.png|.avif|.jpeg)` |
| `hero-portrait-mobile` | image | 9:16 | 1080×1920 | R | `/public/media/hero-portrait-mobile(.webp|.jpg|.png|.avif|.jpeg)` |
| `hero-bg-plate` | image | 16:9 | 3200×1800 | O | `/public/media/hero-bg-plate(.webp|.jpg|.png|.avif|.jpeg)` |
| `hero-subject` | image (alpha) | 16:9 | 3200×1800 | O | `/public/media/hero-subject(.webp|.jpg|.png|.avif|.jpeg)` |
| `hero-loop` | video | 16:9 | 1920×1080 | O | `/public/media/hero-loop(.mp4|.webm)` |
| `hero-thumb-01` | image | 6:5 | 520×440 | R | `/public/media/hero-thumb-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `hero-thumb-02` | image | 6:5 | 520×440 | R | `/public/media/hero-thumb-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `hero-thumb-03` | image | 6:5 | 520×440 | R | `/public/media/hero-thumb-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `about-portrait` | image | 2:3 | 1200×1800 | R | `/public/media/about-portrait(.webp|.jpg|.png|.avif|.jpeg)` |
| `expertise-01` | image | 6:7 | 720×840 | R | `/public/media/expertise-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `expertise-02` | image | 6:7 | 720×840 | R | `/public/media/expertise-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `expertise-03` | image | 6:7 | 720×840 | R | `/public/media/expertise-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `expertise-04` | image | 6:7 | 720×840 | R | `/public/media/expertise-04(.webp|.jpg|.png|.avif|.jpeg)` |
| `expertise-05` | image | 6:7 | 720×840 | R | `/public/media/expertise-05(.webp|.jpg|.png|.avif|.jpeg)` |
| `showreel` | video | 16:9 | 1920×1080 | R | `/public/media/showreel(.mp4|.webm)` |
| `showreel-720` | video | 16:9 | 1280×720 | O | `/public/media/showreel-720(.mp4|.webm)` |
| `contact-bg` | image | 3:2 | 3000×2000 | R | `/public/media/contact-bg(.webp|.jpg|.png|.avif|.jpeg)` |
| `contact-bg-mobile` | image | 4:5 | 1080×1350 | R | `/public/media/contact-bg-mobile(.webp|.jpg|.png|.avif|.jpeg)` |
| `contact-loop` | video | 3:2 | 1920×1280 | O | `/public/media/contact-loop(.mp4|.webm)` |
| `og-image` | image | 1.91:1 | 1200×630 | R | `/public/media/og-image(.webp|.jpg|.png|.avif|.jpeg)` |
| `cv-pdf` | pdf (no References section) | — | — | O | `/public/media/cv-pdf(.pdf)` |
| `work-aasl-access-control-cover` | image | 4:3 | 2400×1800 | R | `/public/media/work-aasl-access-control-cover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-aasl-access-control-hover` | image | 4:3 | 2400×1800 | O | `/public/media/work-aasl-access-control-hover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-aasl-access-control-preview` | video | 4:3 | 1600×1200 | O | `/public/media/work-aasl-access-control-preview(.mp4|.webm)` |
| `work-aasl-access-control-banner` | image | 14:9 | 2800×1800 | R | `/public/media/work-aasl-access-control-banner(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-aasl-access-control-gallery-01` | image | 5:4 | 1600×1280 | O | `/public/media/work-aasl-access-control-gallery-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-aasl-access-control-gallery-02` | image | 5:4 | 1600×1280 | O | `/public/media/work-aasl-access-control-gallery-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-aasl-access-control-gallery-03` | image | 7:4 | 2800×1600 | O | `/public/media/work-aasl-access-control-gallery-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-jova-wallet-cover` | image | 4:3 | 2400×1800 | R | `/public/media/work-jova-wallet-cover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-jova-wallet-hover` | image | 4:3 | 2400×1800 | O | `/public/media/work-jova-wallet-hover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-jova-wallet-preview` | video | 4:3 | 1600×1200 | O | `/public/media/work-jova-wallet-preview(.mp4|.webm)` |
| `work-jova-wallet-banner` | image | 14:9 | 2800×1800 | R | `/public/media/work-jova-wallet-banner(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-jova-wallet-gallery-01` | image | 5:4 | 1600×1280 | O | `/public/media/work-jova-wallet-gallery-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-jova-wallet-gallery-02` | image | 5:4 | 1600×1280 | O | `/public/media/work-jova-wallet-gallery-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-jova-wallet-gallery-03` | image | 7:4 | 2800×1600 | O | `/public/media/work-jova-wallet-gallery-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-offline-expense-platform-cover` | image | 4:3 | 2400×1800 | R | `/public/media/work-offline-expense-platform-cover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-offline-expense-platform-hover` | image | 4:3 | 2400×1800 | O | `/public/media/work-offline-expense-platform-hover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-offline-expense-platform-preview` | video | 4:3 | 1600×1200 | O | `/public/media/work-offline-expense-platform-preview(.mp4|.webm)` |
| `work-offline-expense-platform-banner` | image | 14:9 | 2800×1800 | R | `/public/media/work-offline-expense-platform-banner(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-offline-expense-platform-gallery-01` | image | 5:4 | 1600×1280 | O | `/public/media/work-offline-expense-platform-gallery-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-offline-expense-platform-gallery-02` | image | 5:4 | 1600×1280 | O | `/public/media/work-offline-expense-platform-gallery-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-offline-expense-platform-gallery-03` | image | 7:4 | 2800×1600 | O | `/public/media/work-offline-expense-platform-gallery-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-uhf-rfid-scanner-cover` | image | 4:3 | 2400×1800 | R | `/public/media/work-uhf-rfid-scanner-cover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-uhf-rfid-scanner-hover` | image | 4:3 | 2400×1800 | O | `/public/media/work-uhf-rfid-scanner-hover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-uhf-rfid-scanner-preview` | video | 4:3 | 1600×1200 | O | `/public/media/work-uhf-rfid-scanner-preview(.mp4|.webm)` |
| `work-uhf-rfid-scanner-banner` | image | 14:9 | 2800×1800 | R | `/public/media/work-uhf-rfid-scanner-banner(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-uhf-rfid-scanner-gallery-01` | image | 5:4 | 1600×1280 | O | `/public/media/work-uhf-rfid-scanner-gallery-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-uhf-rfid-scanner-gallery-02` | image | 5:4 | 1600×1280 | O | `/public/media/work-uhf-rfid-scanner-gallery-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-uhf-rfid-scanner-gallery-03` | image | 7:4 | 2800×1600 | O | `/public/media/work-uhf-rfid-scanner-gallery-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-techsalary-lk-cover` | image | 4:3 | 2400×1800 | R | `/public/media/work-techsalary-lk-cover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-techsalary-lk-hover` | image | 4:3 | 2400×1800 | O | `/public/media/work-techsalary-lk-hover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-techsalary-lk-preview` | video | 4:3 | 1600×1200 | O | `/public/media/work-techsalary-lk-preview(.mp4|.webm)` |
| `work-techsalary-lk-banner` | image | 14:9 | 2800×1800 | R | `/public/media/work-techsalary-lk-banner(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-techsalary-lk-gallery-01` | image | 5:4 | 1600×1280 | O | `/public/media/work-techsalary-lk-gallery-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-techsalary-lk-gallery-02` | image | 5:4 | 1600×1280 | O | `/public/media/work-techsalary-lk-gallery-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-techsalary-lk-gallery-03` | image | 7:4 | 2800×1600 | O | `/public/media/work-techsalary-lk-gallery-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-ai-chatbot-backend-cover` | image | 4:3 | 2400×1800 | R | `/public/media/work-ai-chatbot-backend-cover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-ai-chatbot-backend-hover` | image | 4:3 | 2400×1800 | O | `/public/media/work-ai-chatbot-backend-hover(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-ai-chatbot-backend-preview` | video | 4:3 | 1600×1200 | O | `/public/media/work-ai-chatbot-backend-preview(.mp4|.webm)` |
| `work-ai-chatbot-backend-banner` | image | 14:9 | 2800×1800 | R | `/public/media/work-ai-chatbot-backend-banner(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-ai-chatbot-backend-gallery-01` | image | 5:4 | 1600×1280 | O | `/public/media/work-ai-chatbot-backend-gallery-01(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-ai-chatbot-backend-gallery-02` | image | 5:4 | 1600×1280 | O | `/public/media/work-ai-chatbot-backend-gallery-02(.webp|.jpg|.png|.avif|.jpeg)` |
| `work-ai-chatbot-backend-gallery-03` | image | 7:4 | 2800×1600 | O | `/public/media/work-ai-chatbot-backend-gallery-03(.webp|.jpg|.png|.avif|.jpeg)` |
| `logo-nestjs` | svg (white, 40px tall) | — | — | R | `/public/media/logo-nestjs(.svg)` |
| `logo-springboot` | svg (white, 40px tall) | — | — | R | `/public/media/logo-springboot(.svg)` |
| `logo-java` | svg (white, 40px tall) | — | — | R | `/public/media/logo-java(.svg)` |
| `logo-nextjs` | svg (white, 40px tall) | — | — | R | `/public/media/logo-nextjs(.svg)` |
| `logo-react` | svg (white, 40px tall) | — | — | R | `/public/media/logo-react(.svg)` |
| `logo-react-native` | svg (white, 40px tall) | — | — | R | `/public/media/logo-react-native(.svg)` |
| `logo-kotlin` | svg (white, 40px tall) | — | — | R | `/public/media/logo-kotlin(.svg)` |
| `logo-jetpack-compose` | svg (white, 40px tall) | — | — | R | `/public/media/logo-jetpack-compose(.svg)` |
| `logo-typescript` | svg (white, 40px tall) | — | — | R | `/public/media/logo-typescript(.svg)` |
| `logo-postgresql` | svg (white, 40px tall) | — | — | R | `/public/media/logo-postgresql(.svg)` |
| `logo-mysql` | svg (white, 40px tall) | — | — | R | `/public/media/logo-mysql(.svg)` |
| `logo-timescaledb` | svg (white, 40px tall) | — | — | R | `/public/media/logo-timescaledb(.svg)` |
| `logo-mongodb` | svg (white, 40px tall) | — | — | R | `/public/media/logo-mongodb(.svg)` |
| `logo-firebase` | svg (white, 40px tall) | — | — | R | `/public/media/logo-firebase(.svg)` |
| `logo-docker` | svg (white, 40px tall) | — | — | R | `/public/media/logo-docker(.svg)` |
| `logo-kubernetes` | svg (white, 40px tall) | — | — | R | `/public/media/logo-kubernetes(.svg)` |
| `logo-azure` | svg (white, 40px tall) | — | — | R | `/public/media/logo-azure(.svg)` |
| `logo-github-actions` | svg (white, 40px tall) | — | — | R | `/public/media/logo-github-actions(.svg)` |
| `logo-openai` | svg (white, 40px tall) | — | — | R | `/public/media/logo-openai(.svg)` |
| `logo-socketio` | svg (white, 40px tall) | — | — | R | `/public/media/logo-socketio(.svg)` |
