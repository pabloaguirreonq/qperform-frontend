// Token Manager Service
// Prevents concurrent interactive token acquisitions that cause "interaction_in_progress" errors

let activeInteractiveRequest: Promise<void> | null = null

/**
 * Ensures only one interactive token acquisition happens at a time
 * Other requests wait for the active one to complete before proceeding
 */
export async function acquireTokenWithLock<T>(
  acquireFunction: () => Promise<T>
): Promise<T> {
  // If there's an active interactive request, wait for it to complete
  if (activeInteractiveRequest) {
    await activeInteractiveRequest
  }

  // Try to acquire the token
  try {
    let resolveInteractive: () => void
    activeInteractiveRequest = new Promise<void>(resolve => {
      resolveInteractive = resolve
    })

    const result = await acquireFunction()

    // Clear the active request
    activeInteractiveRequest = null
    resolveInteractive!()

    return result
  } catch (error) {
    // Clear the active request even on error
    activeInteractiveRequest = null
    throw error
  }
}

/**
 * Check if there's currently an active interactive authentication
 */
export function isInteractionInProgress(): boolean {
  return activeInteractiveRequest !== null
}
