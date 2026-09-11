import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useConsent } from "@/lib/cookies/use-consent";
import {
  cookieConfig,
  getOptionalCategories,
  getCookiesByCategory,
  type CookieCategory,
} from "@/lib/config/cookies";
/**
 * Cookie Preferences Modal — accessible dialog with category toggles
 * and a detailed cookie audit table.
 *
 * Uses Radix Dialog for keyboard navigation and focus trapping.
 */
const CookiePreferencesModal = () => {
  const { isPreferencesOpen, closePreferences, consent, saveCustom } = useConsent();
  const [prefs, setPrefs] = useState<Record<CookieCategory, boolean>>(consent.categories);
  useEffect(() => {
    if (isPreferencesOpen) {
      setPrefs(consent.categories);
    }
  }, [isPreferencesOpen, consent]);
  const handleToggle = (cat: CookieCategory, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [cat]: value }));
  };
  const handleSave = () => {
    saveCustom(prefs);
    closePreferences();
  };
  const optionalCategories = getOptionalCategories();
  return (
    <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie settings. Necessary cookies are always enabled and cannot be disabled
            as they are essential for the site to function.
          </DialogDescription>
        </DialogHeader>
        {/* Category toggles */}
        <div className="space-y-4">
          {/* Always-on: Necessary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {cookieConfig.categories[0].label}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cookieConfig.categories[0].description}
                </p>
              </div>
              <Switch checked disabled aria-label="Necessary cookies (always on)" />
            </div>
          </div>
          {/* Toggleable categories */}
          {optionalCategories.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                </div>
                <Switch
                  checked={prefs[cat.id] ?? false}
                  onCheckedChange={(value) => handleToggle(cat.id, value)}
                  aria-label={`${cat.label} cookies`}
                />
              </div>
              {/* Cookie audit table for this category */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-1.5 pr-3 font-medium">Name</th>
                      <th className="pb-1.5 pr-3 font-medium">Provider</th>
                      <th className="pb-1.5 pr-3 font-medium">Purpose</th>
                      <th className="pb-1.5 pr-3 font-medium">Expiry</th>
                      <th className="pb-1.5 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCookiesByCategory(cat.id).map((cookie) => (
                      <tr key={cookie.name} className="border-b border-border/50">
                        <td className="py-1.5 pr-3 font-mono text-foreground">{cookie.name}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">{cookie.provider}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">{cookie.purpose}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">{cookie.expiration}</td>
                        <td className="py-1.5 text-muted-foreground">{cookie.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              const allFalse = {} as Record<CookieCategory, boolean>;
              for (const c of cookieConfig.categories) allFalse[c.id] = c.alwaysEnabled;
              setPrefs(allFalse);
            }}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => {
              const allTrue = {} as Record<CookieCategory, boolean>;
              for (const c of cookieConfig.categories) allTrue[c.id] = true;
              setPrefs(allTrue);
            }}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Save Preferences
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default CookiePreferencesModal;