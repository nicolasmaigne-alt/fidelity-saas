'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getRestaurant } from '@/lib/firebase/restaurants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Restaurant } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const restaurantData = await getRestaurant(user.uid);
      setRestaurant(restaurantData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {restaurant?.name}
          </h1>
          <div className="flex gap-2">
            <Link href="/dashboard/scanner">
              <Button variant="primary">📷 Scanner</Button>
            </Link>
            <Button onClick={() => auth.signOut()} variant="secondary">
              Déconnexion
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">0</div>
              <div className="text-gray-600 mt-2">Clients actifs</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">0</div>
              <div className="text-gray-600 mt-2">Visites ce mois</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">0</div>
              <div className="text-gray-600 mt-2">Récompenses distribuées</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Programme de fidélité">
            <p className="text-gray-600 mb-4">
              Configurez votre programme de fidélité
            </p>
            <Button>Configurer</Button>
          </Card>

          <Card title="Scanner QR Code">
            <p className="text-gray-600 mb-4">
              Scannez les cartes de vos clients
            </p>
            <Link href="/dashboard/scanner">
              <Button>Ouvrir le scanner</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}