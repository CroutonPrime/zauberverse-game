const CARD_LIBRARY = [
  {
    id: "rooftop-runner",
    name: "Rooftop Runner",
    cost: 2,
    attack: 2,
    health: 2,
    text: "A quick operative trained for vertical pursuit."
  },
  {
    id: "smoke-decoy",
    name: "Smoke Decoy",
    cost: 1,
    attack: 0,
    health: 4,
    text: "A dense human-shaped absence that holds the lane."
  },
  {
    id: "wraith-echo",
    name: "Wraith Echo",
    cost: 3,
    attack: 3,
    health: 2,
    shield: true,
    text: "Phase Shield: ignores the first incoming hit."
  },
  {
    id: "harrow",
    name: "Sir Alistair Harrow",
    cost: 4,
    attack: 2,
    health: 5,
    mentor: true,
    text: "Mentor: your other deployed units gain +1 attack."
  },
  {
    id: "night-infiltrator",
    name: "Night Infiltrator",
    cost: 3,
    attack: 4,
    health: 1,
    text: "Fragile, fast and brutally efficient."
  },
  {
    id: "reactor-survivor",
    name: "Reactor Survivor",
    cost: 2,
    attack: 1,
    health: 4,
    text: "Radiation changed more than anyone understands."
  },
  {
    id: "spectral-tail",
    name: "Spectral Cape",
    cost: 2,
    attack: 2,
    health: 3,
    text: "A black-violet remnant arrives after its owner."
  },
  {
    id: "crown-agent",
    name: "Crown Intelligence Agent",
    cost: 3,
    attack: 2,
    health: 4,
    text: "Information is a weapon before violence begins."
  }
];

const ENEMY_LIBRARY = [
  { name: "Security Drone", cost: 2, attack: 2, health: 2, text: "Automated perimeter defense." },
  { name: "Blacksite Guard", cost: 2, attack: 2, health: 3, text: "A disposable line of defense." },
  { name: "Rift Hound", cost: 3, attack: 4, health: 2, text: "It smells the space between worlds." },
  { name: "Containment Heavy", cost: 4, attack: 3, health: 5, text: "Built to keep impossible things inside." },
  { name: "Null Operative", cost: 3, attack: 3, health: 3, text: "Trained to hunt altered humans." }
];

const state = {
  playerHealth: 20,
  enemyHealth: 20,
  energy: 5,
  enemyEnergy: 5,
  round: 1,
  selectedCardIndex: null,
  deck: [],
  hand: [],
  lanes: [
    { player: null, enemy: null },
    { player: null, enemy: null },
    { player: null, enemy: null }
  ],
  gameOver: false
};

const battlefield = document.querySelector("#battlefield");
const handElement = document.querySelector("#hand");
const energyElement = document.querySelector("#energy");
const playerHealthElement = document.querySelector("#player-health");
const enemyHealthElement = document.querySelector("#enemy-health");
const messageElement = document.querySelector("#message");
const roundLabel = document.querySelector("#round-label");
const deckCount = document.querySelector("#deck-count");
const endTurnButton = document.querySelector("#end-turn-button");
const restartButton = document.querySelector("#restart-button");
const rulesButton = document.querySelector("#rules-button");
const rulesDialog = document.querySelector("#rules-dialog");
const closeRulesButton = document.querySelector("#close-rules-button");

function cloneCard(card) {
  return {
    ...card,
    currentAttack: card.attack,
    currentHealth: card.health,
    shieldActive: Boolean(card.shield)
  };
}

function shuffle(cards) {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resetGame() {
  state.playerHealth = 20;
  state.enemyHealth = 20;
  state.energy = 5;
  state.enemyEnergy = 5;
  state.round = 1;
  state.selectedCardIndex = null;
  state.deck = shuffle(CARD_LIBRARY.map(cloneCard));
  state.hand = [];
  state.lanes = [
    { player: null, enemy: null },
    { player: null, enemy: null },
    { player: null, enemy: null }
  ];
  state.gameOver = false;

  drawCards(4);
  setMessage("Select a card, then choose a lane.");
  render();
}

function drawCards(amount) {
  while (amount > 0 && state.deck.length > 0 && state.hand.length < 6) {
    state.hand.push(state.deck.shift());
    amount -= 1;
  }
}

function setMessage(text) {
  messageElement.textContent = text;
}

function render() {
  playerHealthElement.textContent = Math.max(0, state.playerHealth);
  enemyHealthElement.textContent = Math.max(0, state.enemyHealth);
  energyElement.textContent = `${state.energy} / 10`;
  roundLabel.textContent = `ROUND ${state.round}`;
  deckCount.textContent = `Deck: ${state.deck.length}`;
  endTurnButton.disabled = state.gameOver;

  renderBattlefield();
  renderHand();
}

function renderBattlefield() {
  battlefield.innerHTML = "";

  state.lanes.forEach((lane, index) => {
    const laneElement = document.createElement("article");
    laneElement.className = "lane";

    const enemySlot = createSlot(lane.enemy, "enemy", index);
    const playerSlot = createSlot(lane.player, "player", index);

    const divider = document.createElement("div");
    divider.className = "lane-divider";

    const header = document.createElement("div");
    header.className = "lane-header";
    header.innerHTML = `<span>LANE 0${index + 1}</span><span>${lane.enemy || lane.player ? "CONTESTED" : "OPEN"}</span>`;

    laneElement.append(header, enemySlot, divider, playerSlot);
    battlefield.appendChild(laneElement);
  });
}

function createSlot(unit, side, laneIndex) {
  const slot = document.createElement("div");
  slot.className = `slot ${side}-slot ${unit ? "occupied" : "empty"}`;

  if (!unit) {
    const label = document.createElement("span");
    label.className = "empty-label";
    label.textContent = side === "enemy" ? "ENEMY DEPLOYMENT" : "CLICK TO DEPLOY";
    slot.appendChild(label);
  } else {
    slot.appendChild(createUnitElement(unit, side));
  }

  if (side === "player") {
    slot.addEventListener("click", () => deploySelectedCard(laneIndex));
  }

  return slot;
}

function createUnitElement(unit, side) {
  const unitElement = document.createElement("div");
  unitElement.className = `unit ${side}-unit`;

  const shieldBadge = unit.shieldActive
    ? '<span class="shield-badge">PHASED</span>'
    : "";

  unitElement.innerHTML = `
    ${shieldBadge}
    <h3>${unit.name}</h3>
    <p>${unit.text}</p>
    <div class="stats">
      <span class="stat">ATK ${unit.currentAttack}</span>
      <span class="stat">HP ${unit.currentHealth}</span>
    </div>
  `;

  return unitElement;
}

function renderHand() {
  handElement.innerHTML = "";

  state.hand.forEach((card, index) => {
    const cardButton = document.createElement("button");
    const selected = state.selectedCardIndex === index;
    const affordable = card.cost <= state.energy;

    cardButton.type = "button";
    cardButton.className = [
      "hand-card",
      selected ? "selected" : "",
      affordable ? "" : "unaffordable"
    ].join(" ");

    cardButton.innerHTML = `
      <span class="card-cost">${card.cost}</span>
      <h3>${card.name}</h3>
      <p>${card.text}</p>
      <div class="card-stats">
        <span class="stat">ATK ${card.attack}</span>
        <span class="stat">HP ${card.health}</span>
      </div>
    `;

    cardButton.addEventListener("click", () => selectCard(index));
    handElement.appendChild(cardButton);
  });
}

function selectCard(index) {
  if (state.gameOver) return;

  const card = state.hand[index];
  if (!card) return;

  if (card.cost > state.energy) {
    setMessage(`${card.name} costs ${card.cost} energy.`);
    return;
  }

  state.selectedCardIndex = state.selectedCardIndex === index ? null : index;
  setMessage(
    state.selectedCardIndex === null
      ? "Selection cleared."
      : `${card.name} selected. Choose an empty allied lane.`
  );
  renderHand();
}

function deploySelectedCard(laneIndex) {
  if (state.gameOver) return;

  if (state.selectedCardIndex === null) {
    setMessage("Select a card from your hand first.");
    return;
  }

  if (state.lanes[laneIndex].player) {
    setMessage("That allied lane is already occupied.");
    return;
  }

  const card = state.hand[state.selectedCardIndex];
  if (!card || card.cost > state.energy) {
    setMessage("You do not have enough energy.");
    return;
  }

  state.energy -= card.cost;
  state.lanes[laneIndex].player = cloneCard(card);
  state.hand.splice(state.selectedCardIndex, 1);
  state.selectedCardIndex = null;

  applyMentorBonus();
  setMessage(`${card.name} deployed to Lane ${laneIndex + 1}.`);
  render();
}

function applyMentorBonus() {
  const harrowPresent = state.lanes.some(
    lane => lane.player && lane.player.id === "harrow"
  );

  state.lanes.forEach(lane => {
    if (!lane.player) return;
    lane.player.currentAttack = lane.player.attack;
    if (harrowPresent && lane.player.id !== "harrow") {
      lane.player.currentAttack += 1;
    }
  });
}

function enemyDeploy() {
  const openLanes = state.lanes
    .map((lane, index) => ({ lane, index }))
    .filter(entry => !entry.lane.enemy);

  if (openLanes.length === 0) return;

  const affordableCards = ENEMY_LIBRARY.filter(card => card.cost <= state.enemyEnergy);
  if (affordableCards.length === 0) return;

  const chosenCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
  const chosenLane = openLanes[Math.floor(Math.random() * openLanes.length)];

  state.enemyEnergy -= chosenCard.cost;
  chosenLane.lane.enemy = cloneCard(chosenCard);
}

function dealDamage(unit, amount) {
  if (unit.shieldActive && amount > 0) {
    unit.shieldActive = false;
    return;
  }
  unit.currentHealth -= amount;
}

function resolveCombat() {
  const reports = [];

  state.lanes.forEach((lane, index) => {
    const playerUnit = lane.player;
    const enemyUnit = lane.enemy;

    if (playerUnit && enemyUnit) {
      const playerDamage = playerUnit.currentAttack;
      const enemyDamage = enemyUnit.currentAttack;

      dealDamage(enemyUnit, playerDamage);
      dealDamage(playerUnit, enemyDamage);
      reports.push(`Lane ${index + 1} exchanged fire.`);
    } else if (playerUnit) {
      state.enemyHealth -= playerUnit.currentAttack;
      reports.push(`${playerUnit.name} struck The Blacksite for ${playerUnit.currentAttack}.`);
    } else if (enemyUnit) {
      state.playerHealth -= enemyUnit.currentAttack;
      reports.push(`${enemyUnit.name} struck Wraith for ${enemyUnit.currentAttack}.`);
    }

    if (lane.player && lane.player.currentHealth <= 0) {
      lane.player = null;
    }
    if (lane.enemy && lane.enemy.currentHealth <= 0) {
      lane.enemy = null;
    }
  });

  applyMentorBonus();
  return reports;
}

function endRound() {
  if (state.gameOver) return;

  enemyDeploy();
  const reports = resolveCombat();

  if (checkGameOver()) {
    render();
    return;
  }

  state.round += 1;
  state.energy = Math.min(10, state.energy + 4);
  state.enemyEnergy = Math.min(10, state.enemyEnergy + 4);
  drawCards(1);
  state.selectedCardIndex = null;

  setMessage(reports[0] || "The battlefield remains silent.");
  render();
}

function checkGameOver() {
  if (state.playerHealth <= 0 && state.enemyHealth <= 0) {
    state.gameOver = true;
    setMessage("DRAW — both command structures collapsed.");
  } else if (state.enemyHealth <= 0) {
    state.gameOver = true;
    setMessage("VICTORY — the Blacksite has been breached.");
  } else if (state.playerHealth <= 0) {
    state.gameOver = true;
    setMessage("DEFEAT — Wraith has been contained.");
  }

  return state.gameOver;
}

endTurnButton.addEventListener("click", endRound);
restartButton.addEventListener("click", resetGame);
rulesButton.addEventListener("click", () => rulesDialog.showModal());
closeRulesButton.addEventListener("click", () => rulesDialog.close());

resetGame();
