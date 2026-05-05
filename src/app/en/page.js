import LandingPage from '@/components/LandingPage';
import { getLang } from '@/lib/i18n';

export default function HomePageEn() {
  return <LandingPage t={getLang('en')} locale="en" />;
}
