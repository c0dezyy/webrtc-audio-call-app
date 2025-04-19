import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import CallUI from './components/CallUI';

const socket = io('https://webrtc-audio-call-app.onrender.com'); 

const App = () => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [muted, setMuted] = useState(false);
  const [callStart, setCallStart] = useState(null);
  const localStream = useRef(null);
  const peers = useRef({});

  useEffect(() => {
    socket.on('users', (userList) => setUsers(userList));
    socket.on('user-joined', handleUserJoined);
    socket.on('signal', async ({ from, signal }) => {
      if (!peers.current[from]) return;
      await peers.current[from].signal(signal);
    });
    socket.on('user-left', id => {
      if (peers.current[id]) {
        peers.current[id].destroy();
        delete peers.current[id];
        const el = document.getElementById(audio-${id});
        el?.remove();
      }
    });
  }, []);

  const handleJoin = async () => {
    localStorage.setItem('username', username);
    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    socket.emit('join', { roomId: 'main-room', username });
    setJoined(true);
    setCallStart(Date.now());
  };

  const handleUserJoined = async ({ id, username }) => {
    const SimplePeer = (await import('simple-peer')).default;
    const peer = new SimplePeer({ initiator: true, trickle: false, stream: localStream.current });
    peer.on('signal', signal => socket.emit('signal', { to: id, signal }));
    peer.on('stream', stream => playAudioStream(stream, id));
    peers.current[id] = peer;
  };

  const playAudioStream = (stream, id) => {
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.id = audio-${id};
    document.body.appendChild(audio);
  };

  const handleLeave = () => {
    Object.values(peers.current).forEach(peer => peer.destroy());
    peers.current = {};
    localStream.current?.getTracks().forEach(track => track.stop());
    setJoined(false);
    socket.disconnect();
    window.location.reload();
  };

  const toggleMute = () => {
    const track = localStream.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  return (
    <div className="container">
      {!joined ? (
        <div className="join-box">
          <input placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
          <button onClick={handleJoin} disabled={!username}>Join</button>
        </div>
      ) : (
        <CallUI
          username={username}
          users={users}
          onLeave={handleLeave}
          muted={muted}
          toggleMute={toggleMute}
          callStart={callStart}
        />
      )}
    </div>
  );
};

export default App;