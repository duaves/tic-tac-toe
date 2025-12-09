const cells = Array.from(document.querySelectorAll(".cell"));
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

const PLAYER_MARK = "O"; // отображаем как сердце
const COMPUTER_MARK = "✖";

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill(null);
let gameActive = true;

function init() {
  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.dataset.index = index;
    cell.addEventListener("click", onPlayerMove);
  });

  restartBtn.addEventListener("click", resetGame);
  resetGame();
}

function onPlayerMove(event) {
  if (!gameActive) return;

  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (board[index]) return;

  placeMark(index, PLAYER_MARK);

  if (checkWin(PLAYER_MARK)) {
    handlePlayerWin();
    return;
  }

  if (isDraw()) {
    handleDraw();
    return;
  }

  computerMove();
}

function computerMove() {
  if (!gameActive) return;

  // Try to win
  const winIndex = findStrategicMove(COMPUTER_MARK);
  if (winIndex !== null) {
    placeMark(winIndex, COMPUTER_MARK);
    if (checkWin(COMPUTER_MARK)) {
      handlePlayerLoss();
      return;
    }
    if (isDraw()) handleDraw();
    return;
  }

  // Block player
  const blockIndex = findStrategicMove(PLAYER_MARK);
  if (blockIndex !== null) {
    placeMark(blockIndex, COMPUTER_MARK);
    if (checkWin(COMPUTER_MARK)) {
      handlePlayerLoss();
      return;
    }
    if (isDraw()) handleDraw();
    return;
  }

  // Random move
  const available = board
    .map((value, idx) => (value === null ? idx : null))
    .filter((idx) => idx !== null);

  if (!available.length) {
    handleDraw();
    return;
  }

  const randomIndex = available[Math.floor(Math.random() * available.length)];
  placeMark(randomIndex, COMPUTER_MARK);

  if (checkWin(COMPUTER_MARK)) {
    handlePlayerLoss();
    return;
  }

  if (isDraw()) {
    handleDraw();
  } else {
    messageEl.textContent = "Ваш ход!";
  }
}

function placeMark(index, mark) {
  board[index] = mark;
  const cell = cells[index];
  const displayMark = mark === PLAYER_MARK ? "❤" : mark;
  cell.textContent = displayMark;
  if (mark === PLAYER_MARK) {
    cell.classList.add("cell--o");
  } else {
    cell.classList.remove("cell--o");
  }
}

function findStrategicMove(mark) {
  for (const pattern of WIN_PATTERNS) {
    const values = pattern.map((idx) => board[idx]);
    const markCount = values.filter((v) => v === mark).length;
    const emptyIndex = pattern.find((idx) => board[idx] === null);

    if (markCount === 2 && emptyIndex !== undefined && board[emptyIndex] === null) {
      return emptyIndex;
    }
  }
  return null;
}

function checkWin(mark) {
  return WIN_PATTERNS.some((pattern) =>
    pattern.every((idx) => board[idx] === mark)
  );
}

function isDraw() {
  return board.every((cell) => cell !== null);
}

function generatePromoCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function sendResultToTelegram(type, code = null) {
  fetch("/api/send.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, code })
  }).catch(err => console.error("Telegram error:", err));
}

function handlePlayerWin() {
  gameActive = false;
  const promo = generatePromoCode();
  messageEl.textContent = `Победа! Ваш промокод: ${promo}`;
  restartBtn.style.display = "inline-flex";
  sendResultToTelegram("win", promo);
}

function handlePlayerLoss() {
  gameActive = false;
  messageEl.textContent = "Вы проиграли! Попробуйте ещё раз.";
  restartBtn.style.display = "inline-flex";
  sendResultToTelegram("lose");
}

function handleDraw() {
  gameActive = false;
  messageEl.textContent = "Ничья!";
  restartBtn.style.display = "inline-flex";
}

function resetGame() {
  board = Array(9).fill(null);
  gameActive = true;
  messageEl.textContent = "Ваш ход!";
  restartBtn.style.display = "none";
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("cell--o");
  });
}

init();

