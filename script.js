const gradeForm = document.getElementById('grade-form');
const gradeTableBody = document.getElementById('grade-table-body');
const currentAverageEl = document.getElementById('current-average');
const classworkCountEl = document.getElementById('classwork-count');
const homeworkCountEl = document.getElementById('homework-count');
const entryCountEl = document.getElementById('entry-count');
const baselineGradeEl = document.getElementById('baseline-grade');
const resetButton = document.getElementById('reset-button');
const connectSchoolButton = document.getElementById('connect-school-button');

const defaultGrade = 0;
let entries = [];
let schoolConnected = localStorage.getItem('schoolAccountConnected') === 'true';

function playClickSound() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = 900;
  gain.gain.value = 0.04;

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start(audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
  oscillator.stop(audioCtx.currentTime + 0.05);
}

function calculateAverage() {
  if (entries.length === 0) return defaultGrade;

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let plainTotal = 0;

  entries.forEach((entry) => {
    const normalizedScore = (entry.score / entry.total) * 100;
    const weight = entry.weight > 0 ? entry.weight : 1;
    totalWeightedScore += normalizedScore * weight;
    totalWeight += weight;
    plainTotal += normalizedScore;
  });

  const average = totalWeight > 0 ? totalWeightedScore / totalWeight : plainTotal / entries.length;
  return Math.round(average * 10) / 10;
}

function updateStats() {
  const average = calculateAverage();
  currentAverageEl.textContent = `${average}%`;
  classworkCountEl.textContent = entries.filter((entry) => entry.type === 'Classwork').length;
  homeworkCountEl.textContent = entries.filter((entry) => entry.type === 'Homework').length;
  entryCountEl.textContent = entries.length;
  baselineGradeEl.textContent = `${defaultGrade}%`;
}

function updateConnectButton() {
  if (!connectSchoolButton) return;
  connectSchoolButton.textContent = schoolConnected ? 'School account connected' : 'Connect school account';
  connectSchoolButton.disabled = schoolConnected;
}

function connectSchoolAccount() {
  window.open('https://nycstudents.net', '_blank');
  schoolConnected = true;
  localStorage.setItem('schoolAccountConnected', 'true');
  updateConnectButton();
  setTimeout(() => {
    alert('NYCstudents is opening in a new tab. Use Google Classroom from your school account for faster access.');
  }, 200);
}

function createTableRow(entry) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${entry.subject}</td>
    <td>${entry.type}</td>
    <td>${entry.score}/${entry.total} (${entry.percentage}%)</td>
    <td>${entry.weight > 0 ? entry.weight + '%' : 'Auto'}</td>
    <td>${entry.note || '—'}</td>
    <td><button class="remove-button" data-id="${entry.id}">Remove</button></td>
  `;
  return tr;
}

function refreshTable() {
  gradeTableBody.innerHTML = '';

  if (entries.length === 0) {
    gradeTableBody.innerHTML = '<tr class="empty-row"><td colspan="6">No grades added yet. Start by entering your Jupiter grades above.</td></tr>';
    return;
  }

  entries.forEach((entry) => {
    gradeTableBody.appendChild(createTableRow(entry));
  });
}

function addEntry(entry) {
  entries.unshift(entry);
  refreshTable();
  updateStats();
}

function removeEntry(id) {
  entries = entries.filter((entry) => entry.id !== id);
  refreshTable();
  updateStats();
}

gradeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const subject = document.getElementById('subject').value.trim();
  const type = document.getElementById('type').value;
  const scoreValue = parseFloat(document.getElementById('score').value);
  const totalValue = parseFloat(document.getElementById('total').value);
  const weightValue = parseFloat(document.getElementById('weight').value) || 0;
  const note = document.getElementById('note').value.trim();

  if (!subject || !scoreValue || !totalValue || totalValue <= 0) return;

  const percentage = Math.round(((scoreValue / totalValue) * 100) * 10) / 10;
  const entry = {
    id: `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    subject,
    type,
    score: scoreValue,
    total: totalValue,
    weight: weightValue,
    note,
    percentage,
  };

  addEntry(entry);
  gradeForm.reset();
  document.getElementById('score').focus();
});

gradeTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-button');
  if (!button) return;
  removeEntry(button.dataset.id);
});

resetButton.addEventListener('click', () => {
  entries = [];
  refreshTable();
  updateStats();
});

if (connectSchoolButton) {
  connectSchoolButton.addEventListener('click', connectSchoolAccount);
}

// Play a quiet click sound for every button or support link click.
document.body.addEventListener('click', (event) => {
  if (event.target.closest('button, .support-button, .music-button')) {
    playClickSound();
  }
});

updateConnectButton();
updateStats();
refreshTable();

// Music player functionality
const musicButton = document.getElementById('music-button');
const musicOverlay = document.getElementById('music-overlay');
const songSelect = document.getElementById('song-select');
const playPauseBtn = document.getElementById('play-pause');
const volumeSlider = document.getElementById('volume-slider');
const closeMusic = document.getElementById('close-music');

let player;
let isPlaying = false;

musicButton.addEventListener('click', () => {
  musicOverlay.classList.remove('hidden');
});

closeMusic.addEventListener('click', () => {
  musicOverlay.classList.add('hidden');
});

songSelect.addEventListener('change', () => {
  if (player) {
    player.loadVideoById(songSelect.value);
    player.playVideo();
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
  }
});

playPauseBtn.addEventListener('click', () => {
  if (!player) return;
  if (isPlaying) {
    player.pauseVideo();
    playPauseBtn.textContent = 'Play';
  } else {
    player.playVideo();
    playPauseBtn.textContent = 'Pause';
  }
  isPlaying = !isPlaying;
});

volumeSlider.addEventListener('input', () => {
  if (player) {
    player.setVolume(volumeSlider.value);
  }
});

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: 'cyzx45mupcQ',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  event.target.setVolume(50);
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
  } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
  }
}

// Background change functionality
const backgroundButton = document.getElementById('background-button');

backgroundButton.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.body.style.backgroundImage = `url(${e.target.result})`;
        localStorage.setItem('backgroundImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

// Load saved background on page load
const savedBg = localStorage.getItem('backgroundImage');
if (savedBg) {
  document.body.style.backgroundImage = `url(${savedBg})`;
}
