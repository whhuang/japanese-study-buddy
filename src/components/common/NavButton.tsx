import * as React from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

// Define the props for our NavButton component
interface NavButtonProps {
  to: NavLinkProps["to"];
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  buttonClassName?: string;
  end?: NavLinkProps["end"];
}

const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  (
    { to, children, variant, size, buttonClassName, end, ...props },
    ref
  ) => {
    return (
      <Button
        asChild
        variant={variant}
        size={size}
        className={cn(buttonClassName)}
        ref={ref}
        {...props}
      >
        <NavLink
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "transition-colors hover:text-primary",
              !isActive ? "text-muted-foreground" : "",
            )
          }
        >
          {children}
        </NavLink>
      </Button>
    );
  }
);
NavButton.displayName = "NavButton";

export { NavButton };