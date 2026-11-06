import { ShunpoLogo } from "../brand/shunpo-logo.tsx";
import { cn } from "../lib/cn.ts";
import { FilButton } from "./fil-button.tsx";

interface HeaderLink {
  href: string;
  label: string;
}

interface HeaderAction extends HeaderLink {
  /* Shown on phones, where the full label would crowd the logo. */
  shortLabel: string;
}

interface FilHeaderProps {
  homeHref: string;
  links: HeaderLink[];
  action: HeaderAction;
  className?: string;
}

/* Laid over the first window and left behind with it, so the threads take the whole screen once scrolled. */
export function FilHeader({ homeHref, links, action, className }: FilHeaderProps) {
  return (
    <header
      data-slot="fil-header"
      className={cn("absolute inset-x-0 top-0 z-20 text-foreground", className)}
    >
      <div className="mx-auto flex w-full max-w-wide items-center justify-between gap-6 p-5 md:px-10 md:py-8">
        <a href={homeHref} className="inline-flex min-h-12 items-center rounded-md">
          <ShunpoLogo size="sm" label="SHUNPO, accueil" />
        </a>
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group/fil-link relative inline-flex min-h-12 items-center text-sm font-medium"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-2 h-0.5 origin-right scale-x-0 rounded-full bg-accent transition-transform duration-300 ease-emphasized group-hover/fil-link:origin-left group-hover/fil-link:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <FilButton href={action.href} aria-label={action.label}>
          <span className="md:hidden">{action.shortLabel}</span>
          <span className="hidden md:inline">{action.label}</span>
        </FilButton>
      </div>
    </header>
  );
}
