'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import QRCode from 'qrcode';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { LoyaltyCard } from '@/types';
import { useSearchParams } from 'next/navigation';

function ClientContent() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone');

  const [phoneNumber, setPhoneNumber] = useState(phoneParam || '');
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login si phone dans l'URL
  useEffect(() => {
    if (phoneParam && !loyaltyCard) {
      handleLogin(phoneParam);
    }
  }, [phoneParam]);

  const handleLogin = async (phone?: string) => {
    const phoneToUse = phone || phoneNumber;

    if (!phoneToUse) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const customersQuery = query(
        collection(db, 'customers'),
        where('phone', '==', phoneToUse)
      );
      
      const customersSnapshot = await getDocs(customersQuery);
      
      if (customersSnapshot.empty) {
        alert('❌ Aucune carte trouvée pour ce numéro. Demandez au restaurant de créer votre carte.');
        setLoading(false);
        return;
      }

      const customer = customersSnapshot.docs[0];
      const customerId = customer.id;
      
      const cardQuery = query(
        collection(db, 'loyaltyCards'),
        where('customerId', '==', customerId)
      );
      
      const cardSnapshot = await getDocs(cardQuery);
      
      if (cardSnapshot.empty) {
        alert('❌ Aucune carte de fidélité trouvée.');
        setLoading(false);
        return;
      }

      const card = cardSnapshot.docs[0].data() as LoyaltyCard;
      setLoyaltyCard(card);
      
      const qrUrl = await QRCode.toDataURL(card.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrUrl);
      
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoyaltyCard(null);
    setQrCodeUrl('');
    setPhoneNumber('');
    window.history.pushState({}, '', '/client');
  };

  const progress = loyaltyCard ? (loyaltyCard.purchaseCount / 10) * 100 : 0;
  const remaining = loyaltyCard ? 10 - loyaltyCard.purchaseCount : 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!loyaltyCard ? (
          <Card className="backdrop-blur-sm bg-white/95">
            <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎫 Ma Carte de Fidélité
            </h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>
              
              <Button
                onClick={() => handleLogin()}
                className="w-full text-lg py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Accéder à ma carte'}
              </Button>

              <div className="text-center mt-6">
                <Link href="/" className="text-white hover:underline text-sm">
                  ← Retour à l'accueil
                </Link>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>📱 Première visite ?</strong>
                <br />
                Demandez au restaurant de scanner votre téléphone pour créer votre carte de fidélité.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/95">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Votre Carte de Fidélité
                </h2>
                
                {qrCodeUrl && (
                  <div className="bg-white p-6 rounded-xl inline-block mb-4 shadow-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-72 h-72" />
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-4">
                  Présentez ce QR code au restaurant
                </p>
              </div>
            </Card>

            <Card className="backdrop-blur-sm bg-white/95">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {loyaltyCard.purchaseCount} / 10
                  </span>
                  <span className="text-sm text-gray-600">
                    achats validés
                  </span>
                </div>

                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    {progress > 20 && (
                      <span className="text-white font-bold text-sm">
                        {loyaltyCard.purchaseCount}/10
                      </span>
                    )}
                  </div>
                </div>

                {loyaltyCard.purchaseCount >= 10 ? (
                  <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">🎉 Félicitations !</p>
                    <p className="mt-2">Vous avez droit à votre récompense !</p>
                    <p className="text-sm mt-1 opacity-90">Montrez cette carte au restaurant</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg text-center">
                    <p className="text-purple-800 font-semibold">
                      Encore {remaining} achat{remaining > 1 ? 's' : ''} pour votre récompense ! 🎁
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {loyaltyCard.lastPurchaseDate && (
              <Card className="backdrop-blur-sm bg-white/95">
                <p className="text-sm text-gray-600">
                  <strong>Dernier achat :</strong> {new Date(loyaltyCard.lastPurchaseDate.toString()).toLocaleDateString('fr-FR')}
                </p>
              </Card>
            )}

            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full"
            >
              🚪 Se déconnecter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/95">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </Card>
      </div>
    }>
      <ClientContent />
    </Suspense>
  );
}