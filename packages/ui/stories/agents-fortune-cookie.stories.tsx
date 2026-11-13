import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { FortuneCookie } from "../src/agents/fortune-cookie.tsx";
import { sampleCookie } from "./support/cookie-sample.tsx";

const meta = {
  title: "Agents/FortuneCookie",
  component: FortuneCookie,
  parameters: {
    docs: {
      description: {
        component:
          "A fortune cookie hiding a figure (`art`: the cookie's three states as `<Image fill />` and where its paper sits). Pressing cracks it, releasing opens it. Then the folded paper slides out, rests in front of the halves and unfolds, and `link` rises under it. `trigger` arrival opens it by itself once it is well into the screen. Reduced motion: open.",
      },
    },
  },
  args: {
    art: sampleCookie,
    trigger: "click",
    label: "Casser le biscuit",
    cursor: "Casser",
    figure: "20",
    unit: "%",
    prefix: "Jusqu’à",
    fortune: "de votre facture remboursés en crédit d’impôt.",
    link: <a href="#questions">Voir les conditions</a>,
  },
  render: (args) => (
    <div className="mx-auto max-w-prose">
      <FortuneCookie {...args} />
    </div>
  ),
} satisfies Meta<typeof FortuneCookie>;

export default meta;

type Story = StoryObj<typeof meta>;

/* Settled once the button has given way to the paper. */
async function waitUntilOpen(query: () => HTMLElement | null): Promise<void> {
  await waitFor(
    async () => {
      await expect(query()).toBeNull();
    },
    { timeout: 4000 },
  );
}

export const Crack: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Casser le biscuit" });
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);

    await waitUntilOpen(() => canvas.queryByRole("button", { name: "Casser le biscuit" }));
    await expect(canvas.getByText("de votre facture remboursés en crédit d’impôt.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Voir les conditions" })).toBeVisible();
  },
};
