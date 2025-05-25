import React from 'react';
import { Link } from 'react-router-dom';

const MenuAnimateur = () => {
  const menuItems = [
    { id: 1, icon: "👥", text: "Mes Formations", path: "/formateur/formations" },
    { id: 2, icon: "📅", text: "Absences", path: "/formateur/absences" },
    { id: 3, icon: "📁", text: "Ressources", path: "/formateur/ressources" },
    { id: 4, icon: "✓", text: "Évaluations", path: "/formateur/evaluations" },
    { id: 5, icon: "📆", text: "Planning", path: "/formateur/planning" },
    { id: 6, icon: "🏢", text: "Hébergement", path: "/formateur/hebergement" },
    { id: 7, icon: "⚙️", text: "Param", path: "/formateur/parametres" }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center">
        {menuItems.map(item => (
          <Link 
            key={item.id} 
            to={item.path} 
            className="flex flex-col items-center text-gray-700 hover:text-blue-600"
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-sm">{item.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuAnimateur;