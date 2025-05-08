import React, { useState } from 'react';
import './AboutSection.css';

function AboutSection() {
    const [activeRoom, setActiveRoom] = useState('living');

    const rooms = [
        { id: 'bedroom', name: 'Bedroom', devices: 3 },
        { id: 'kitchen', name: 'Kitchen', devices: 2 },
        { id: 'living', name: 'Living room', devices: 5 },
        { id: 'bathroom', name: 'Bathroom', devices: 1 },
    ];

    return (
        <section id="about" className="about-section">
            <div className="smart-home-container">
                <div className="smart-home-main">
                    <div className="smart-home-header">
                        <div className="smart-home-status">
                            <span className="status-indicator">● Live</span>
                        </div>
                        <div className="smart-home-stats">
                            <div className="stat-item">
                                <span>24°C</span>
                            </div>
                            <div className="stat-item">
                                <span>50%</span>
                            </div>
                            <div className="stat-item">
                                <span>350W</span>
                            </div>
                            <div className="stat-item">
                                <span>80%</span>
                            </div>
                        </div>
                    </div>
                    <div className="smart-home-preview">
                        <img src="/images/modern-living-room.jpg" alt="Modern living room" className="room-preview" />
                    </div>
                </div>

                <div className="smart-home-sidebar">
                    <div className="rooms-section">
                        <h3>Rooms</h3>
                        <div className="rooms-list">
                            {rooms.map(room => (
                                <div 
                                    key={room.id} 
                                    className={`room-item ${activeRoom === room.id ? 'active' : ''}`}
                                    onClick={() => setActiveRoom(room.id)}
                                >
                                    <div className="room-icon">
                                        {room.id === 'bedroom' && <span>🛏️</span>}
                                        {room.id === 'kitchen' && <span>🍳</span>}
                                        {room.id === 'living' && <span>🛋️</span>}
                                        {room.id === 'bathroom' && <span>🚿</span>}
                                    </div>
                                    <div className="room-info">
                                        <h4>{room.name}</h4>
                                        <p>{room.devices} device(s)</p>
                                    </div>
                                    <div className="room-arrow">
                                        <span>›</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="add-room-btn">+ ADD ROOM</button>
                    </div>

                    <div className="smart-controls">
                        <div className="control-section">
                            <h3>Bedroom</h3>
                            <div className="device-control">
                                <div className="device-status">
                                    <span className="device-icon">🤖</span>
                                    <span>Robot vacuum cleaner</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="control-section">
                            <h3>Living room</h3>
                            <div className="device-control">
                                <div className="device-status">
                                    <span className="device-icon">💡</span>
                                    <span>Smart Lamp</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked readOnly />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="control-section">
                            <h3>Speakers</h3>
                            <div className="music-player">
                                <div className="now-playing">
                                    <span>Playing</span>
                                    <div className="track-time">
                                        <span>0:34</span>
                                        <span>2:27</span>
                                    </div>
                                </div>
                                <div className="album-art">
                                    <img src="/images/album-cover.jpg" alt="Album cover" />
                                </div>
                                <div className="player-controls">
                                    <button>⟲</button>
                                    <button>◀◀</button>
                                    <button className="play-btn">▶</button>
                                    <button>▶▶</button>
                                    <button>⟳</button>
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