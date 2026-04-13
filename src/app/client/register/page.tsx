'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { createLoyaltyCard, getLoyaltyProgram } from '@/lib/firebase/loyalty';
import { nanoid } from 'nanoid';

export default function ClientRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantId) {
      alert('❌ Lien invalide. Demandez au restaurant un nouveau lien.');
      return;
    }

    setLoading(true);

    try {
      // Créer le client
      const customerId = nanoid();
      await setDoc(doc(db, 'customers', customerId), {
        id: customerId,
        ...formData,
        createdAt: new Date(),
      });

      // Récupérer le programme de fidélité
      const program = await getLoyaltyProgram(restaurantId);
      
      if (!program) {
        alert('❌ Le restaurant n\'a pas encore configuré son programme de fidélité.');
        return;
      }

      // Créer la carte de fidélité
      await createLoyaltyCard(customerId, restaurantId, program.id);

      // Rediriger vers la page client avec le numéro de téléphone
      router.push(`/client?phone=${encodeURIComponent(formData.phone)}`);
    } catch (error) {
      console.error('Error registering:', error);
      alert('❌ Erreur lors de l\'inscription. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎫 Rejoindre le programme
          </h1>
          <p className="text-gray-600 mt-2">
            Créez votre carte de fidélité virtuelle
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Nom complet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Jean Dupont"
            required
          />

          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jean@exemple.com"
            required
          />

          <Input
            type="tel"
            label="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="06 12 34 56 78"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg py-3 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {loading ? 'Création...' : '✅ Créer ma carte de fidélité'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>🎁 Avantages :</strong>
            <br />
            • Carte de fidélité digitale
            <br />
            • Pas besoin d'application
            <br />
            • Accumulez des points à chaque visite
            <br />
            • Recevez des récompenses gratuites
          </p>
        </div>
      </Card>
    </div>
  );
}