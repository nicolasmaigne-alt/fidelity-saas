'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-white text-2xl font-bold">🍽️ Fidelity SaaS</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="secondary">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Commencer</Button>
            </Link>
          </div>
        </nav>
        
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Programme de fidélité digital
            <br />
            <span className="text-yellow-200">pour votre restaurant</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Transformez vos clients occasionnels en habitués grâce à une carte de fidélité
            virtuelle moderne et des notifications intelligentes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                🚀 Démarrer gratuitement
              </Button>
            </Link>
            <Link href="/client">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                📱 Espace Client
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-3">Carte virtuelle</h3>
            <p className="text-gray-100">
              Vos clients gardent leur carte de fidélité dans leur smartphone, toujours accessible.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold mb-3">Géolocalisation</h3>
            <p className="text-gray-100">
              Envoyez des notifications automatiques quand vos clients sont à proximité.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3">Analytics</h3>
            <p className="text-gray-100">
              Suivez les performances et le taux de fidélisation en temps réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}