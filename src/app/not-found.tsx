/** 404 STUB (DESIGN.md §3.13). */
import { notFound as copy } from "@/content/site";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { RevealText } from "@/components/motion/RevealText";

export default function NotFound() {
  return (
    <section className="section-layer flex flex-col items-center px-[var(--gutter)] pb-[100px] pt-[216px] text-center">
      <RevealText as="h1" mode="chars" trigger="mount" className="type-h2">
        {copy.title}
      </RevealText>
      <p className="type-lead mt-4 text-ink">{copy.lead}</p>
      <p className="type-body mt-3 max-w-[360px] text-ink-soft">{copy.body}</p>
      <div className="mt-10">
        <PrimaryButton href="/" transitionTitle="Home">
          {copy.cta}
        </PrimaryButton>
      </div>
    </section>
  );
}
