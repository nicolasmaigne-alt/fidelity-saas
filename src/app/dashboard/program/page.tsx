'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createLoyaltyProgram, getLoyaltyProgram } from '@/lib/firebase/loyalty';
import { LoyaltyProgram } from '@/types';
import Link from 'next/link';

export default function ProgramPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Programme de fidélité',
    description: 'Achetez 10 produits et recevez-en 1 gratuit !',
    requiredPurchases: 10,
    rewardType: 'product' as 'product' | 'discount' | 'custom',
    rewardValue: '1 produit gratuit',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.uid);
      await loadProgram(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadProgram = async (restaurantId: string) => {
    const existingProgram = await getLoyaltyProgram(restaurantId);
    if (existingProgram) {
      setProgram(existingProgram);
      setFormData({
        name: existingProgram.name,
        description: existingProgram.description,
        requiredPurchases: existingProgram.requiredPurchases,
        rewardType: existingProgram.rewardType,
        rewardValue: existingProgram.rewardValue,
      });
    } else {
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const newProgram = await createLoyaltyProgram(userId, {
        ...formData,
        restaurantId: userId,
        isActive: true,
      });
      
      setProgram(newProgram);
      setEditing(false);
      alert('✅ Programme enregistré avec succès !');
    } catch (error) {
      console.error('Error saving program:', error);
      alert('❌ Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">🎁 Programme de Fidélité</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Retour</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!editing && program ? (
          <Card>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-xl">
                <h2 className="text-3xl font-bold mb-3">{program.name}</h2>
                <p className="text-lg opacity-90 mb-6">{program.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                  <div>
                    <p className="text-sm opacity-75">Achats requis</p>
                    <p className="text-4xl font-bold">{program.requiredPurchases}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Récompense</p>
                    <p className="text-xl font-semibold">{program.rewardValue}</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setEditing(true)} variant="secondary" className="w-full">
                ✏️ Modifier le programme
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="text-2xl font-bold mb-6">
              {program ? 'Modifier' : 'Créer'} votre programme de fidélité
            </h2>

            <div className="space-y-4">
              <Input
                label="Nom du programme"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Programme VIP, Carte fidélité..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre programme..."
                />
              </div>

              <Input
                type="number"
                label="Nombre d'achats requis"
                value={formData.requiredPurchases}
                onChange={(e) => setFormData({ ...formData, requiredPurchases: parseInt(e.target.value) || 1 })}
                min={1}
                max={50}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de récompense
                </label>
                <select
                  value={formData.rewardType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rewardType: e.target.value as 'product' | 'discount' | 'custom' 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="product">Produit gratuit</option>
                  <option value="discount">Réduction en %</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>

              <Input
                label="Valeur de la récompense"
                value={formData.rewardValue}
                onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                placeholder="Ex: 1 pizza gratuite, 20% de réduction..."
              />

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Exemple :</strong> Si vous définissez 10 achats requis avec une récompense "1 pizza gratuite",
                  vos clients devront acheter 10 pizzas pour en recevoir 1 gratuite.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                </Button>
                
                {program && (
                  <Button
                    onClick={() => {
                      setEditing(false);
                      loadProgram(userId!);
                    }}
                    variant="secondary"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}