import { Testimonial } from "@repo/ui/agents/testimonial";
import { TestimonialCascade } from "@repo/ui/agents/testimonial-cascade";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { testimonials } from "../shunpo/testimonials";
import { TestimonialsCopy } from "./testimonials-copy";

const tones = ["ink", "cobalt", "mint"] as const;

/* The title on one half, the clients' own words stepping down on the other. */
export function TestimonialsSection() {
  return (
    <Section id="avis" spacing="breath">
      <PageGrid rows="xl" align="center">
        <GridArea columns={{ lg: { start: 1, span: 5 } }}>
          <TestimonialsCopy />
        </GridArea>
        <GridArea columns={{ lg: { start: 7, span: 6 } }}>
          <TestimonialCascade label="Avis de clients">
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
