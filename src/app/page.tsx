import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import TechStack from "@/components/sections/TechStack";
import Expertise from "@/components/sections/Expertise";
import Process from "@/components/sections/Process";
import Work from "@/components/sections/Work";
import Impact from "@/components/sections/Impact";
import Experience from "@/components/sections/Experience";
import Showreel from "@/components/sections/Showreel";
import Contact from "@/components/sections/Contact";

/** Homepage in DESIGN.md §3.0 order. */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <TechStack />
      <Expertise />
      <Process />
      <Work />
      <Impact />
      <Experience />
      <Showreel />
      <Contact />
    </>
  );
}
