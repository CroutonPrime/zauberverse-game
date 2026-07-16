/* Zauberverse Moving Arena Prototype 0.2
 *
 * This is intentionally built without character art.
 * The goal is to test real-time movement, deployment, targeting and combat.
 */

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const MAX_ENERGY = 10;
const LANE_X = [300, 640, 980];
const ARENA_TOP = 68;
const ARENA_BOTTOM = 574;
const PLAYER_SPAWN_Y = 520;
const ENEMY_SPAWN_Y = 122;
const PLAYER_CORE_Y = 562;
const ENEMY_CORE_Y = 82;

const CARD_DATA = [
  {
    id: "wraith",
    name: "WRAITH ECHO",
    cost: 3,
    hp: 8,
    damage: 3,
    speed: 74,
    range: 48,
    cooldown: 760,
    color: 0x8055e8,
    teleport: true,
    description: "Fast striker. Periodically jumps forward."
  },
  {
    id: "harrow",
    name: "HARROW AGENT",
    cost: 4,
    hp: 14,
    damage: 3,
    speed: 39,
    range: 50,
    cooldown: 920,
    color: 0x78808f,
    description: "Slow, disciplined and difficult to remove."
  },
  {
    id: "runner",
    name: "NIGHT RUNNER",
    cost: 2,
    hp: 5,
    damage: 2,
    speed: 92,
    range: 43,
    cooldown: 590,
    color: 0xa14f72,
    description: "Cheap pressure with high movement speed."
  },
  {
    id: "decoy",
    name: "SMOKE DECOY",
    cost: 2,
    hp: 11,
    damage: 1,
    speed: 30,
    range: 44,
    cooldown: 1050,
    color: 0x443850,
    description: "A durable obstruction that absorbs attacks."
  }
];

const ENEMY_DATA = [
  {
    id: "guard",
    name: "BLACKSITE GUARD",
    cost: 2,
    hp: 7,
    damage: 2,
    speed: 55,
    range: 45,
    cooldown: 800,
    color: 0xa83c51
  },
  {
    id: "hound",
    name: "RIFT HOUND",
    cost: 3,
    hp: 6,
    damage: 4,
    speed: 84,
    range: 44,
    cooldown: 830,
    color: 0xd05a46
  },
  {
    id: "heavy",
    name: "CONTAINMENT HEAVY",
    cost: 4,
    hp: 15,
    damage: 3,
    speed: 34,
    range: 52,
    cooldown: 980,
    color: 0x8c2737
  }
];

class BattleScene extends Phaser.Scene {
  constructor() {
    super("BattleScene");
    this.units = [];
    this.selectedCardIndex = 0;
    this.playerEnergy = 5;
    this.enemyEnergy = 5;
    this.playerCoreHp = 30;
    this.enemyCoreHp = 30;
    this.lastEnergyTick = 0;
    this.lastEnemyDeploy = 0;
    this.matchEnded = false;
    this.unitCounter = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor("#09070f");

    this.createArena();
    this.createCores();
    this.createHud();
    this.createCardBar();
    this.createLaneInputs();

    this.input.on("pointerdown", () => {
      if (this.matchEnded) {
        return;
      }
    });

    this.showMessage("Select a card, then click a lane to deploy.");

    // Begin with one enemy after a short delay so the board immediately moves.
    this.time.delayedCall(1100, () => this.enemyDeploy(true));
  }

  createArena() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x0f0b15, 1);
    graphics.fillRoundedRect(38, 42, GAME_WIDTH - 76, 548, 22);

    graphics.lineStyle(1, 0x342942, 1);
    graphics.strokeRoundedRect(38, 42, GAME_WIDTH - 76, 548, 22);

    // Enemy and player territory washes.
    graphics.fillStyle(0x8b2739, 0.09);
    graphics.fillRect(39, 43, GAME_WIDTH - 78, 240);

    graphics.fillStyle(0x6845b5, 0.11);
    graphics.fillRect(39, 350, GAME_WIDTH - 78, 239);

    // Center line.
    graphics.lineStyle(2, 0x4a3e58, 0.72);
    graphics.lineBetween(58, 316, GAME_WIDTH - 58, 316);

    // Three readable paths.
    LANE_X.forEach((x, index) => {
      graphics.lineStyle(4, 0x2a2234, 1);
      graphics.lineBetween(x, ARENA_TOP + 32, x, ARENA_BOTTOM - 25);

      graphics.lineStyle(1, 0x8b75a6, 0.32);
      graphics.lineBetween(x, ARENA_TOP + 32, x, ARENA_BOTTOM - 25);

      this.add
        .text(x, 326, `LANE 0${index + 1}`, {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#756b84",
          letterSpacing: 2
        })
        .setOrigin(0.5);
    });

    this.add
      .text(64, 56, "BLACKSITE TERRITORY", {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#b96b79",
        letterSpacing: 2
      });

    this.add
      .text(64, 558, "WRAITH TERRITORY", {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#a58bff",
        letterSpacing: 2
      });
  }

  createCores() {
    this.enemyCore = this.createCore(
      GAME_WIDTH / 2,
      ENEMY_CORE_Y,
      "THE BLACKSITE",
      0xb33f53,
      -1
    );

    this.playerCore = this.createCore(
      GAME_WIDTH / 2,
      PLAYER_CORE_Y,
      "WRAITH",
      0x8055e8,
      1
    );
  }

  createCore(x, y, label, color, labelDirection) {
    const container = this.add.container(x, y);

    const glow = this.add.circle(0, 0, 39, color, 0.12);
    const body = this.add.rectangle(0, 0, 94, 36, 0x0c0910, 1);
    body.setStrokeStyle(2, color, 0.95);

    const text = this.add
      .text(0, labelDirection * 32, label, {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#f4efff",
        letterSpacing: 1
      })
      .setOrigin(0.5);

    container.add([glow, body, text]);

    return { container, body, glow };
  }

  createHud() {
    this.enemyHealthText = this.add
      .text(GAME_WIDTH - 62, 54, "BLACKSITE 30", {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ef9eaa"
      })
      .setOrigin(1, 0);

    this.playerHealthText = this.add
      .text(GAME_WIDTH - 62, 553, "WRAITH 30", {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#b9a2ff"
      })
      .setOrigin(1, 0);

    this.energyText = this.add.text(46, 620, "ENERGY 5 / 10", {
      fontFamily: "Inter, sans-serif",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#b99cff"
    });

    this.messageText = this.add
      .text(GAME_WIDTH / 2, 610, "", {
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#d1c9df",
        align: "center"
      })
      .setOrigin(0.5, 0);
  }

  createCardBar() {
    this.cardButtons = [];

    const cardWidth = 230;
    const gap = 16;
    const totalWidth = CARD_DATA.length * cardWidth + (CARD_DATA.length - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;

    CARD_DATA.forEach((card, index) => {
      const x = startX + index * (cardWidth + gap);
      const y = 672;
      const container = this.add.container(x, y);

      const background = this.add.rectangle(0, 0, cardWidth, 70, 0x17111f, 1);
      background.setStrokeStyle(1, 0x40344d, 1);
      background.setInteractive({ useHandCursor: true });

      const costCircle = this.add.circle(-92, 0, 18, 0x25183d, 1);
      costCircle.setStrokeStyle(1, 0xa98cff, 1);

      const costText = this.add
        .text(-92, 0, String(card.cost), {
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#c5b2ff"
        })
        .setOrigin(0.5);

      const titleText = this.add.text(-63, -17, card.name, {
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#f6f1ff"
      });

      const detailText = this.add.text(
        -63,
        5,
        `HP ${card.hp}  ATK ${card.damage}  SPD ${card.speed}`,
        {
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          color: "#91879e"
        }
      );

      container.add([background, costCircle, costText, titleText, detailText]);

      background.on("pointerdown", () => {
        if (this.matchEnded) {
          return;
        }

        this.selectedCardIndex = index;
        this.updateCardSelection();
        this.showMessage(`${card.name} selected. Choose a lane.`);
      });

      this.cardButtons.push({ container, background, card });
    });

    this.updateCardSelection();
  }

  createLaneInputs() {
    this.laneInputs = [];

    LANE_X.forEach((x, laneIndex) => {
      const zone = this.add.zone(x, 318, 300, 490);
      zone.setRectangleDropZone(300, 490);
      zone.setInteractive({ useHandCursor: true });

      zone.on("pointerover", () => {
        if (!this.matchEnded) {
          this.highlightLane(laneIndex, true);
        }
      });

      zone.on("pointerout", () => {
        this.highlightLane(laneIndex, false);
      });

      zone.on("pointerdown", () => {
        this.deploySelectedCard(laneIndex);
      });

      this.laneInputs.push(zone);
    });

    this.laneHighlight = this.add
      .rectangle(LANE_X[0], 318, 282, 474, 0x8b62ef, 0)
      .setStrokeStyle(2, 0xa98cff, 0)
      .setDepth(2);
  }

  highlightLane(laneIndex, visible) {
    this.laneHighlight.setPosition(LANE_X[laneIndex], 318);
    this.laneHighlight.setFillStyle(0x8b62ef, visible ? 0.055 : 0);
    this.laneHighlight.setStrokeStyle(2, 0xa98cff, visible ? 0.45 : 0);
  }

  updateCardSelection() {
    this.cardButtons.forEach((button, index) => {
      const isSelected = index === this.selectedCardIndex;
      const canAfford = button.card.cost <= this.playerEnergy;

      button.background.setStrokeStyle(
        isSelected ? 2 : 1,
        isSelected ? 0xb69aff : 0x40344d,
        canAfford ? 1 : 0.42
      );

      button.container.setAlpha(canAfford ? 1 : 0.45);
      button.container.setScale(isSelected ? 1.03 : 1);
    });
  }

  deploySelectedCard(laneIndex) {
    if (this.matchEnded) {
      return;
    }

    const card = CARD_DATA[this.selectedCardIndex];

    if (card.cost > this.playerEnergy) {
      this.showMessage(`Not enough energy for ${card.name}.`);
      this.flashEnergy();
      return;
    }

    this.playerEnergy -= card.cost;
    this.spawnUnit("player", laneIndex, card);
    this.showMessage(`${card.name} deployed to Lane ${laneIndex + 1}.`);
    this.refreshHud();
  }

  enemyDeploy(force = false) {
    if (this.matchEnded) {
      return;
    }

    const affordable = ENEMY_DATA.filter((unit) => unit.cost <= this.enemyEnergy);

    if (!force && affordable.length === 0) {
      return;
    }

    const card = force
      ? ENEMY_DATA[0]
      : affordable[Phaser.Math.Between(0, affordable.length - 1)];

    if (!force) {
      this.enemyEnergy -= card.cost;
    }

    const laneIndex = Phaser.Math.Between(0, 2);
    this.spawnUnit("enemy", laneIndex, card);
  }

  spawnUnit(side, laneIndex, data) {
    const y = side === "player" ? PLAYER_SPAWN_Y : ENEMY_SPAWN_Y;
    const x = LANE_X[laneIndex];
    const direction = side === "player" ? -1 : 1;
    const unitId = ++this.unitCounter;

    const container = this.add.container(x, y);
    container.setDepth(10);

    const shadow = this.add.ellipse(0, 17, 45, 13, 0x000000, 0.35);
    const aura = this.add.circle(0, 0, 25, data.color, 0.12);
    const body = this.add.circle(0, 0, 17, data.color, 1);
    body.setStrokeStyle(3, side === "player" ? 0xd0c0ff : 0xffa1ad, 0.78);

    const glyph = this.add
      .text(0, 0, data.id === "wraith" ? "W" : data.id === "harrow" ? "H" : "•", {
        fontFamily: "Libre Baskerville, Georgia, serif",
        fontSize: data.id === "wraith" || data.id === "harrow" ? "15px" : "18px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    const hpBack = this.add.rectangle(0, -29, 45, 5, 0x241d2c, 1);
    const hpBar = this.add.rectangle(-22.5, -29, 45, 5, side === "player" ? 0x9b7cff : 0xe16a78, 1);
    hpBar.setOrigin(0, 0.5);

    container.add([shadow, aura, body, glyph, hpBack, hpBar]);
    container.setScale(0.25);
    container.setAlpha(0);

    const unit = {
      unitId,
      side,
      laneIndex,
      direction,
      data,
      container,
      body,
      aura,
      hpBar,
      hp: data.hp,
      maxHp: data.hp,
      damage: data.damage,
      speed: data.speed,
      range: data.range,
      cooldown: data.cooldown,
      nextAttackAt: 0,
      nextTeleportAt: this.time.now + 2500,
      dead: false
    };

    this.units.push(unit);

    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: "Back.Out"
    });

    this.createSpawnFlash(x, y, data.color);
  }

  createSpawnFlash(x, y, color) {
    const ring = this.add.circle(x, y, 10, color, 0);
    ring.setStrokeStyle(3, color, 0.8);
    ring.setDepth(8);

    this.tweens.add({
      targets: ring,
      radius: 45,
      alpha: 0,
      duration: 360,
      onComplete: () => ring.destroy()
    });
  }

  update(time, delta) {
    if (this.matchEnded) {
      return;
    }

    this.updateEnergy(time);
    this.updateEnemyAi(time);
    this.updateUnits(time, delta);
    this.cleanDeadUnits();
    this.checkMatchEnd();
  }

  updateEnergy(time) {
    if (time - this.lastEnergyTick < 1000) {
      return;
    }

    this.lastEnergyTick = time;
    this.playerEnergy = Math.min(MAX_ENERGY, this.playerEnergy + 1);
    this.enemyEnergy = Math.min(MAX_ENERGY, this.enemyEnergy + 1);
    this.refreshHud();
  }

  updateEnemyAi(time) {
    if (time - this.lastEnemyDeploy < 2700) {
      return;
    }

    this.lastEnemyDeploy = time;
    this.enemyDeploy();
  }

  updateUnits(time, delta) {
    const seconds = delta / 1000;

    this.units.forEach((unit) => {
      if (unit.dead) {
        return;
      }

      const target = this.findTarget(unit);
      const coreY = unit.side === "player" ? ENEMY_CORE_Y : PLAYER_CORE_Y;
      const distanceToCore = Math.abs(unit.container.y - coreY);

      if (target) {
        const distance = Math.abs(unit.container.y - target.container.y);

        if (distance <= unit.range) {
          this.attackUnit(unit, target, time);
        } else {
          this.moveUnit(unit, seconds, target.container.y);
        }
      } else if (distanceToCore <= 48) {
        this.attackCore(unit, time);
      } else {
        if (
          unit.data.teleport &&
          time >= unit.nextTeleportAt &&
          distanceToCore > 135
        ) {
          this.performTeleport(unit, time);
        } else {
          this.moveUnit(unit, seconds, coreY);
        }
      }
    });
  }

  findTarget(unit) {
    const opponents = this.units.filter(
      (candidate) =>
        !candidate.dead &&
        candidate.side !== unit.side &&
        candidate.laneIndex === unit.laneIndex
    );

    if (opponents.length === 0) {
      return null;
    }

    opponents.sort(
      (a, b) =>
        Math.abs(unit.container.y - a.container.y) -
        Math.abs(unit.container.y - b.container.y)
    );

    return opponents[0];
  }

  moveUnit(unit, seconds, targetY) {
    const desiredDirection = Math.sign(targetY - unit.container.y);
    const movement = unit.speed * seconds * desiredDirection;
    unit.container.y += movement;

    // Subtle living motion so placeholders already feel animated.
    unit.container.x =
      LANE_X[unit.laneIndex] +
      Math.sin(this.time.now * 0.006 + unit.unitId) * 2.2;
  }

  attackUnit(attacker, target, time) {
    if (time < attacker.nextAttackAt) {
      return;
    }

    attacker.nextAttackAt = time + attacker.cooldown;
    this.playAttackMotion(attacker);
    this.damageUnit(target, attacker.damage);
  }

  attackCore(attacker, time) {
    if (time < attacker.nextAttackAt) {
      return;
    }

    attacker.nextAttackAt = time + attacker.cooldown;

    if (attacker.side === "player") {
      this.enemyCoreHp -= attacker.damage;
      this.flashCore(this.enemyCore, 0xb33f53);
    } else {
      this.playerCoreHp -= attacker.damage;
      this.flashCore(this.playerCore, 0x8055e8);
    }

    this.playAttackMotion(attacker);
    this.refreshHud();
  }

  playAttackMotion(unit) {
    const originalScale = unit.container.scaleX;

    this.tweens.add({
      targets: unit.container,
      scaleX: originalScale * 1.22,
      scaleY: originalScale * 0.84,
      duration: 75,
      yoyo: true,
      ease: "Quad.Out"
    });

    const slash = this.add.rectangle(
      unit.container.x,
      unit.container.y + unit.direction * 25,
      32,
      4,
      unit.side === "player" ? 0xbfa9ff : 0xff8795,
      0.8
    );
    slash.setAngle(unit.direction * -16);
    slash.setDepth(12);

    this.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.8,
      duration: 150,
      onComplete: () => slash.destroy()
    });
  }

  damageUnit(unit, amount) {
    unit.hp -= amount;
    const ratio = Phaser.Math.Clamp(unit.hp / unit.maxHp, 0, 1);
    unit.hpBar.width = 45 * ratio;

    this.tweens.add({
      targets: [unit.body, unit.aura],
      alpha: 0.25,
      duration: 55,
      yoyo: true
    });

    if (unit.hp <= 0) {
      this.killUnit(unit);
    }
  }

  killUnit(unit) {
    if (unit.dead) {
      return;
    }

    unit.dead = true;

    const deathRing = this.add.circle(
      unit.container.x,
      unit.container.y,
      14,
      unit.data.color,
      0.2
    );
    deathRing.setStrokeStyle(2, unit.data.color, 0.9);
    deathRing.setDepth(7);

    this.tweens.add({
      targets: deathRing,
      radius: 55,
      alpha: 0,
      duration: 400,
      onComplete: () => deathRing.destroy()
    });

    this.tweens.add({
      targets: unit.container,
      alpha: 0,
      scale: 1.6,
      duration: 260,
      ease: "Quad.Out"
    });
  }

  cleanDeadUnits() {
    const survivors = [];

    this.units.forEach((unit) => {
      if (unit.dead && unit.container.alpha <= 0.02) {
        unit.container.destroy(true);
      } else {
        survivors.push(unit);
      }
    });

    this.units = survivors;
  }

  performTeleport(unit, time) {
    unit.nextTeleportAt = time + 3200;

    const startY = unit.container.y;
    const jump = 112 * unit.direction;
    const destinationY = Phaser.Math.Clamp(
      startY + jump,
      ENEMY_CORE_Y + 60,
      PLAYER_CORE_Y - 60
    );

    const afterImage = this.add.circle(
      unit.container.x,
      startY,
      19,
      unit.data.color,
      0.24
    );
    afterImage.setStrokeStyle(2, 0xcabaff, 0.65);
    afterImage.setDepth(6);

    const flash = this.add.circle(
      unit.container.x,
      startY,
      8,
      0xf7f2ff,
      0.92
    );
    flash.setDepth(15);

    this.tweens.add({
      targets: flash,
      radius: 42,
      alpha: 0,
      duration: 120,
      onComplete: () => flash.destroy()
    });

    this.tweens.add({
      targets: afterImage,
      alpha: 0,
      scale: 2.2,
      duration: 430,
      onComplete: () => afterImage.destroy()
    });

    this.tweens.add({
      targets: unit.container,
      alpha: 0,
      duration: 70,
      onComplete: () => {
        unit.container.y = destinationY;

        const arrival = this.add.circle(
          unit.container.x,
          destinationY,
          12,
          0xf4ecff,
          0.9
        );
        arrival.setDepth(15);

        this.tweens.add({
          targets: arrival,
          radius: 47,
          alpha: 0,
          duration: 150,
          onComplete: () => arrival.destroy()
        });

        this.tweens.add({
          targets: unit.container,
          alpha: 1,
          duration: 100
        });
      }
    });
  }

  flashCore(core, color) {
    this.tweens.add({
      targets: [core.body, core.glow],
      alpha: 0.25,
      duration: 65,
      yoyo: true
    });

    const ring = this.add.circle(
      core.container.x,
      core.container.y,
      30,
      color,
      0
    );
    ring.setStrokeStyle(3, color, 0.85);

    this.tweens.add({
      targets: ring,
      radius: 72,
      alpha: 0,
      duration: 260,
      onComplete: () => ring.destroy()
    });
  }

  flashEnergy() {
    this.tweens.add({
      targets: this.energyText,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 2
    });
  }

  refreshHud() {
    this.playerCoreHp = Math.max(0, this.playerCoreHp);
    this.enemyCoreHp = Math.max(0, this.enemyCoreHp);

    this.energyText.setText(`ENERGY ${this.playerEnergy} / ${MAX_ENERGY}`);
    this.enemyHealthText.setText(`BLACKSITE ${this.enemyCoreHp}`);
    this.playerHealthText.setText(`WRAITH ${this.playerCoreHp}`);

    this.updateCardSelection();
  }

  showMessage(message) {
    this.messageText.setText(message);
  }

  checkMatchEnd() {
    if (this.enemyCoreHp <= 0) {
      this.endMatch("BLACKSITE BREACHED", "WRAITH VICTORY");
    } else if (this.playerCoreHp <= 0) {
      this.endMatch("WRAITH CONTAINED", "DEFEAT");
    }
  }

  endMatch(title, subtitle) {
    this.matchEnded = true;

    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x050407,
      0.82
    );
    overlay.setDepth(90);

    const panel = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      540,
      240,
      0x120e19,
      1
    );
    panel.setStrokeStyle(2, 0x8055e8, 1);
    panel.setDepth(91);

    const titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 55, title, {
        fontFamily: "Libre Baskerville, Georgia, serif",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#f7f2ff"
      })
      .setOrigin(0.5)
      .setDepth(92);

    const subtitleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8, subtitle, {
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#b69aff",
        letterSpacing: 3
      })
      .setOrigin(0.5)
      .setDepth(92);

    const restart = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 62,
      210,
      48,
      0x714ad1,
      1
    );
    restart.setStrokeStyle(1, 0xbda5ff, 1);
    restart.setInteractive({ useHandCursor: true });
    restart.setDepth(92);

    const restartText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 62, "RESTART MATCH", {
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5)
      .setDepth(93);

    restart.on("pointerdown", () => this.scene.restart());

    this.tweens.add({
      targets: [panel, titleText, subtitleText, restart, restartText],
      scale: { from: 0.85, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 240,
      ease: "Back.Out"
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#09070f",
  scene: [BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  }
};

new Phaser.Game(config);
