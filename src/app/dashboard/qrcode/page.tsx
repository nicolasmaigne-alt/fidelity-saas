'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getRestaurant } from '@/lib/firebase/restaurants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Restaurant } from '@/types';

export default function QRCodePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.uid);
      const restaurantData = await getRestaurant(user.uid);
      setRestaurant(restaurantData);

      if (restaurantData) {
        generateQRCode(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const generateQRCode = async (restaurantId: string) => {
    const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/register?restaurant=${restaurantId}`;
    
    try {
      const url = await QRCode.toDataURL(registrationUrl, {
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-inscription-${restaurant?.name || 'restaurant'}.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && restaurant) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${restaurant.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
                padding: 40px;
              }
              h1 { 
                margin-bottom: 20px; 
                color: #333;
                text-align: center;
              }
              img { 
                max-width: 500px; 
                border: 4px solid #8B5CF6;
                border-radius: 20px;
                padding: 20px;
                background: white;
              }
              p { 
                text-align: center; 
                max-width: 500px; 
                margin-top: 30px;
                font-size: 18px;
                line-height: 1.6;
              }
              .highlight {
                color: #8B5CF6;
                font-weight: bold;
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <h1>🎫 Rejoignez notre programme de fidélité</h1>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p class="highlight">${restaurant.name}</p>
            <p>
              Scannez ce QR code avec votre smartphone<br />
              pour créer votre carte de fidélité virtuelle<br />
              et commencer à collecter des récompenses ! 🎁
            </p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/register?restaurant=${userId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📱 QR Code d'inscription</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Retour</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <Card>
            <h2 className="text-xl font-bold mb-4 text-center">
              QR Code d'inscription
            </h2>
            
            {qrCodeUrl && (
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-80 h-80" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleDownload} className="w-full">
                💾 Télécharger le QR Code
              </Button>
              <Button onClick={handlePrint} variant="secondary" className="w-full">
                🖨️ Imprimer
              </Button>
            </div>
          </Card>

          {/* Instructions */}
          <Card>
            <h2 className="text-xl font-bold mb-4">
              📋 Comment utiliser ce QR Code
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-semibold">Imprimez ou affichez</p>
                  <p className="text-sm text-gray-600">Mettez ce QR code sur votre comptoir, menu ou vitrine</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-semibold">Vos clients scannent</p>
                  <p className="text-sm text-gray-600">Ils utilisent l'appareil photo de leur smartphone</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-semibold">Inscription instantanée</p>
                  <p className="text-sm text-gray-600">Ils remplissent un court formulaire</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <p className="font-semibold">Carte créée !</p>
                  <p className="text-sm text-gray-600">Ils reçoivent leur QR code personnel à présenter</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Placez ce QR code à un endroit visible pour maximiser les inscriptions !
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Lien d'inscription :</strong>
              </p>
              <div className="bg-gray-100 p-3 rounded-lg">
                <code className="text-xs break-all">{registrationUrl}</code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}