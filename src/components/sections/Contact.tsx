"use client";

/**
 * Contact `#contact` (DESIGN.md §3.11, portvio CTA). Photo container enters on a 7° slanted
 * clip-path that straightens (U12) with a scrubbed background zoom (U11); right-aligned glass
 * card with the form. Static export: POST JSON to NEXT_PUBLIC_FORM_ENDPOINT, else mailto.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { ScrollZoom } from "@/components/motion/ScrollZoom";
import { RollText } from "@/components/motion/RollText";
import { SlotSwap } from "@/components/motion/SlotSwap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { SubmitButton, type SubmitState } from "@/components/ui/SubmitButton";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { isPlus, SCRUB, SPRING_SAMPLES } from "@/lib/motion-tokens";
import { contact, mailto, site } from "@/content/site";
import { cn } from "@/lib/cn";

type FieldName = keyof typeof contact.fields;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "type-input h-[54px] w-full rounded-sm border border-white/30 bg-white/10 p-4 text-ink placeholder:text-white/65 transition-colors duration-200 focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-error";

function Field({
  name,
  error,
  textarea,
  className,
}: {
  name: FieldName;
  error?: string;
  textarea?: boolean;
  className?: string;
}) {
  const f = contact.fields[name];
  const id = `contact-${name}`;
  const errId = `${id}-error`;
  const common = {
    id,
    name,
    placeholder: f.placeholder,
    autoComplete: f.autoComplete,
    required: true,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errId : undefined,
  } as const;
  return (
    <div data-field="" className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[16px] font-medium leading-[1.4] text-ink">
        {f.label}
      </label>
      {textarea ? (
        <textarea {...common} rows={4} className={cn(inputClass, "h-auto resize-y")} />
      ) : (
        <input {...common} type={name === "email" ? "email" : "text"} className={inputClass} />
      )}
      {error && (
        <p id={errId} className="type-small text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      data-cursor="copy"
      aria-label={copied ? "Email address copied" : `Copy email address ${site.email}`}
      onClick={() => {
        void navigator.clipboard?.writeText(site.email).then(
          () => setCopied(true),
          () => window.open(mailto, "_self"),
        );
      }}
      className="type-body text-ink"
    >
      <SlotSwap a={<RollText>{site.email}</RollText>} b={<span>Copied</span>} active={copied} />
    </button>
  );
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  useMotion(
    ({ reduce }) => {
      const section = sectionRef.current;
      const clip = clipRef.current;
      const card = cardRef.current;
      if (!section || !clip || !card || reduce) return;
      // U12: slanted entry (left high, right low) that straightens.
      if (isPlus) {
        gsap.fromTo(
          clip,
          { clipPath: "polygon(0% 0%, 100% 12.28vw, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0vw, 100% 100%, 0% 100%)",
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: SCRUB, invalidateOnRefresh: true },
          },
        );
      }
      // Fields stagger in after the card reveal.
      const fields = card.querySelectorAll<HTMLElement>("[data-field]");
      const t = gsap.fromTo(
        fields,
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: SPRING_SAMPLES.springUI.duration,
          ease: "springUI",
          stagger: 0.06,
          delay: 0.5,
          paused: true,
          clearProps: "transform",
        },
      );
      onceInView(card, () => t.play(), { settle: () => t.progress(1) });
    },
    { scope: sectionRef },
  );

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company_website") ?? "")) return; // honeypot
    const values = {
      firstName: String(data.get("firstName") ?? "").trim(),
      lastName: String(data.get("lastName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    const next: Partial<Record<FieldName, string>> = {};
    if (!values.firstName) next.firstName = "Please enter your first name.";
    if (!values.lastName) next.lastName = "Please enter your last name.";
    if (!EMAIL_RE.test(values.email)) next.email = "Please enter a valid email address.";
    if (!values.message) next.message = "Please write a short message.";
    setErrors(next);
    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) {
      setStatus("Please check the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const name = `${values.firstName} ${values.lastName}`;
    if (!contact.endpoint) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${values.message}\n\n${name}\n${values.email}`);
      window.open(`${mailto}?subject=${subject}&body=${body}`, "_self");
      setState("success");
      setStatus("Your email app should open with the message ready to send.");
      return;
    }
    setState("loading");
    setStatus("Sending…");
    try {
      const res = await fetch(contact.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, ...values }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("success");
      setStatus("Thanks, your message was sent. I'll reply by email.");
      form.reset();
    } catch {
      setState("error");
      setStatus(`Something went wrong. Please try again or email ${site.email}.`);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-title"
      className="section-layer pb-20 md:pb-[100px] lg:pb-[140px]"
    >
      <div
        ref={clipRef}
        className="relative mx-auto max-w-[1440px] overflow-hidden px-[var(--gutter)] pb-[50px] pt-[300px] lg:min-h-[100svh] lg:pt-[380px]"
      >
        {/* Background: full-bleed on tablet / desktop; 4:5 on top on phone */}
        <ScrollZoom from={1.18} parallax className="absolute inset-0 hidden md:block">
          <MediaSlot id="contact-bg" fill sizes="100vw" />
        </ScrollZoom>
        <ScrollZoom from={1.18} parallax className="absolute inset-x-0 top-0 aspect-[4/5] md:hidden">
          <MediaSlot id="contact-bg-mobile" fill sizes="100vw" />
        </ScrollZoom>

        <Reveal variant="card" delay={0.2} className="relative ml-auto w-full md:w-[70%] lg:w-[600px]">
          <div
            ref={cardRef}
            className="border-overlay-glass edge-light flex flex-col gap-[30px] rounded-[20px] p-6 md:p-10"
            style={{
              background: "rgba(18,16,16,.38)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
            }}
          >
            <div className="flex flex-col gap-4">
              <Eyebrow>{contact.eyebrow}</Eyebrow>
              <RevealText as="h2" id="contact-title" mode="chars" stagger={0.02} className="type-statement text-ink">
                {contact.title}
              </RevealText>
              <p className="type-body text-white/80">{contact.subline}</p>
            </div>

            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field name="firstName" error={errors.firstName} />
                <Field name="lastName" error={errors.lastName} />
              </div>
              <Field name="email" error={errors.email} />
              <Field name="message" error={errors.message} textarea />
              {/* Honeypot: hidden from people and assistive tech */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="contact-company">Company website</label>
                <input id="contact-company" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div data-field="">
                <SubmitButton state={state} successLabel={contact.success}>
                  {contact.submit}
                </SubmitButton>
              </div>
              <p role="status" aria-live="polite" className="type-small min-h-[1.4em] text-white/80">
                {status}
              </p>
            </form>

            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              <li>
                <CopyEmail />
              </li>
              <li>
                <a href={site.phoneHref} className="type-body text-ink">
                  <RollText>{site.phone}</RollText>
                </a>
              </li>
              {[site.socials.linkedin, site.socials.github].map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="type-body text-ink">
                    <RollText>{s.label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
