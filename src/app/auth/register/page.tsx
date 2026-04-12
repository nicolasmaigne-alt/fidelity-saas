'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createRestaurant } from '@/lib/firebase/restaurants';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createRestaurant(userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
        },
        proximityRadius: 500,
        plan: 'free',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Créer votre compte restaurant
        </h1>
        
        <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Nom du restaurant"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <Input
            type="password"
            label="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <Input
            type="tel"
            label="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          
          <div className="col-span-2">
            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          
          <Input
            type="number"
            step="any"
            label="Latitude"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="48.8566"
            required
          />
          
          <Input
            type="number"
            step="any"
            label="Longitude"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="2.3522"
            required
          />
          
          {error && (
            <div className="col-span-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="col-span-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </div>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}