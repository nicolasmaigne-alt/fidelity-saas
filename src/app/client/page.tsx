'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClientPage() {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <Button className="w-full">
              Accéder à ma carte
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/">
            <a className="text-white hover:underline">← Retour à l'accueil</a>
          </Link>
        </div>
      </div>
    </div>
  );
}