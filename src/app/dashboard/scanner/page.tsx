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
      if (scannerRef.current && scanning) {
        stopScanning();
      }
    };
  }, [router, scanning]);

  const startScanning = async () => {
    setError(null);
    
    try {
      // Vérifier les permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log('QR Code détecté:', decodedText);
          setResult(decodedText);
          stopScanning();
        },
        () => {
          // Ignorer les erreurs de scan continues
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error('Erreur caméra:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('❌ Permission refusée. Autorisez l\'accès à la caméra dans les paramètres de votre navigateur.');
      } else if (err.name === 'NotFoundError') {
        setError('❌ Aucune caméra détectée sur cet appareil.');
      } else if (err.name === 'NotReadableError') {
        setError('❌ La caméra est déjà utilisée par une autre application.');
      } else {
        setError(`❌ Erreur : ${err.message || 'Impossible d\'accéder à la caméra'}`);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Erreur arrêt scanner:', err);
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
      setError(`❌ ${err.message}`);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

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
            {/* Zone de scan */}
            <div 
              id="qr-reader" 
              className={`${scanning ? 'block' : 'hidden'} w-full rounded-lg overflow-hidden border-4 border-blue-500`}
            />

            {/* Boutons de contrôle */}
            {!scanning && !result && (
              <Button 
                onClick={startScanning} 
                variant="primary" 
                className="w-full text-lg py-4 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                📷 Ouvrir la caméra
              </Button>
            )}

            {scanning && (
              <Button 
                onClick={stopScanning} 
                variant="danger" 
                className="w-full text-lg py-4"
              >
                ⏹️ Arrêter le scan
              </Button>
            )}

            {/* Résultat du scan */}
            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                  <p className="text-green-800 font-semibold text-lg">✅ QR Code scanné avec succès !</p>
                  <p className="text-sm text-green-600 mt-2 font-mono break-all bg-white p-2 rounded">
                    {result}
                  </p>
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleValidatePurchase} 
                    variant="primary" 
                    className="flex-1 text-lg py-3 bg-gradient-to-r from-green-600 to-green-700"
                  >
                    ✅ Valider l'achat
                  </Button>
                  <Button 
                    onClick={() => { 
                      setResult(null); 
                      setProductName(''); 
                      setError(null);
                    }} 
                    variant="secondary" 
                    className="py-3 px-6"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-500">
                <p className="text-red-800 font-semibold">{error}</p>
                
                {error.includes('Permission refusée') && (
                  <div className="mt-3 text-sm text-red-700">
                    <p className="font-semibold mb-2">Comment autoriser la caméra :</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Cliquez sur le cadenas 🔒 dans la barre d'adresse</li>
                      <li>Cliquez sur "Paramètres du site"</li>
                      <li>Autorisez l'accès à la caméra</li>
                      <li>Rechargez la page</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500 animate-pulse">
                <p className="text-green-800 font-semibold text-lg">{success}</p>
              </div>
            )}

            {/* Instructions */}
            {!result && !scanning && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-blue-800 text-sm leading-relaxed">
                  <strong className="text-lg">💡 Instructions :</strong>
                  <br /><br />
                  <strong>1.</strong> Cliquez sur "Ouvrir la caméra"
                  <br />
                  <strong>2.</strong> Autorisez l'accès à la caméra si demandé
                  <br />
                  <strong>3.</strong> Pointez vers le QR code du client
                  <br />
                  <strong>4.</strong> Le scan se fait automatiquement
                  <br />
                  <strong>5.</strong> Indiquez le produit acheté
                  <br />
                  <strong>6.</strong> Validez l'achat
                </p>
              </div>
            )}

            {/* Infos système */}
            <div className="bg-gray-50 p-3 rounded border text-xs text-gray-600">
              <p><strong>Navigateur :</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Autre'}</p>
              <p><strong>HTTPS :</strong> {window.location.protocol === 'https:' ? '✅ Oui' : '❌ Non (requis pour la caméra)'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}