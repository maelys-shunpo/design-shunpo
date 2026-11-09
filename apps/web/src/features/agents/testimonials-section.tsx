import { Testimonial } from "@repo/ui/agents/testimonial";
import { TestimonialCascade } from "@repo/ui/agents/testimonial-cascade";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { testimonials } from "../shunpo/testimonials";
import { TestimonialsCopy } from "./testimonials-copy";

const tones = ["ink", "cobalt", "mint", "warm"] as const;

const pairs = Math.ceil(testimonials.length / 2);

const labels = {
  pages: Array.from(
    { length: pairs },
    (_, page) =>
      `Avis ${String(page * 2 + 1)} et ${String(page * 2 + 2)}, page ${String(page + 1)} sur ${String(pairs)}`,
  ),
  pause: "Mettre les avis en pause",
  play: "Reprendre le défilement des avis",
};

/* The title on one half, the clients' own words stepping down on the other. */
export function TestimonialsSection() {
  return (
    <Section id="avis" spacing="breath">
      <PageGrid rows="xl" align="center">
        <GridArea columns={{ lg: { start: 1, span: 5 } }}>
          <TestimonialsCopy />
        </GridArea>
        <GridArea columns={{ lg: { start: 7, span: 6 } }}>
          <TestimonialCascade label="Avis de clients" labels={labels}>
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={testimonial.id}
                quote={testimonial.quote}
                author={testimonial.author}
                position={testimonial.position}
                initials={testimonial.initials}
                tone={tones[index % tones.length]}
              />
            ))}
          </TestimonialCascade>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
