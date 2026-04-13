function handleSceneAudio() {
  const levelChangedWhileInGame =
    scene === SCENES.GAME &&
    previousScene === SCENES.GAME &&
    lastAudioLevel !== currentLevel;
  const gameplayTrackStoppedUnexpectedly =
    scene === SCENES.GAME &&
    currentGameplayTrack &&
    !currentGameplayTrack.isPlaying();

  if (
    scene === previousScene &&
    !levelChangedWhileInGame &&
    !gameplayTrackStoppedUnexpectedly
  ) {
    return;
  }

  if (
    scene === SCENES.START ||
    scene === SCENES.CUTSCENE ||
    scene === SCENES.GAME
  ) {
    if (scene === SCENES.START || scene === SCENES.CUTSCENE) {
      stopGameplayMusic();

      startFullGameMusic();

      if (sndGutterWater && sndGutterWater.isPlaying()) {
        sndGutterWater.stop();
      }
      if (sndSteam && sndSteam.isPlaying()) {
        sndSteam.stop();
      }
      if (sndFootsteps && sndFootsteps.isPlaying()) {
        sndFootsteps.stop();
      }
    }

    if (scene === SCENES.GAME) {
      stopStartMusic();
      playLevelMusicForCurrentLevel();

      if (
        sndGutterWater &&
        getAudioContext().state === "running" &&
        !sndGutterWater.isPlaying()
      ) {
        sndGutterWater.setLoop(true);
        sndGutterWater.setVolume(0.12);
        sndGutterWater.play();
      }

      if (
        sndSteam &&
        getAudioContext().state === "running" &&
        !sndSteam.isPlaying()
      ) {
        sndSteam.setLoop(true);
        sndSteam.setVolume(0.1);
        sndSteam.play();
      }
    }
  } else if (scene === SCENES.INSTRUCTIONS) {
    if (sndFootsteps && sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
  } else if (scene === SCENES.END) {
    stopAllSounds();

    if (getAudioContext().state === "running") {
      if (endSoundType === "victory") {
        playOneShot(sndVictoryNew || sndVictory, 0.65);
      } else if (endSoundType === "gameOver") {
        playOneShot(sndGameOverNew || sndGameOver, 0.65);
      }
    }
  }

  previousScene = scene;
  lastAudioLevel = currentLevel;
}

/************************************************************
 * SOUND HELPERS
 ************************************************************/
function stopAllSounds() {
  const allSounds = [
    sndBackground,
    sndBubbling,
    sndCoin,
    sndDamage,
    sndFallingManhole,
    sndFootsteps,
    sndGameOver,
    sndGameOverNew,
    sndGutterWater,
    sndIntroduction,
    sndLevel1Music,
    sndLevel2Music,
    sndLevel3Music,
    sndMonsterSound,
    sndStartSound,
    sndSteam,
    sndVictory,
    sndVictoryNew,
    sndWaterDrip,
  ];

  for (const s of allSounds) {
    if (s && s.isPlaying()) {
      s.stop();
    }
  }

  if (monsterSoundTimeout) {
    clearTimeout(monsterSoundTimeout);
    monsterSoundTimeout = null;
  }

  currentGameplayTrack = null;
}

function stopStartMusic() {
  if (sndBackground && sndBackground.isPlaying()) {
    sndBackground.stop();
  }
}

function stopGameplayMusic() {
  const gameplayTracks = [sndLevel1Music, sndLevel2Music, sndLevel3Music];

  for (const track of gameplayTracks) {
    if (track && track.isPlaying()) {
      track.stop();
    }
  }

  currentGameplayTrack = null;
}

function startFullGameMusic() {
  if (!sndBackground) return;
  if (getAudioContext().state !== "running") return;

  stopGameplayMusic();

  if (!sndBackground.isPlaying()) {
    sndBackground.setLoop(true);
    sndBackground.setVolume(0.18);
    sndBackground.play();
  }
}

function getLevelMusicForCurrentLevel() {
  if (currentLevel === 1) return sndLevel1Music;
  if (currentLevel === 2) return sndLevel2Music;
  if (currentLevel === 3) return sndLevel3Music;
  return null;
}

function playLevelMusicForCurrentLevel() {
  if (getAudioContext().state !== "running") return;

  const nextTrack = getLevelMusicForCurrentLevel();
  if (!nextTrack) return;

  if (currentGameplayTrack === nextTrack && nextTrack.isPlaying()) return;

  stopGameplayMusic();

  currentGameplayTrack = nextTrack;
  currentGameplayTrack.setLoop(true);
  currentGameplayTrack.setVolume(0.32);
  currentGameplayTrack.play();
}

function playOneShot(sound, volume = 0.65) {
  if (!sound) return;
  if (getAudioContext().state !== "running") return;

  if (sound.isPlaying()) {
    sound.stop();
  }

  sound.setLoop(false);
  sound.setVolume(volume);
  sound.play();
}

function playMonsterCollisionSound() {
  if (!sndMonsterSound) return;
  if (getAudioContext().state !== "running") return;

  if (!sndMonsterSound.isPlaying()) {
    sndMonsterSound.stop();
    sndMonsterSound.setLoop(false);
    sndMonsterSound.setVolume(0.6);
    sndMonsterSound.play();
  }

  if (monsterSoundTimeout) {
    clearTimeout(monsterSoundTimeout);
  }

  monsterSoundTimeout = setTimeout(() => {
    if (sndMonsterSound && sndMonsterSound.isPlaying()) {
      sndMonsterSound.stop();
    }
    monsterSoundTimeout = null;
  }, MONSTER_SOUND_TIMEOUT_MS);
}

function updateFootstepSound() {
  if (!sndFootsteps) return;

  if (getAudioContext().state !== "running" || scene !== SCENES.GAME) {
    if (sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
    return;
  }

  if (player.moving && !freezeEffect.active) {
    if (!sndFootsteps.isPlaying()) {
      sndFootsteps.setLoop(true);
      sndFootsteps.setVolume(0.22);
      sndFootsteps.play();
    }
  } else {
    if (sndFootsteps.isPlaying()) {
      sndFootsteps.stop();
    }
  }
}

function triggerVictory() {
  stopAllSounds();
  endMessage = "You escaped all 3 levels! 🎉";
  endSoundType = "victory";
  scene = SCENES.END;
}

function triggerGameOver() {
  stopAllSounds();
  endMessage = "Game Over! You ran out of health.";
  endSoundType = "gameOver";
  scene = SCENES.END;
}

/************************************************************
 * LEVEL LOADING
 ************************************************************/
function loadCurrentLevel() {
  levelStartTime = millis();
  health = maxHealth;

  player.x = 120;
  player.y = 120;
  player.direction = "down";
  player.moving = false;
  player.frameIndex = 0;
  player.frameCounter = 0;
  player.currentAnimName = "down_idle";

  monsterFrameIndex = 0;
  monsterFrameCounter = 0;

  damageCooldown = 0;
  damageText = "";
  damageTextTimer = 0;

  immuneUntil = 0;
  freezeEffect.active = false;

  buildMaze();
  buildGasHazards();
  buildKeys();
  spawnEnemies();

  if (scene === SCENES.GAME && getAudioContext().state === "running") {
    playLevelMusicForCurrentLevel();
    lastAudioLevel = currentLevel;
  }
}

/************************************************************
 * RESTART
 ************************************************************/
function restartGame() {
  stopAllSounds();

  currentLevel = 1;
  health = maxHealth;
  endMessage = "";
  endSoundType = "";
  lastMonsterSoundTime = -9999;
  lastAudioLevel = -1;

  freezeEffect.active = false;
  immuneUntil = 0;

  gameEnded = false;
  gameStartTime = millis();
  loadCurrentLevel();

  playLevelMusicForCurrentLevel();

  if (getAudioContext().state === "running") {
    if (sndGutterWater && !sndGutterWater.isPlaying()) {
      sndGutterWater.setLoop(true);
      sndGutterWater.setVolume(0.12);
      sndGutterWater.play();
    }

    if (sndSteam && !sndSteam.isPlaying()) {
      sndSteam.setLoop(true);
      sndSteam.setVolume(0.1);
      sndSteam.play();
    }
  }
}
