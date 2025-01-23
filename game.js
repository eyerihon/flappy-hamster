// Получение элементов DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameOverScreen = document.getElementById('gameOverScreen');
const finalBalanceText = document.getElementById('finalBalance');
const restartButton = document.getElementById('restartButton');
const ratingButton = document.getElementById('ratingButton');
const ratingScreen = document.getElementById('ratingScreen');
const bestScoresList = document.getElementById('bestScoresList');
const backFromRatingButton = document.getElementById('backFromRating');
const soundToggleButton = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon'); // Новая ссылка на иконку

// Загрузка изображений из папки assets
const hamsterNormalImg = new Image();
hamsterNormalImg.src = 'assets/hamster_normal.png'; // Изображение хомячка в обычном состоянии
hamsterNormalImg.onload = () => {
  console.log('hamster_normal.png загружен');
  checkAllImagesLoaded();
};
hamsterNormalImg.onerror = () => {
  console.error('Ошибка загрузки hamster_normal.png');
};

const hamsterJumpImg = new Image();
hamsterJumpImg.src = 'assets/hamster_jump.png'; // Изображение хомячка в прыжке
hamsterJumpImg.onload = () => {
  console.log('hamster_jump.png загружен');
  checkAllImagesLoaded();
};
hamsterJumpImg.onerror = () => {
  console.error('Ошибка загрузки hamster_jump.png');
};

const bitcoinImg = new Image();
bitcoinImg.src = 'assets/bitcoin.png';
bitcoinImg.onload = () => {
  console.log('bitcoin.png загружен');
  checkAllImagesLoaded();
};
bitcoinImg.onerror = () => {
  console.error('Ошибка загрузки bitcoin.png');
};

const ethImg = new Image();
ethImg.src = 'assets/eth.png';
ethImg.onload = () => {
  console.log('eth.png загружен');
  checkAllImagesLoaded();
};
ethImg.onerror = () => {
  console.error('Ошибка загрузки eth.png');
};

const dogeImg = new Image();
dogeImg.src = 'assets/doge.png';
dogeImg.onload = () => {
  console.log('doge.png загружен');
  checkAllImagesLoaded();
};
dogeImg.onerror = () => {
  console.error('Ошибка загрузки doge.png');
};

// Загрузка звуков
const jumpSound = new Audio('assets/jump.mp3'); // Звук прыжка
const coinSound = new Audio('assets/coin.mp3'); // Звук сбора монеты
const collisionSound = new Audio('assets/collision.mp3'); // Звук столкновения
const gameOverSound = new Audio('assets/game_over.mp3'); // Звук окончания игры

// Проверка загрузки всех изображений
let imagesLoaded = 0;
const totalImages = 5; // hamster_normal.png, hamster_jump.png, bitcoin.png, eth.png, doge.png

function checkAllImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    console.log('Все изображения загружены');
    init(); // Инициализация игры после загрузки всех изображений
    gameLoop();
  }
}

// Параметры хомячка
let hamster = {
  x: 50,
  y: 250,
  width: 50,
  height: 50,
  gravity: 0.6,
  velocity: 0,
  isJumping: false, // Флаг прыжка
  currentImage: hamsterNormalImg, // Текущее изображение хомячка
};

// Массивы для монет и препятствий
let coins = [];
let obstacles = [];

let balance = 0;

// Инициализация скоростей
let coinSpeed = 7; // Увеличиваем скорость монет с 6 до 7
let obstacleSpeed = 7; // Увеличиваем скорость препятствий с 6 до 7
let gameOver = false;

// Параметры генерации препятствий
const fixedWidth = 30; // Ширина свечи
const obstacleGap = 2; // Уменьшаем расстояние между препятствиями с 100 до 2 пикселей
let obstacleCounter = 0; // Счётчик для генерации препятствий

// Параметры сетки
const gridSize = 100; // Размер ячейки сетки
let gridOffsetX = 0;

// Переменная для хранения высоты последней свечи
let lastCandleHeight = canvas.height / 2; // Инициализируем средней высотой

// Параметры для увеличения скорости игры
const speedThresholds = [500, 1000, 2000];
let currentSpeedIndex = 0;

// Параметр для управления звуком
let soundOn = true;

// Функция инициализации игры
function init() {
  // Добавляем начальную свечу
  let initialObstacle = {
    x: canvas.width,
    y: canvas.height - lastCandleHeight, // Начинается снизу
    width: fixedWidth,
    height: lastCandleHeight,
    color: 'green' // Цвет по умолчанию
  };
  obstacles.push(initialObstacle);

  // Генерация первой монеты независимо от препятствий
  spawnCoin();
}

// Основной игровой цикл
function gameLoop() {
  if (!gameOver) {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }
}

// Обновление состояния игры
function update() {
  // Гравитация и движение хомячка
  hamster.velocity += hamster.gravity;
  hamster.y += hamster.velocity;

  // Проверка соприкосновения с полом и потолком
  if (hamster.y + hamster.height > canvas.height || hamster.y < 0) {
    playSound(gameOverSound);
    endGame();
    return;
  }

  // Проверка столкновений с препятствиями (свечами)
  obstacles.forEach(obs => {
    const hit = hamster.x < obs.x + obs.width &&
                hamster.x + hamster.width > obs.x &&
                hamster.y < obs.y + obs.height &&
                hamster.y + hamster.height > obs.y;
    if (hit) {
      playSound(collisionSound);
      endGame();
    }
  });

  // Проверка столкновений с монетами и начисление баланса
  coins = coins.filter(coin => {
    const hit = hamster.x < coin.x + coin.width &&
                hamster.x + hamster.width > coin.x &&
                hamster.y < coin.y + coin.height &&
                hamster.y + hamster.height > coin.y;

    if (hit) {
      if (coin.type === 'bitcoin') balance += 100;
      else if (coin.type === 'eth') balance += 40;
      else if (coin.type === 'doge') balance += 20;
      playSound(coinSound);
      return false; // удалить монету после сбора
    }
    return true;
  });

  // Обновление позиций монет
  coins.forEach(coin => {
    coin.x -= coinSpeed;
  });
  coins = coins.filter(coin => coin.x + coin.width > 0);

  // Обновление позиций препятствий
  obstacles.forEach(obs => {
    obs.x -= obstacleSpeed;
  });
  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

  // Увеличение скорости игры при достижении определённых балансов
  if (currentSpeedIndex < speedThresholds.length && balance >= speedThresholds[currentSpeedIndex]) {
    obstacleSpeed += 1; // Увеличиваем скорость препятствий на 1
    coinSpeed += 1; // Увеличиваем скорость монет на 1
    currentSpeedIndex++;
    console.log(`Скорость игры увеличена! Новая скорость препятствий: ${obstacleSpeed}, монет: ${coinSpeed}`);
  }

  // Обновление сетки
  gridOffsetX -= obstacleSpeed;
  if (gridOffsetX <= -gridSize) {
    gridOffsetX += gridSize;
  }

  // Генерация препятствий через определённые интервалы
  obstacleCounter += obstacleSpeed;
  if (obstacleCounter >= obstacleGap) {
    spawnObstacle();
    obstacleCounter = 0;
  }

  // Обновление изображения хомячка
  if (hamster.isJumping) {
    hamster.currentImage = hamsterJumpImg;
  } else {
    hamster.currentImage = hamsterNormalImg;
  }

  // Сброс флага прыжка, если хомячок начинает падать
  if (hamster.isJumping && hamster.velocity >= 0) {
    hamster.isJumping = false;
  }
}

// Отрисовка игрового экрана
function render() {
  // Отрисовка сетки
  drawGrid();

  // Отрисовка хомячка
  ctx.drawImage(hamster.currentImage, hamster.x, hamster.y, hamster.width, hamster.height);

  // Отрисовка монет
  coins.forEach(coin => {
    let img;
    if (coin.type === 'bitcoin') img = bitcoinImg;
    else if (coin.type === 'eth') img = ethImg;
    else if (coin.type === 'doge') img = dogeImg;
    if (img) {
      ctx.drawImage(img, coin.x, coin.y, coin.width, coin.height);
    }
  });

  // Настройка обводки свечей
  ctx.strokeStyle = 'white'; // Белый цвет обводки для контраста с чёрным фоном
  ctx.lineWidth = 2; // Толщина линии обводки

  // Отрисовка препятствий (свечей) с обводкой
  obstacles.forEach(obs => {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height); // Добавляем обводку
  });

  // Отображение баланса
  ctx.fillStyle = "#FFD700"; // Золотой цвет
  ctx.font = "28px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 4;
  ctx.fillText(`Баланс: ${balance}`, 10, 10);

  // Сброс теней после отрисовки текста
  ctx.shadowColor = 'transparent';
}

// Функция отрисовки сетки
function drawGrid() {
  // Заливка чёрным фоном
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ffffff'; // Белые линии сетки
  ctx.lineWidth = 1;

  // Вертикальные линии
  for (let x = gridOffsetX; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Горизонтальные линии
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Управление: пробел для прыжка
document.addEventListener('keydown', function(e) {
  if(e.code === 'Space' && !gameOver) {
    if (!hamster.isJumping) { // Начинаем прыжок только если хомячок не прыгает
      hamster.velocity = -8; // Уменьшаем скорость прыжка для меньшей высоты
      hamster.isJumping = true;
      playSound(jumpSound);
    }
  }
});

// Управление на мобильных устройствах (касание экрана для прыжка)
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (!gameOver) {
    if (!hamster.isJumping) { // Начинаем прыжок только если хомячок не прыгает
      hamster.velocity = -8; // Уменьшаем скорость прыжка для меньшей высоты
      hamster.isJumping = true;
      playSound(jumpSound);
    }
  }
});

// Функция для появления новых монет
function spawnCoin() {
  const coinWidth = 32;
  const coinHeight = 32;

  // Генерация случайной позиции монеты в верхней половине экрана
  let coinX = canvas.width + coinWidth;
  let coinY = Math.random() * (canvas.height / 2 - coinHeight); // Верхняя половина

  let coin = {
    x: coinX,
    y: coinY,
    width: coinWidth,
    height: coinHeight,
    type: getRandomCoinType()
  };

  coins.push(coin);
}

// Функция для появления новых препятствий (свечей)
function spawnObstacle() {
  const maxHeight = (canvas.height * 3) / 4; // Максимальная длина 75% экрана
  const minHeight = 50; // Минимальная длина свечи

  // Генерация новой высоты свечи с плавным изменением
  let newHeight;
  const heightChange = Math.random() * 100 - 50; // Изменение высоты ±50 пикселей
  newHeight = lastCandleHeight + heightChange;

  // Ограничение высоты свечи
  if (newHeight < minHeight) newHeight = minHeight;
  if (newHeight > maxHeight) newHeight = maxHeight;

  // Определение цвета свечи на основе изменения высоты
  let color;
  if (newHeight > lastCandleHeight) {
    color = 'green';
  } else {
    color = 'red';
  }

  // Новая свеча должна появляться после предыдущей с промежутком
  let lastCandle = obstacles[obstacles.length - 1];
  let xPosition;
  if (lastCandle) {
    xPosition = lastCandle.x + fixedWidth + obstacleGap; // obstacleGap=2
  } else {
    xPosition = canvas.width;
  }

  let obstacle = {
    x: xPosition,
    y: canvas.height - newHeight, // Начинается снизу
    width: fixedWidth,
    height: newHeight,
    color: color
  };

  obstacles.push(obstacle);

  // Обновляем высоту последней свечи
  lastCandleHeight = newHeight;

  console.log(`Создана свеча: x=${xPosition}, y=${canvas.height - newHeight}, height=${newHeight}, color=${color}`);

  return obstacle; // Возвращаем объект свечи для возможного использования
}

// Функция завершения игры
function endGame() {
  playSound(gameOverSound);
  updateBestScores();
  gameOver = true;
  finalBalanceText.innerText = `Ваш баланс: ${balance}`;
  displayBestScores();
  gameOverScreen.style.display = 'flex';
}

// Функция перезапуска игры
function restartGame() {
  // Сброс состояния игры
  hamster.x = 50;
  hamster.y = 250;
  hamster.velocity = 0;
  hamster.isJumping = false;
  hamster.currentImage = hamsterNormalImg;
  coins = [];
  obstacles = [];
  balance = 0;
  coinSpeed = 7; // Восстанавливаем начальную скорость монет (увеличена на 1)
  obstacleSpeed = 7; // Восстанавливаем начальную скорость препятствий (увеличена на 1)
  gameOver = false;
  gameOverScreen.style.display = 'none';
  ratingScreen.style.display = 'none';
  obstacleCounter = 0;
  gridOffsetX = 0;
  lastCandleHeight = canvas.height / 2; // Сброс высоты последней свечи
  currentSpeedIndex = 0; // Сброс индекса скорости

  // Очистка препятствий и добавление начальной свечи
  obstacles = [];
  let initialObstacle = {
    x: canvas.width,
    y: canvas.height - lastCandleHeight, // Начинается снизу
    width: fixedWidth,
    height: lastCandleHeight,
    color: 'green' // Цвет по умолчанию
  };
  obstacles.push(initialObstacle);

  // Генерация монеты отдельно от препятствий
  spawnCoin();

  // Запуск игрового цикла заново
  requestAnimationFrame(gameLoop);
}

// Функция для переключения на экран рейтинга
function showRating() {
  displayBestScores();
  gameOverScreen.style.display = 'none';
  ratingScreen.style.display = 'flex';
}

// Функция для возвращения на экран окончания игры из рейтинга
function backFromRating() {
  ratingScreen.style.display = 'none';
  gameOverScreen.style.display = 'flex';
}

// Обработчики событий для кнопок
restartButton.addEventListener('click', restartGame);
ratingButton.addEventListener('click', showRating);
backFromRatingButton.addEventListener('click', backFromRating);
soundToggleButton.addEventListener('click', toggleSound);

// Функция для проигрывания звуков с учётом состояния звука
function playSound(sound) {
  if (soundOn) {
    sound.currentTime = 0;
    sound.play();
  }
}

// Функция для переключения звука и изменения иконки
function toggleSound() {
  soundOn = !soundOn;
  // Обновляем иконку кнопки в зависимости от состояния звука
  if (soundOn) {
    soundIcon.src = 'assets/sound_on.png';
    soundIcon.alt = 'Sound On';
  } else {
    soundIcon.src = 'assets/sound_off.png';
    soundIcon.alt = 'Sound Off';
  }
  // Сохраняем состояние звука в localStorage
  localStorage.setItem('soundOn', soundOn);
}

// Функция для выбора случайного типа монеты
function getRandomCoinType() {
  const coinTypes = ['bitcoin', 'eth', 'doge'];
  return coinTypes[Math.floor(Math.random() * coinTypes.length)];
}

// Функция для обновления списка лучших результатов
function updateBestScores() {
  let bestScores = JSON.parse(localStorage.getItem('bestScores')) || [];
  bestScores.push(balance);
  // Сортировка по убыванию
  bestScores.sort((a, b) => b - a);
  // Сохранение топ-5
  bestScores = bestScores.slice(0, 5);
  localStorage.setItem('bestScores', JSON.stringify(bestScores));
}

// Функция для отображения лучших результатов
function displayBestScores() {
  let bestScores = JSON.parse(localStorage.getItem('bestScores')) || [];
  bestScoresList.innerHTML = ''; // Очистка списка

  if (bestScores.length === 0) {
    bestScoresList.innerHTML = '<li>Нет результатов</li>';
    return;
  }

  bestScores.forEach((score, index) => {
    let li = document.createElement('li');
    li.textContent = `${index + 1}. ${score}`;
    bestScoresList.appendChild(li);
  });
}

// Функция для инициализации состояния звука при загрузке страницы
function initializeSound() {
  const storedSound = localStorage.getItem('soundOn');
  if (storedSound !== null) {
    soundOn = storedSound === 'true';
  } else {
    soundOn = true; // По умолчанию звук включён
  }
  // Устанавливаем начальную иконку
  if (soundOn) {
    soundIcon.src = 'assets/sound_on.png';
    soundIcon.alt = 'Sound On';
  } else {
    soundIcon.src = 'assets/sound_off.png';
    soundIcon.alt = 'Sound Off';
  }
}

// Автоматическая генерация монет независимо от препятствий с одинаковой скоростью
setInterval(spawnCoin, 3000); // Генерируем монеты каждые 3 секунды

// Инициализация звука и запуск игры
initializeSound();
