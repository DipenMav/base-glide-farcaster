export const isMiniApp = () => {
  try {
    return window?.location?.search?.includes("miniApp=true");
  } catch {
    return false;
  }
};
