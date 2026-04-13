/************************************************************
 * 7) GAME LOOP
 ************************************************************/
function drawGame() {
  updateFreezeEffect();
  updatePlayer();
  updateAnimation();
  updateMonsterAnimation();
  updateCamera();
  updateEnemies();
  ensureKeysForCurrentLevel();
  ensureMasksForCurrentLevel();
  handleKeyPickup();
  handleMaskPickup();
  updateWallVents();
  handleWallVentDamage();
  updateFootstepSound();

  if (health <= 0) {
    triggerGameOver();
    return;
  }

  if (
    rectContainsCircle(
      goal.x,
      goal.y,
      goal.w,
      goal.h,
      player.x,
      player.y,
      player.r
    )
  ) {
    if (hasAllKeys()) {
      advanceLevel();
      return;
    } else {
      damageText = "Find the key first!";
      damageTextTimer = 20;
    }
  }

  push();
  translate(-cam.x, -cam.y);

  drawWorldBackground();
  drawWorldBounds();
  drawGoal();
  drawMaze();
  drawKeys();
  drawMasks();
  drawEnemies();
  drawPlayer();

  pop();

  drawHUD();
  drawKeyUI();

  if (damageTextTimer > 0) {
    fill(255, 0, 0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(damageText, width / 2, 60);
    damageTextTimer--;
  }

  drawHealthBar();

  if (freezeEffect.active) {
    const pulseBlur = freezeEffect.blurAmount + 0.75 * sin(frameCount * 0.18);

    filter(BLUR, max(1, pulseBlur));
    drawFreezeOverlay();
  }
}

function drawPlayer() {
  const anim = getCurrentAnimation();

  const sx = player.frameIndex * anim.frameW;
  const sy = 0;
  const sw = anim.frameW;
  const sh = anim.frameH;

  const dw = anim.frameW * player.scale;
  const dh = anim.frameH * player.scale;

  const dx = floor(player.x - dw / 2);
  const dy = floor(player.y - dh / 2);

  image(anim.sheet, dx, dy, dw, dh, sx, sy, sw, sh);
}

function drawEnemies() {
  const activeMonsterSheet = getMonsterSheetForCurrentLevel();
  const anim = getMonsterAnimSettings();

  if (!activeMonsterSheet) {
    noStroke();
    fill(255, 200, 0);
    for (const e of enemies) circle(e.x, e.y, e.r * 2);
    return;
  }

  const sx = monsterFrameIndex * anim.frameW;
  const sy = 0;
  const sw = anim.frameW;
  const sh = anim.frameH;

  const dw = anim.frameW * MONSTER_SCALE;
  const dh = anim.frameH * MONSTER_SCALE;

  for (const e of enemies) {
    const dx = floor(e.x - dw / 2);
    const dy = floor(e.y - dh / 2);

    image(activeMonsterSheet, dx, dy, dw, dh, sx, sy, sw, sh);
  }
}

function drawGoal() {
  if (doorImg) {
    const drawW = 60;
    const drawH = 80;

    const dx = goal.x + goal.w / 2 - drawW / 2;
    const dy = goal.y + goal.h / 2 - drawH / 2;

    image(doorImg, dx, dy, drawW, drawH);
  } else {
    noStroke();
    fill(0, 200, 100);
    rect(goal.x, goal.y, goal.w, goal.h);
  }
}

function updateFreezeEffect() {
  if (freezeEffect.active) {
    freezeEffect.activeTimer--;

    if (freezeEffect.activeTimer <= 0) {
      endFreezeEffect();
    }
  }
}

function startFreezeEffect() {
  freezeEffect.active = true;
  freezeEffect.activeTimer = freezeEffect.activeDuration;

  player.moving = false;
  player.frameIndex = 0;
  player.frameCounter = 0;
  player.currentAnimName = "";
}

function endFreezeEffect() {
  freezeEffect.active = false;
  freezeEffect.activeTimer = 0;

  player.frameIndex = 0;
  player.frameCounter = 0;
  player.currentAnimName = "";
}

function drawFreezeOverlay() {
  push();
  noStroke();

  fill(190, 210, 255, 25);
  rect(0, 0, width, height);

  fill(30, 40, 60, 45);
  rect(0, 0, width, height);

  pop();
}

/************************************************************
 * LEVEL ADVANCEMENT
 ************************************************************/
function advanceLevel() {
  if (currentLevel < TOTAL_LEVELS) {
    currentLevel++;
    loadCurrentLevel();
  } else {
    triggerVictory();
  }
}

/************************************************************
 * 19) WORLD / GOAL / DRAWING
 ************************************************************/
function drawWorldBackground() {
  const activeBg = getBackgroundImageForCurrentLevel();

  if (activeBg) {
    image(activeBg, 0, 0, WORLD_W, WORLD_H);
  } else {
    background(40, 25, 20);
  }
}

function drawWorldBounds() {
  // optional
}

function drawPixelBox(x, y, w, h) {
  noStroke();

  fill(0, 0, 0, 120);
  rect(x + 4, y + 4, w, h);

  fill(30, 45, 30, 245);
  rect(x, y, w, h);

  fill(140, 170, 70, 255);
  rect(x + 3, y + 3, w - 6, h - 6);

  fill(35, 55, 35, 240);
  rect(x + 6, y + 6, w - 12, h - 12);
}

/************************************************************
 * 20) triggering game over and victory screen
 ************************************************************/
function triggerGameOver() {
  gameEnded = true;
  finalTime = currentTime;
  endSoundType = "lose";
  endMessage = "GAME OVER";

  scene = SCENES.END;
}

function triggerVictory() {
  gameEnded = true;
  finalTime = currentTime;
  endSoundType = "win";
  endMessage = "YOU ESCAPED!";

  if (bestTime === null || finalTime < bestTime) {
    bestTime = finalTime;
  }

  scene = SCENES.END;
}
