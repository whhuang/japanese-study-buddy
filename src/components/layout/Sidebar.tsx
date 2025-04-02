// Example: Inside your Sidebar.tsx or Header.tsx component
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming you added Button
import { cn } from '@/lib/utils'; // shadcn utility for class names

function Sidebar() {
  // ...

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {/* Example NavLink wrapped by shadcn Button */}
      <Button asChild variant="ghost" className="w-full justify-start">
        {/* NavLink receives function to check active state */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "transition-colors hover:text-primary", // Base classes
              !isActive && "text-muted-foreground"   // Style if not active
              // Active styles often handled by parent/variant or explicitly
            )
          }
          end // Use 'end' for the home/index route to avoid partial matching
        >
          Home
        </NavLink>
      </Button>

      <Button asChild variant="ghost" className="w-full justify-start">
        <NavLink
          to="/vocabulary"
           className={({ isActive }) =>
            cn(
              "transition-colors hover:text-primary",
              !isActive && "text-muted-foreground"
            )
          }
        >
          Vocabulary List
        </NavLink>
      </Button>

      <Button asChild variant="ghost" className="w-full justify-start">
        <NavLink
          to="/settings" // Example settings route
           className={({ isActive }) =>
            cn(
              "transition-colors hover:text-primary",
              !isActive && "text-muted-foreground"
            )
          }
        >
          Settings
        </NavLink>
      </Button>

      {/* Add more links */}
    </nav>
  );
}

export default Sidebar;