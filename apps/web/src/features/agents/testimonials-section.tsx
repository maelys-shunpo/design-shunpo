import { Testimonial } from "@repo/ui/agents/testimonial";
import { TestimonialDrift } from "@repo/ui/agents/testimonial-drift";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { testimonials } from "../shunpo/testimonials";
import { TestimonialsCopy } from "./testimonials-copy";

const tones = ["ink", "cobalt", "mint", "warm"] as const;

/* The title and ratings centred on top, the clients' own words drifting in two columns below them, all on one axis. */
export function TestimonialsSection() {
  return (
    <Section id="avis" spacing="breath">
      <PageGrid rows="xl">
        <GridArea columns={{ md: 10, lg: 8 }}>
          <TestimonialsCopy />
        </GridArea>
        <GridArea>
          <TestimonialDrift label="Avis de clients">
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
          </TestimonialDrift>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
