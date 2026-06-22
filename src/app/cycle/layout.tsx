import { AuthGuard } from '../components/AuthGuard';

export default function CycleLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
