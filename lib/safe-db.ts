/**
 * Turns an optional backend into a non-blocking dependency for public pages.
 * The fallback is returned for connection errors, missing environment variables,
 * Prisma validation errors and any other query failure.
 */
export async function safeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error("safeQuery: database read failed", error);
    return fallback;
  }
}
