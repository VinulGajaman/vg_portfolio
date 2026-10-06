/**
 * Meta row (DESIGN.md §4.1 item 2): Company · Role · Stack · Year, 4 columns space-between
 * (2×2 on phone). Label `body` ink-soft over value `lead` white. Cascade y 30 → 0 + autoAlpha at
 * .4 / .6 / .8 / 1.0 after the intro gate.
 */
import { Reveal } from "@/components/motion/Reveal";

export type MetaItem = { label: string; value: string };

export function MetaRow({ items }: { items: MetaItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-5 gap-y-8 md:flex md:justify-between md:gap-10">
      {items.map((item, i) => (
        <Reveal
          key={item.label}
          trigger="intro"
          delay={0.4 + i * 0.2}
          className="flex min-w-0 flex-col gap-2 md:max-w-[320px]"
        >
          <dt className="type-body text-ink-soft">{item.label}</dt>
          <dd className="type-lead m-0 text-ink">{item.value}</dd>
        </Reveal>
      ))}
    </dl>
  );
}
