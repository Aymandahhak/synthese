import React from 'react';

const ProfileParticipant = ({ participant }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start gap-6">
        <div className="w-1/6">
          <img 
            src={participant.photo || '/api/placeholder/120/120'} 
            alt={participant.nom} 
            className="rounded-full w-full"
          />
        </div>
        <div className="w-5/6">
          <h1 className="text-3xl font-bold mb-1">{participant.nom}</h1>
          <p className="text-xl text-gray-600 mb-2">Participant</p>
          <p className="text-gray-700">{participant.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileParticipant;