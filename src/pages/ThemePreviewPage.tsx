import { cn } from "@/lib/utils";

// Helper component for displaying a color swatch
const ColorSwatch = ({ name, className }: { name: string; className: string }) => (
  <div className="flex items-center space-x-2 mb-2 border p-2 rounded">
    <div className={cn("size-8 rounded border", className)}></div>
    <span className="text-sm font-mono">{name} ({className})</span>
  </div>
);

// Helper component for displaying text color
const TextColorSample = ({ name, className }: { name: string; className: string }) => (
   <div className={cn("mb-2 border p-2 rounded", className)}>
        <span className="text-sm font-mono">{name} ({className})</span> - Lorem ipsum dolor sit amet.
    </div>
);


// Main Preview Component
function ThemePreviewPage() {
  return (
    <div className="p-4 border rounded-lg bg-background"> {/* Use background to test contrast */}
      <h3 className="text-lg font-semibold mb-4">Theme Colors</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <h4 className="font-medium mb-2">Backgrounds:</h4>
            <ColorSwatch name="Background" className="bg-background" />
            <ColorSwatch name="Foreground (on Background)" className="bg-foreground" /> {/* Usually dark/light */}
            <ColorSwatch name="Card" className="bg-card" />
            <ColorSwatch name="Popover" className="bg-popover" />
            <ColorSwatch name="Primary" className="bg-primary" />
            <ColorSwatch name="Secondary" className="bg-secondary" />
            <ColorSwatch name="Muted" className="bg-muted" />
            <ColorSwatch name="Accent" className="bg-accent" />
            <ColorSwatch name="Destructive" className="bg-destructive" />
            <ColorSwatch name="Border" className="bg-border" />
            <ColorSwatch name="Input" className="bg-input" />
            <ColorSwatch name="Ring" className="bg-ring" />
        </div>

        <div>
            <h4 className="font-medium mb-2">Text/Foregrounds:</h4>
            {/* Apply text color to parent div to see it on default background */}
            <TextColorSample name="Foreground" className="text-foreground" />
            <TextColorSample name="Primary Foreground" className="text-primary-foreground bg-primary" /> {/* Show on primary bg */}
            <TextColorSample name="Secondary Foreground" className="text-secondary-foreground bg-secondary" /> {/* Show on secondary bg */}
            <TextColorSample name="Card Foreground" className="text-card-foreground bg-card" /> {/* Show on card bg */}
            <TextColorSample name="Popover Foreground" className="text-popover-foreground bg-popover" /> {/* Show on popover bg */}
            <TextColorSample name="Muted Foreground" className="text-muted-foreground" />
            <TextColorSample name="Accent Foreground" className="text-accent-foreground bg-accent" /> {/* Show on accent bg */}
            <TextColorSample name="Destructive Foreground" className="text-destructive-foreground bg-destructive" />{/* Show on destructive bg */}
        </div>
      </div>
    </div>
  );
}

export default ThemePreviewPage;