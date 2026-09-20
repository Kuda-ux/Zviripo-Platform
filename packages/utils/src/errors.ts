export interface HumanError {
  title: string;
  detail: string;
  /** True when the failure is connectivity-related and a retry is likely to succeed. */
  offline: boolean;
  /** True when the user's local data is intact (nothing was lost). */
  dataSafe: boolean;
}

interface ErrorLike {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

const NETWORK = /network|fetch|timeout|failed to fetch|econn|socket|offline|abort/i;
const AUTH = /jwt|token|session|not authenticated|invalid login|invalid credentials|401/i;
const RLS = /row-level security|permission denied|42501|403/i;
const NOT_FOUND = /PGRST116|not found|no rows|404/i;
const DUPLICATE = /23505|duplicate key|already exists/i;
const SCHEMA = /schema cache|PGRST205|relation .* does not exist|42P01/i;

/**
 * Maps technical failures (PostgREST, Supabase Auth, fetch, JS errors) into
 * product language. Never surfaces raw codes or stack text to users.
 */
export function humanizeError(
  error: unknown,
  context: 'load' | 'save' | 'auth' = 'load',
): HumanError {
  const e = (error ?? {}) as ErrorLike;
  const text = `${e.code ?? ''} ${e.status ?? ''} ${e.name ?? ''} ${e.message ?? ''}`;

  if (NETWORK.test(text)) {
    return {
      title: "You're offline",
      detail:
        context === 'save'
          ? 'Your information is still here. We will try again when you are back online.'
          : 'We will load this when you are back online.',
      offline: true,
      dataSafe: true,
    };
  }
  if (AUTH.test(text)) {
    return {
      title: context === 'auth' ? "We couldn't sign you in" : 'Please sign in again',
      detail:
        context === 'auth'
          ? 'Check your email and password and try again.'
          : 'Your session ended. Sign in to continue — nothing was lost.',
      offline: false,
      dataSafe: true,
    };
  }
  if (RLS.test(text)) {
    return {
      title: "You don't have access to that",
      detail: 'This belongs to a different business or account.',
      offline: false,
      dataSafe: true,
    };
  }
  if (DUPLICATE.test(text)) {
    return {
      title: 'That already exists',
      detail: 'Nothing was duplicated. Refresh to see the latest.',
      offline: false,
      dataSafe: true,
    };
  }
  if (NOT_FOUND.test(text)) {
    return {
      title: "We couldn't find that",
      detail: 'It may have been removed or is no longer available.',
      offline: false,
      dataSafe: true,
    };
  }
  if (SCHEMA.test(text)) {
    return {
      title: 'Zviripo is being updated',
      detail: 'Part of the service is not ready yet. Please try again shortly.',
      offline: false,
      dataSafe: true,
    };
  }
  return context === 'save'
    ? {
        title: "We couldn't save that",
        detail: 'Your information is still here. Try again.',
        offline: false,
        dataSafe: true,
      }
    : {
        title: "Something didn't work",
        detail: 'Please try again in a moment.',
        offline: false,
        dataSafe: true,
      };
}
