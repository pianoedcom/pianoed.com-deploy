import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { IconButton } from "./IconButton";
import VisuallyHidden from "./VisuallyHidden";
import { cn } from "@/lib/utils";
/**
 * Search trigger button. Navigates to the /search page.
 */
interface SearchButtonProps {
  className?: string;
}

const SearchButton = ({ className }: SearchButtonProps) => {
  const navigate = useNavigate();
  return (
    <IconButton
      variant="ghost"
      size="sm"
      label="Search articles"
      onClick={() => navigate("/search")}
      className={cn(
        "text-[#f5ecd7] hover:text-[#d4af37] hover:bg-white/10 transition-colors focus-visible:outline-[#d4af37]",
        className
      )}
    >
      <Search className="h-4 w-4" aria-hidden />
      <VisuallyHidden>Search articles</VisuallyHidden>
    </IconButton>
  );
};
export default SearchButton;