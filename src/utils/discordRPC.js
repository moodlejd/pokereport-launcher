/**
 * Discord Rich Presence Integration
 */

let discordClient = null;
let isConnected = false;

export const initDiscordRPC = async () => {
  try {
    // En Electron, intentar cargar discord-rpc
    const DiscordRPC = require('discord-rpc');
    
    const clientId = '1234567890123456789'; // Reemplazar con tu Client ID real
    discordClient = new DiscordRPC.Client({ transport: 'ipc' });

    discordClient.on('ready', () => {
      console.log('✅ Discord RPC conectado');
      isConnected = true;
      updatePresence('En el launcher', 'Preparándose para jugar');
    });

    await discordClient.login({ clientId });
  } catch (error) {
    console.log('Discord RPC no disponible:', error);
    isConnected = false;
  }
};

export const updatePresence = (details, state, startTimestamp = null) => {
  if (!discordClient || !isConnected) return;

  try {
    discordClient.setActivity({
      details: details || 'En PokeReport Launcher',
      state: state || 'Navegando',
      startTimestamp: startTimestamp || Date.now(),
      largeImageKey: 'pokereport_logo',
      largeImageText: 'PokeReport Launcher',
      smallImageKey: 'minecraft_icon',
      smallImageText: 'Minecraft 1.21.1',
      instance: false,
      buttons: [
        {
          label: '🎮 Jugar Ahora',
          url: 'https://pokereport.com'
        },
        {
          label: '💬 Discord',
          url: 'https://discord.gg/pokereport'
        }
      ]
    });
  } catch (error) {
    console.error('Error updating Discord presence:', error);
  }
};

export const setPlayingPresence = (username) => {
  updatePresence(
    `🎮 Jugando como ${username}`,
    '⚡ Atrapando Pokémon',
    Date.now()
  );
};

export const setIdlePresence = () => {
  updatePresence(
    '📋 En el menú principal',
    '✨ Listo para jugar'
  );
};

export const clearPresence = () => {
  if (!discordClient || !isConnected) return;

  try {
    discordClient.clearActivity();
  } catch (error) {
    console.error('Error clearing Discord presence:', error);
  }
};

export const disconnectDiscord = () => {
  if (discordClient && isConnected) {
    try {
      discordClient.destroy();
      isConnected = false;
      console.log('Discord RPC desconectado');
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
    }
  }
};

