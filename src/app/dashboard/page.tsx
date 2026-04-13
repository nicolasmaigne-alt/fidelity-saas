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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white mx-auto"></div>
          <p className="mt-6 text-2xl text-white font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-red-600">❌ Restaurant introuvable</p>
          <Button onClick={() => router.push('/auth/login')} className="mt-4">
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🍽️ {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-500">
                  Plan: <span className="font-semibold capitalize text-blue-600">{restaurant.plan}</span>
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{restaurant.email}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href="/dashboard/scanner">
                <Button variant="primary" className="flex items-center gap-2">
                  📷 Scanner
                </Button>
              </Link>
              <Button 
                onClick={() => auth.signOut()} 
                variant="secondary"
                className="flex items-center gap-2"
              >
                🚪 Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques principales */}
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

        {/* Actions rapides - 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="🎁 Programme de fidélité">
            <p className="text-gray-600 mb-4">
              Configurez votre programme de fidélité et définissez les récompenses
            </p>
            <Link href="/dashboard/program">
              <Button className="w-full">Configurer le programme</Button>
            </Link>
          </Card>

          <Card title="📷 Scanner QR Code">
            <p className="text-gray-600 mb-4">
              Scannez les cartes de vos clients pour valider leurs achats
            </p>
            <Link href="/dashboard/scanner">
              <Button className="w-full">Ouvrir le scanner</Button>
            </Link>
          </Card>

          <Card title="📱 QR Code d'inscription">
            <p className="text-gray-600 mb-4">
              Générez le QR code pour que vos clients s'inscrivent facilement
            </p>
            <Link href="/dashboard/qrcode">
              <Button className="w-full">Générer le QR Code</Button>
            </Link>
          </Card>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="📍 Informations du restaurant">
            <div className="space-y-2 text-sm">
              <p><strong>Adresse :</strong> {restaurant.address}</p>
              <p><strong>Téléphone :</strong> {restaurant.phone}</p>
              <p>
                <strong>Coordonnées GPS :</strong> {restaurant.coordinates.latitude}, {restaurant.coordinates.longitude}
              </p>
              <p>
                <strong>Rayon de proximité :</strong> {restaurant.proximityRadius}m
              </p>
            </div>
          </Card>

          <Card title="🎨 Personnalisation">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Couleurs du thème</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: restaurant.colors.primary }}
                    ></div>
                    <span className="text-sm text-gray-600">Primaire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: restaurant.colors.secondary }}
                    ></div>
                    <span className="text-sm text-gray-600">Secondaire</span>
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="w-full" disabled>
                Personnaliser (bientôt)
              </Button>
            </div>
          </Card>
        </div>

        {/* Aide rapide */}
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-bold mb-4">🚀 Démarrage rapide</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-semibold">Configurez votre programme</p>
                  <p className="text-sm text-gray-600">Définissez combien d'achats sont nécessaires pour une récompense</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-semibold">Générez votre QR code d'inscription</p>
                  <p className="text-sm text-gray-600">Imprimez-le et affichez-le dans votre restaurant</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-semibold">Vos clients s'inscrivent</p>
                  <p className="text-sm text-gray-600">Ils scannent le QR code et créent leur carte virtuelle</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <p className="font-semibold">Validez les achats</p>
                  <p className="text-sm text-gray-600">Scannez le QR code personnel des clients à chaque visite</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}