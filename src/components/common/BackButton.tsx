import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate(); // Get the navigate function

  const handleGoBack = () => {
    navigate(-1); // Navigate back one step in history
  };

  return (
    <Button
      variant="ghost" // Or any variant you prefer
      size="icon" // Use icon size if you only have an icon
      className="size-7"
      onClick={handleGoBack}
      // {...props} // Spread other props if extending ButtonProps
    >
      <ArrowLeft className="size-4" /> {/* Icon */}
      {/* <span className="sr-only">Go back</span> */} {/* Optional: screen-reader text */}
      {/* Or use text: Go Back */}
    </Button>
  );
};

export { BackButton };