import { AuthGuard } from '../components/AuthGuard';

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
