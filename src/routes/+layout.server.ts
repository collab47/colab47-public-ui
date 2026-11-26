import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  try {
    const session = await event.locals.auth();
    return {
      session,
    };
  } catch (err) {
    console.warn('[Collab47 Auth] Failed to read session in layout load:', err);
    return {
      session: null,
    };
  }
};
