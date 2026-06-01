// Shared flag: true when the current navigation was triggered by back/forward.
// Set by popstate listener in PageTransition, read by Reveal on mount,
// reset after all components have mounted.
export const navState = { isBack: false }
