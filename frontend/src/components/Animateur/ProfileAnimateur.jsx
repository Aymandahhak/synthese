import React from 'react';

const ProfileAnimateur = ({ formateur }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start gap-6">
        <div className="w-1/4">
          <img 
            src={formateur.photo || '/api/placeholder/200/200'} 
            alt={formateur.nom} 
            className="rounded-lg w-full"
          />
        </div>
        <div className="w-3/4">
          <h1 className="text-3xl font-bold mb-2">{formateur.nom}</h1>
          <p className="text-xl text-gray-600 mb-2">Rôle : Animateur Formateur</p>
          <p className="text-lg mb-2">{formateur.email}</p>
          <p className="text-lg">Spécialité : {formateur.specialite}</p>
        </div>
      </div>
    </div>
  );
};