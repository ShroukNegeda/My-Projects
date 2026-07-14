'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { SpeakerSignup1 } from '../speaker-signup-1/SpeakerSignup';

export default function Page() {
  const router = useRouter();
  const app = useApp();
  const setPage = (route) => {
    const map = {'landing':'/landing','events':'/events','event-detail':'/event-detail','my-tickets':'/my-tickets','favorites':'/favorites','help':'/help-and-support','vodafone-cash':'/vodafone-cash','login':'/login','signup':'/signup','introduce-yourself':'/introduce-yourself','forgot-password':'/forgot-password','confirm-email':'/confirm-email','profile':'/profile','organizer-profile':'/organizer-profile','speaker-profile':'/speaker-profile','sponsor-profile':'/sponsor-profile','organizer-dashboard':'/organizer-dashboard','create-event':'/create-event','speaker-dashboard':'/speaker-dashboard','join-as-speaker':'/join-as-speaker','sponsor-dashboard':'/sponsor-dashboard','sponsorship-tiers':'/sponsorship-tiers','organizer-signup-1':'/organizer-signup-1','organizer-signup-2':'/organizer-signup-2','organizer-signup-3':'/organizer-signup-3','speaker-signup-1':'/speaker-signup-1','speaker-signup-2':'/speaker-signup-2','speaker-signup-3':'/speaker-signup-3','sponsor-signup-1':'/sponsor-signup-1','sponsor-signup-2':'/sponsor-signup-2','sponsor-signup-3':'/sponsor-signup-3','dashboard':'/landing','home':'/landing'};
    router.push(map[route] || `/${route}`);
  };
  return <SpeakerSignup1 {...app} setPage={setPage} />;
}
