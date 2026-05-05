import LandingPage from '@/components/LandingPage';
import { getLang } from '@/lib/i18n';

export default function HomePage() {
  return <LandingPage t={getLang('ru')} locale="ru" />;
}
