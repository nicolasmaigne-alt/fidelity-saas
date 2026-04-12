'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function ScannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!userId) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Scanner QR Code</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Retour</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card title="📷 Scanner QR Code Client">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Scanner en cours de développement...
            </p>
            <p className="text-sm text-gray-500">
              Utilisez la caméra pour scanner les QR codes des clients
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}