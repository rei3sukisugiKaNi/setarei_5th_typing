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
let shuffledProblems = []; // 2問目以降のランダム用
const bgm = new Audio("./bgm.mp3");
bgm.loop = true;
bgm.volume = 0.3; // 🔉 音量を調整（0.0 ～ 1.0）

const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const timerDisplay = document.getElementById("small-timer");
const kanaText = document.getElementById("kanaText");
const kanjiText = document.getElementById("kanjiText");
const inputBox = document.getElementById("inputBox");
const resultDisplay = document.getElementById("result");
const restartButton = document.getElementById("restartButton");
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
  restartButton.style.display = "none";
  resultDisplay.textContent = "";

  score = 0;
  miss = 0;
  timeLeft = 60;
  currentIndex = 0;
  currentProblem = null;
  currentKana = "";
  
  bgm.play();
  bgmPlaying = true;
  updateMuteButton();
  nextProblem();
  updateTimer();
  inputBox.value = "";
  inputBox.focus();


  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function updateTimer() {
  timerDisplay.textContent = `残り時間${timeLeft}秒`;
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
  const typed = e.target.value.normalize("NFC").trim(); // ←★ここで normalize("NFC") を追加！
  if (typed === currentKana) {
    score += currentKana.length;
    nextProblem();
  } else if (!currentKana.startsWith(typed)) {
    miss++;
  }
}

function endGame() {
  clearInterval(timer);
  kanjiText.textContent = "";
  kanaText.textContent = "";
  inputBox.style.display = "none";

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
  startGame();
});

restartButton.addEventListener("click", () => {
  inputBox.style.display = "inline-block";
  startGame();
});

muteButton.addEventListener("click", toggleMute);
inputBox.addEventListener("input", handleInput);
document.addEventListener("click", () => inputBox.focus());
