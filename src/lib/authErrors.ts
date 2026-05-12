import { FirebaseError } from 'firebase/app';

const authErrorMessages: Record<string, string> = {
  'auth/account-exists-with-different-credential':
    'An account already exists for this email with a different sign-in method.',
  'auth/email-already-in-use': 'That email already has a BloomBox account. Try signing in instead.',
  'auth/invalid-credential': 'Those details do not match an account. Please check and try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
  'auth/too-many-requests': 'Too many attempts. Please wait a little while before trying again.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account was found for this email.',
  'auth/weak-password': 'Please use a password with at least 6 characters.',
  'auth/wrong-password': 'The password is incorrect.',
};

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return authErrorMessages[error.code] ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
