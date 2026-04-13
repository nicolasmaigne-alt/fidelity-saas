'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { scanQRCode } from '@/lib/firebase/loyalty';

export default function ScannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef<any>(null);
  const [Html5Qrcode, setHtml5Qrcode] = useState<any>(null);

  useEffect(() => {
    // Charger la librairie dynamiquement
    import('html5-qrcode').then((module) => {
      setHtml5Qrcode(() => module.Html5Qrcode);
    });
  }, []);

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
      stopScanning();
    };
  }, [router]);

  const startScanning = async () => {
    if (!Html5Qrcode) {
      setError('❌ Scanner en cours de chargement, réessayez dans 1 seconde...');
      setTimeout(() => setError(null), 2000);
      return;
    }

    setError(null);
    setScanning(true);

    // Attendre que le DOM soit prêt
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log('QR Code scanné:', decodedText);
        setResult(decodedText);
        stopScanning();
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {} // Ignorer les erreurs de scan
      );

      console.log('Scanner démarré avec succès');
    } catch (err: any) {
      console.error('Erreur scanner:', err);
      setScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setError('❌ Permission caméra refusée. Autorisez l\'accès dans les paramètres.');
      } else if (err.name === 'NotFoundError') {
        setError('❌ Aucune caméra trouvée.');
      } else if (err.toString().includes('Camera already in use')) {
        setError('❌ Caméra déjà utilisée. Fermez les autres onglets utilisant la caméra.');
        // Forcer le nettoyage
        stopScanning();
      } else {
        setError(`❌ Erreur: ${err.message || err.toString()}`);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        const isScanning = scannerRef.current.getState();
        if (isScanning === 2) { // SCANNING
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Erreur arrêt:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleValidatePurchase = async () => {
    const qrCodeToUse = manualMode ? manualInput : result;

    if (!qrCodeToUse || !productName || !userId) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const updatedCard = await scanQRCode(qrCodeToUse, userId, productName);
      
      setSuccess(`✅ Achat validé ! Client : ${updatedCard.purchaseCount}/10 achats.`);
      
      setTimeout(() => {
        setResult(null);
        setProductName('');
        setSuccess(null);
        setManualInput('');
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
            {/* Choix du mode */}
            {!scanning && !result && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setManualMode(false)}
                  variant={!manualMode ? 'primary' : 'secondary'}
                  className="flex-1"
                >
                  📷 Scanner
                </Button>
                <Button
                  onClick={() => setManualMode(true)}
                  variant={manualMode ? 'primary' : 'secondary'}
                  className="flex-1"
                >
                  ⌨️ Saisie manuelle
                </Button>
              </div>
            )}

            {/* Mode Scanner */}
            {!manualMode && (
              <>
                <div 
                  id="qr-reader" 
                  className={`${scanning ? 'block' : 'hidden'} w-full rounded-lg overflow-hidden`}
                  style={{ minHeight: '300px' }}
                />

                {!scanning && !result && (
                  <Button 
                    onClick={startScanning} 
                    variant="primary" 
                    className="w-full text-lg py-4"
                    disabled={!Html5Qrcode}
                  >
                    {Html5Qrcode ? '📷 Ouvrir la caméra' : '⏳ Chargement du scanner...'}
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
              </>
            )}

            {/* Mode Manuel */}
            {manualMode && !result && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de la carte (commence par LOYALTY-)
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="LOYALTY-xxxxx-xxxxx"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-mono"
                />
              </div>
            )}

            {/* Résultat */}
            {(result || (manualMode && manualInput)) && (
              <div className="space-y-4">
                {result && (
                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                    <p className="text-green-800 font-semibold">✅ QR Code scanné !</p>
                    <p className="text-sm text-green-600 mt-1 font-mono break-all">
                      {result}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produit acheté
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Pizza, Burger, Café..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleValidatePurchase} 
                    variant="primary" 
                    className="flex-1 text-lg py-3"
                  >
                    ✅ Valider l'achat
                  </Button>
                  <Button 
                    onClick={() => { 
                      setResult(null); 
                      setProductName(''); 
                      setError(null);
                      setManualInput('');
                    }} 
                    variant="secondary" 
                    className="px-6"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-500">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                <p className="text-green-800 font-semibold text-lg">{success}</p>
              </div>
            )}

            {/* Instructions */}
            {!result && !scanning && !manualMode && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Astuce :</strong> Si le scanner ne fonctionne pas, utilisez le mode "Saisie manuelle" et tapez le code visible sous le QR code du client.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}