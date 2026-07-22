import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log In',
};

export default function LoginPage() {
  return <LoginForm />;
}
