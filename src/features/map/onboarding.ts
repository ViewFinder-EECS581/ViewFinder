export const ONBOARDING_STORAGE_KEY = "viewfinder:first-visit-onboarding";
const ONBOARDING_CHANGE_EVENT = "viewfinder:onboarding-change";
let onboardingDismissedInMemory = false;

export function hasDismissedOnboarding(
  storage: Pick<Storage, "getItem">,
): boolean {
  return storage.getItem(ONBOARDING_STORAGE_KEY) === "dismissed";
}

export function rememberOnboardingDismissal(
  storage: Pick<Storage, "setItem">,
): void {
  onboardingDismissedInMemory = true;
  try {
    storage.setItem(ONBOARDING_STORAGE_KEY, "dismissed");
  } finally {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT));
    }
  }
}

export function getOnboardingDismissedSnapshot(): boolean {
  if (onboardingDismissedInMemory) return true;
  try {
    return hasDismissedOnboarding(window.localStorage);
  } catch {
    return false;
  }
}

export function subscribeToOnboarding(
  onStoreChange: () => void,
): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === ONBOARDING_STORAGE_KEY) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ONBOARDING_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ONBOARDING_CHANGE_EVENT, onStoreChange);
  };
}
