import React, { useEffect, useState } from 'react';

const CallUI = ({ username, users, onLeave, muted, toggleMute, callStart }) => {
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - callStart) / 1000);
      const minutes = String(Math.floor(duration / 60)).padStart(2, '0');
      const seconds = String(duration % 60).padStart(2, '0');
      setTime(${minutes}:${seconds});
    }, 1000);
    return () => clearInterval(interval);
  }, [callStart]);

  return (
    <div className="call-ui">
      <h2>In Call as <b>{username}</b></h2>
      <p>Call time: {time}</p>
      <h3>Users in call:</h3>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username}</li>
        ))}
      </ul>
      <div className="controls">
        <button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
        <button onClick={onLeave}>Leave</button>
      </div>
    </div>
  );
};

export default CallUI;