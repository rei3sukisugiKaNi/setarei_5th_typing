// main.js

import { problemList } from './problems.js';

let currentIndex = 0;
let currentProblem = null;
let currentKana = "";
let score = 0;
let miss = 0;
let timeLeft = 60;
let timer;
let bgmPlaying = true;
let bgm = new Audio("./assets/bgm.mp3");
bgm.loop = true;
bgm.volume = 0.3;

let shuffledProblems = []; // 2問目以降のランダム用

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const gameScreen = document.getElementById("gameScreen");
const titleScreen = document.getElementById("titleScreen");
const kanaText = document.getElementById("kanaText");
const kanjiText = document.getElementById("kanjiText");
const inputBox = document.getElementById("inputBox");
const timerDisplay = document.getElementById("small-timer");
const resultDisplay = document.getElementById("result");
const muteButton = document.getElementById("muteButton");

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startGame() {
  titleScreen.style.display = "none";
  gameScreen.style.display = "block";
  resultDisplay.innerHTML = "";
  restartButton.style.display = "none";
  inputBox.style.display = "inline-block";

  score = 0;
  miss = 0;
  timeLeft = 60;
  currentIndex = 0;
  currentKana = "";
  currentProblem = null;

  const rest = problemList.slice(1); // 1問目を除く
  shuffledProblems = shuffleArray(rest);

  bgm.play();
  bgm.muted = !bgmPlaying;
  updateMuteButton();

  nextProblem();
  updateTimer();
  inputBox.value = "";
  inputBox.focus();

  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function updateTimer() {
  timerDisplay.textContent = `残り${timeLeft}秒`;
}

function nextProblem() {
  if (currentIndex === 0) {
    currentProblem = problemList[0];
  } else if (currentIndex <= shuffledProblems.length) {
    currentProblem = shuffledProblems[currentIndex - 1];
  } else {
    endGame();
    return;
  }

  currentKana = currentProblem.kana;
  kanjiText.textContent = currentProblem.kanji;
  kanaText.textContent = currentProblem.kana;
  inputBox.value = "";
  inputBox.focus();
  currentIndex++;
}

function handleInput(e) {
  const typed = e.target.value.normalize("NFC").trim();
  if (typed === currentKana) {
    score += currentKana.length;
    nextProblem();
  } else if (!currentKana.startsWith(typed)) {
    miss++;
  }
}

function endGame() {
  inputBox.style.display = "none";
  kanjiText.textContent = "";
  kanaText.textContent = "";

  const speed = (score / 60).toFixed(2);
  let rank = "C";
  if (score >= 270) rank = "S";
  else if (score >= 220) rank = "A";
  else if (score >= 170) rank = "B";

  resultDisplay.innerHTML = `おつかれさまでした<br><span class="rank">ランク: ${rank}</span><br>
    正しく打ったキー: ${score}<br>
    ミスタイプ: ${miss}<br>
    平均タイプ数: ${speed} 回/秒`;

  restartButton.style.display = "inline-block";
  inputBox.blur();
}

function updateMuteButton() {
  muteButton.textContent = bgmPlaying ? "🔇 BGM: OFF" : "🔊 BGM: ON";
}

function toggleMute() {
  bgmPlaying = !bgmPlaying;
  bgm.muted = !bgmPlaying;
  updateMuteButton();
}

startButton.addEventListener("click", () => {
  document.addEventListener("click", () => inputBox.focus());
  startGame();
});

restartButton.addEventListener("click", () => {
  document.addEventListener("click", () => inputBox.focus());
  startGame();
});

muteButton.addEventListener("click", toggleMute);
inputBox.addEventListener("input", handleInput);
