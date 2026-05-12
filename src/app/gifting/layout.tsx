import { AuthGuard } from '../components/AuthGuard';

export default function GiftingLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
