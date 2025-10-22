import { SummaryScreen } from '@/src/screens/SummaryScreen';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const router = useRouter();
  return <SummaryScreen navigation={router} />;
}
