import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 py-12">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page non trouvée</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/">
          <Button className="px-6 py-3 font-medium">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 