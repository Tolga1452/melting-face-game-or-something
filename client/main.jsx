import { DiscordSDK } from "@discord/embedded-app-sdk";

import rocketLogo from '/rocket.png';
import "./style.css";
import React from 'react';
import ReactDOM from 'react-dom';

// Will eventually store the authenticated user's access_token
let auth;

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

setupDiscordSdk().then(() => {
  console.log('Discord SDK ready');
});

async function setupDiscordSdk() {
  await discordSdk.ready();

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify"
    ],
  });

  // Retrieve an access_token from your activity's server
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }
}

let faces = 0;
let fireglitches = 0;

function spawnFace() {
  const img = new Image();

  let chance = Math.random();
  let image;

  if (chance < 0.05) {
    image = './fireglitch.png';

    fireglitches++;
  } else {
    image = './face.png';

    faces++;
  };

  img.src = image;
  img.className = "face";
  img.style.left = `${Math.random() * window.innerWidth}px`;
  img.style.top = `${Math.random() * window.innerHeight / 2}px`;
  
  const animation = img.animate([
    { transform: `translateY(${window.innerHeight / 2}px)` }
  ], {
    duration: 2000
  });
  
  document.body.appendChild(img);

  animation.onfinish = () => document.body.removeChild(img);

  document.querySelector('.stats .counter:nth-child(1) .number').textContent = faces;
  document.querySelector('.stats .counter:nth-child(2) .number').textContent = fireglitches;
};

ReactDOM.render(
  <div>
    <div className="stats">
      <p className="counter">Faces: <span className="number">0</span></p>
      <p className="counter">Fireglitches: <span className="number">0</span></p>
    </div>
    <button className="spawn" onClick={spawnFace}>Spawn Melting Face</button>
  </div>,
  document.querySelector('#app')
);