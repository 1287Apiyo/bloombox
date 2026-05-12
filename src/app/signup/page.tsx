import SignupPage from '../components/SignupPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <SignupPage />
    </Suspense>
  );
}
