import React, { useState } from 'react';
import './AboutSection.css';

function AboutSection() {
    const [activeModule, setActiveModule] = useState('planning');

    const modules = [
        { id: 'planning', name: 'Planification', features: 3 },
        { id: 'absence', name: 'Gestion des absences', features: 2 },
        { id: 'logistics', name: 'Logistique', features: 4 },
        { id: 'documents', name: 'Documents', features: 3 },
    ];

    return (
        <section id="about" className="about-section">
            <div className="smart-home-container">
                <div className="smart-home-main">
                    <div className="smart-home-header">
                        <div className="smart-home-status">
                            <span className="status-indicator">● Système Actif</span>
                        </div>
                        <div className="smart-home-stats">
                            <div className="stat-item">
                                <span>12 CDC</span>
                            </div>
                            <div className="stat-item">
                                <span>350 Formateurs</span>
                            </div>
                            <div className="stat-item">
                                <span>45 Sessions</span>
                            </div>
                            <div className="stat-item">
                                <span>95% Satisfaction</span>
                            </div>
                        </div>
                    </div>
                    <div className="smart-home-preview">
                        <video 
                            src="/ses.mp4" 
                            alt="Formation des Formateurs" 
                            className="room-preview" 
                            autoPlay 
                            loop 
                            muted 
                        />
                    </div>
                </div>

                <div className="smart-home-sidebar">
                    <div className="rooms-section">
                        <h3>Modules</h3>
                        <div className="rooms-list">
                            {modules.map(module => (
                                <div 
                                    key={module.id} 
                                    className={`room-item ${activeModule === module.id ? 'active' : ''}`}
                                    onClick={() => setActiveModule(module.id)}
                                >
                                    <div className="room-icon">
                                        {module.id === 'planning' && <span>📅</span>}
                                        {module.id === 'absence' && <span>📊</span>}
                                        {module.id === 'logistics' && <span>🏨</span>}
                                        {module.id === 'documents' && <span>📚</span>}
                                    </div>
                                    <div className="room-info">
                                        <h4>{module.name}</h4>
                                        <p>{module.features} fonctionnalité(s)</p>
                                    </div>
                                    <div className="room-arrow">
                                        <span>›</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="add-room-btn">+ NOUVEAU MODULE</button>
                    </div>

                    <div className="smart-controls">
                        <div className="control-section">
                            <h3>Gestion des Formations</h3>
                            <div className="device-control">
                                <div className="device-status">
                                    <span className="device-icon">🎓</span>
                                    <span>Planification des sessions</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked readOnly />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="control-section">
                            <h3>Suivi des Absences</h3>
                            <div className="device-control">
                                <div className="device-status">
                                    <span className="device-icon">📋</span>
                                    <span>Alertes automatiques</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked readOnly />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="control-section">
                            <h3>Statistiques</h3>
                            <div className="music-player">
                                <div className="now-playing">
                                    <span>OFPPT - Formation des Formateurs</span>
                                    <div className="track-time">
                                        <span>2024</span>
                                        <span>2025</span>
                                    </div>
                                </div>
                                <div className="album-art">
                                    <img src="/images/dark.png" alt="OFPPT Logo" />
                                </div>
                                <div className="player-controls">
                                    <button>📊</button>
                                    <button>📈</button>
                                    <button className="play-btn">🔍</button>
                                    <button>📉</button>
                                    <button>📑</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutSection;