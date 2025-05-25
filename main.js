// main.js

import { problemList } from './problems.js';
import { inputMap } from './input_map.js';

let currentIndex = 0;
let currentProblem = null;
let currentKana = "";
let currentRomajiCandidates = [];
let inputBuffer = "";
let score = 0;
let miss = 0;
let timeLeft = 60;
let timer;
let bgmPlaying = false;
let bgm = new Audio("./bgm.mp3");
bgm.loop = true;
bgm.volume = 0.3; // 🔉 音量を調整（0.0 ～ 1.0）

const startButton = document.getElementById("startButton");
const timerDisplay = document.getElementById("timer");
const kanaDisplay = document.getElementById("kana");
const romajiDisplay = document.getElementById("romaji");
const resultDisplay = document.getElementById("result");
const restartButton = document.getElementById("restartButton");
const muteButton = document.getElementById("muteButton");

function startGame() {
  document.getElementById("title-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  restartButton.style.display = "none";
  resultDisplay.textContent = "";
  score = 0;
  miss = 0;
  timeLeft = 60;
  inputBuffer = "";
  currentIndex = 0;
  currentProblem = null;
  currentKana = "";
  currentRomajiCandidates = [];
  bgm.play();
  bgmPlaying = true;
  updateMuteButton();
  nextProblem();
  updateTimer();
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function updateTimer() {
  timerDisplay.textContent = `残り時間: ${timeLeft}秒`;
}

function nextProblem() {
  if (currentIndex === 0) {
    currentProblem = problemList[0];
  } else {
    const rest = problemList.slice(1);
    currentProblem = rest[Math.floor(Math.random() * rest.length)];
  }
  currentKana = currentProblem.kana;
  currentRomajiCandidates = generateRomajiCandidates(currentKana);
  inputBuffer = "";
  kanaDisplay.textContent = currentProblem.kanji;
  updateRomajiDisplay();
  currentIndex++;
}

function generateRomajiCandidates(kana) {
  let list = [""];
  for (let i = 0; i < kana.length; ) {
    let matched = false;

    // 「っ」の特別処理
    if (kana[i] === "っ") {
      const next = kana.slice(i + 1, i + 3);
      const single = kana[i + 1];
      let consonants = [];
      if (inputMap[next]) {
        consonants = inputMap[next].map(r => r[0]);
      } else if (inputMap[single]) {
        consonants = inputMap[single].map(r => r[0]);
      }
      let newList = [];
      for (const prev of list) {
        for (const c of consonants) {
          newList.push(prev + c);
        }
      }
      list = newList;
      i++;
      continue;
    }

    for (let len = 2; len > 0; len--) {
      const part = kana.slice(i, i + len);
      if (inputMap[part]) {
        const newList = [];
        for (const prev of list) {
          for (const romaji of inputMap[part]) {
            newList.push(prev + romaji);
          }
        }
        list = newList;
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      for (let j = 0; j < list.length; j++) list[j] += kana[i];
      i++;
    }
  }
  return list;
}

function updateRomajiDisplay() {
  for (const cand of currentRomajiCandidates) {
    if (cand.toLowerCase().startsWith(inputBuffer.toLowerCase())) {
      romajiDisplay.innerHTML = `<span style="color: #aaa">${inputBuffer}</span><span style="color: white; font-size: 1.5rem;">${cand.slice(inputBuffer.length)}</span>`;
      return;
    }
  }
  romajiDisplay.innerHTML = `<span style="color: red">${inputBuffer}</span>`;
}

function handleKeydown(e) {
  if (timeLeft <= 0) return;
  const key = e.key.toLowerCase();
  const matched = currentRomajiCandidates.some(c => c.toLowerCase().startsWith((inputBuffer + key).toLowerCase()));
  if (matched) {
    inputBuffer += key;
    score++;
    updateRomajiDisplay();
    if (currentRomajiCandidates.some(c => c.toLowerCase() === inputBuffer.toLowerCase())) {
      nextProblem();
    }
  } else {
    miss++;
    updateRomajiDisplay();
  }
}

function endGame() {
  clearInterval(timer);
  document.removeEventListener("keydown", handleKeydown);
  kanaDisplay.textContent = "";
  romajiDisplay.textContent = "";
  document.getElementById("timer").textContent = "";
  const total = score + miss;
  const speed = (score / 60).toFixed(2);
  let rank = "C";
  if (score >= 350) rank = "S";
  else if (score >= 280) rank = "A";
  else if (score >= 210) rank = "B";

  resultDisplay.innerHTML = `
  おつかれさまでした<br>
  <span class="rank">ランク: ${rank}</span><br>
    正しく打ったキー: ${score}<br>
    ミスタイプ: ${miss}<br>
    平均タイプ数: ${speed} 回/秒`;
  restartButton.style.display = "inline-block";
}

function updateMuteButton() {
  muteButton.textContent = bgmPlaying ? "BGM: OFF" : "BGM: ON";
}

function toggleMute() {
  if (bgm) {
    bgmPlaying = !bgmPlaying;
    bgm.muted = !bgmPlaying;
    updateMuteButton();
  }
}

startButton.addEventListener("click", () => {
  document.addEventListener("keydown", handleKeydown);
  startGame();
});

restartButton.addEventListener("click", () => {
  document.addEventListener("keydown", handleKeydown);
  startGame();
});

muteButton.addEventListener("click", toggleMute);
