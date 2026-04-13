'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQRCode } from '@/lib/firebase/loyalty';

export default function ScannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUserId(user.uid);
      }
    });

    return () => {
      unsubscribe();
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, [router]);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setResult(decodedText);
          stopScanning();
        },
        () => {
          // Ignorer les erreurs de scan continues
        }
      );

      setScanning(true);
    } catch (err: any) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      console.error(err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleValidatePurchase = async () => {
    if (!result || !productName || !userId) {
      setError('Veuillez remplir le nom du produit');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const updatedCard = await scanQRCode(result, userId, productName);
      
      setSuccess(`✅ Achat validé ! Le client a maintenant ${updatedCard.purchaseCount}/10 achats.`);
      
      setTimeout(() => {
        setResult(null);
        setProductName('');
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!userId) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📷 Scanner QR Code</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Retour</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <div className="space-y-4">
            <div 
              id="qr-reader" 
              className={`${scanning ? 'block' : 'hidden'} w-full rounded-lg overflow-hidden border-4 border-blue-500`}
            />

            {!scanning && !result && (
              <Button onClick={startScanning} variant="primary" className="w-full text-lg py-4">
                📷 Ouvrir la caméra
              </Button>
            )}

            {scanning && (
              <Button onClick={stopScanning} variant="danger" className="w-full">
                ⏹️ Arrêter le scan
              </Button>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                  <p className="text-green-800 font-semibold">✅ QR Code scanné !</p>
                  <p className="text-sm text-green-600 mt-1 font-mono break-all">{result}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quel produit le client a-t-il acheté ?
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Pizza, Burger, Café..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleValidatePurchase} variant="primary" className="flex-1 text-lg py-3">
                    ✅ Valider l'achat
                  </Button>
                  <Button onClick={() => { setResult(null); setProductName(''); }} variant="secondary" className="py-3">
                    ❌ Annuler
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-500">
                <p className="text-red-800 font-semibold">❌ {error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                <p className="text-green-800 font-semibold">{success}</p>
              </div>
            )}

            {!result && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Instructions :</strong><br />
                  1. Cliquez sur "Ouvrir la caméra"<br />
                  2. Scannez le QR code du client<br />
                  3. Indiquez le produit acheté<br />
                  4. Validez l'achat
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}