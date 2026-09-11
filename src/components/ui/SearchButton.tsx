import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { IconButton } from "./IconButton";
import VisuallyHidden from "./VisuallyHidden";
/**
 * Search trigger button. Navigates to the /search page.
 */
const SearchButton = () => {
  const navigate = useNavigate();
  return (
    <IconButton
      variant="ghost"
      size="sm"
      label="Search articles"
      onClick={() => navigate("/search")}
      className="gap-1.5"
    >
      <Search className="h-4 w-4" aria-hidden />
      <VisuallyHidden>Search articles</VisuallyHidden>
    </IconButton>
  );
};
export default SearchButton;