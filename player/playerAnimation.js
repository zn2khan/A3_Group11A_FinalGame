/************************************************************
 * 12) PLAYER ANIMATION UPDATE
 ************************************************************/
function updateAnimation() {
  const anim = getCurrentAnimation();
  const animName = anim.name;

  if (animName !== player.currentAnimName) {
    player.currentAnimName = animName;
    player.frameIndex = 0;
    player.frameCounter = 0;
  }

  player.frameCounter++;

  const frameDelay = anim.frameDelay ?? player.frameDelay;

  if (player.frameCounter >= frameDelay) {
    player.frameCounter = 0;

    if (anim.loop === false) {
      if (player.frameIndex < anim.frames - 1) {
        player.frameIndex++;
      }
    } else {
      player.frameIndex++;
      if (player.frameIndex >= anim.frames) {
        player.frameIndex = 0;
      }
    }
  }
}

/************************************************************
 * 14) GET CURRENT PLAYER ANIMATION
 ************************************************************/
function getCurrentAnimation() {
  // Special frozen / stunned animation
  if (freezeEffect.active && sprites.freeze) {
    return {
      name: "freeze",
      sheet: sprites.freeze,
      frames: 12,
      frameW: 18,
      frameH: 29,
      frameDelay: 6,
      loop: false,
    };
  }

  const immune = isPlayerImmune();

  if (player.moving) {
    if (player.direction === "down") {
      return {
        name: immune ? "down_run_mask" : "down_run",
        sheet: immune && sprites.downRunMask ? sprites.downRunMask : sprites.downRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }

    if (player.direction === "up") {
      return {
        name: immune ? "up_run_mask" : "up_run",
        sheet: sprites.upRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }

    if (player.direction === "left") {
      return {
        name: immune ? "left_run_mask" : "left_run",
        sheet: immune && sprites.leftRunMask ? sprites.leftRunMask : sprites.leftRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }

    if (player.direction === "right") {
      return {
        name: immune ? "right_run_mask" : "right_run",
        sheet: immune && sprites.rightRunMask ? sprites.rightRunMask : sprites.rightRun,
        frames: 8,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
  } else {
    if (player.direction === "down") {
      return {
        name: immune ? "down_idle_mask" : "down_idle",
        sheet: immune && sprites.idleDownMask ? sprites.idleDownMask : sprites.idleDown,
        frames: 7,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }

    if (player.direction === "up") {
      return {
        name: immune ? "up_idle_mask" : "up_idle",
        sheet: sprites.idleUp,
        frames: 7,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }

    if (player.direction === "left") {
      return {
        name: immune ? "left_idle_mask" : "left_idle",
        sheet: immune && sprites.idleLeftMask ? sprites.idleLeftMask : sprites.idleLeft,
        frames: 2,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }

    if (player.direction === "right") {
      return {
        name: immune ? "right_idle_mask" : "right_idle",
        sheet: immune && sprites.idleRightMask ? sprites.idleRightMask : sprites.idleRight,
        frames: 2,
        frameW: 18,
        frameH: 29,
        frameDelay: 8,
        loop: true,
      };
    }
  }

  return {
    name: immune ? "down_idle_mask" : "down_idle",
    sheet: immune && sprites.idleDownMask ? sprites.idleDownMask : sprites.idleDown,
    frames: 7,
    frameW: 18,
    frameH: 29,
    frameDelay: 8,
    loop: true,
  };
}