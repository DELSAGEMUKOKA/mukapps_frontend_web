// src/pages/Unauthorized.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-14 h-14 text-red-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Accès non autorisé
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Si vous pensez que c'est une erreur, contactez votre administrateur.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la page précédente
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="w-4 h-4" />
            Aller au tableau de bord
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Code d'erreur: 403 - Forbidden
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;