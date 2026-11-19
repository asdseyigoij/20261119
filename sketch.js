let bgImg; // 儲存背景圖片
let bgOffsetX = 0; // 記錄背景水平捲動的偏移量
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖
let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

function preload() { // 在畫布建立前載入圖片
  bgImg = loadImage("1/bg/bg1.png"); // 載入背景圖片
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓角色座標代表影格的中心點
  characterX = width / 2; // 將角色初始位置設在畫布水平中央
  frameRate(60); // 將動畫更新速率設定為每秒六十格
} // 結束初始化函式

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 預設底色

  // 計算背景圖依畫布高度等比例縮放後的寬高（確保至少不小於畫布寬度）
  const bgScale = max(height / bgImg.height, width / bgImg.width);
  const bgW = bgImg.width * bgScale;
  const bgH = bgImg.height * bgScale;

  // 計算角色高度為畫布高度的 1/3，並依原始圖片寬高比例計算縮放倍率
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale;
  const characterHeight = height / 3;

  // 計算背景可捲動的最大範圍（三張串接：左、中、右各一張）
  const maxBgOffset = bgW - (bgW - width) / 2; // 背景往右捲動到最左邊緣的極限
  const minBgOffset = -(bgW - (bgW - width) / 2); // 背景往左捲動到最右邊緣的極限
  const anchorX = width / 2; // 角色捲動背景時的基準站立點

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算移動速度

  if (movingRight) { // 按住右方向鍵
    isWalking = true;
    facingDirection = 1;
    if (characterX < anchorX) {
      // 若角色先前在畫面左側，先走回畫面中央基準點
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      // 背景尚未到達最右邊時，背景往左移動
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      // 背景已到達最右邊暫停捲動，角色開始往右移動
      characterX += movementStep;
    }
  } else if (movingLeft) { // 按住左方向鍵
    isWalking = true;
    facingDirection = -1;
    if (characterX > anchorX) {
      // 若角色先前在畫面右側，先走回畫面中央基準點
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      // 背景尚未到達最左邊時，背景往右移動
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      // 背景已到達最左邊暫停捲動，角色開始往左移動
      characterX -= movementStep;
    }
  }

  // 繪製三張串接的背景圖片（左、中、右）
  const centerBgX = width / 2 + bgOffsetX;
  const centerBgY = height / 2;
  image(bgImg, centerBgX - bgW, centerBgY, bgW, bgH); // 左側複製背景
  image(bgImg, centerBgX, centerBgY, bgW, bgH);       // 中間原始背景
  image(bgImg, centerBgX + bgW, centerBgY, bgW, bgH); // 右側複製背景

  // 限制角色中心避免超出畫布左右邊界
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 檢查施法動畫是否已完整播放一次
  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) {
    isCasting = false;
    activeEffects.push({
      x: characterX + magicDirection * characterWidth / 2,
      y: height - characterHeight * 0.58,
      direction: magicDirection
    });
  }

  // 繪製角色
  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite;
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite;
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth;
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight;
  const elapsedMagicFrames = frameCount - magicStartFrame;
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount;
  const sourceX = frameIndex * activeFrameWidth;
  const activeWidth = activeFrameWidth * characterScale;
  const activeHeight = activeFrameHeight * characterScale;
  const characterY = height - activeHeight / 2;

  push();
  translate(characterX, characterY);
  scale(isCasting ? magicDirection : facingDirection, 1);
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight);
  pop();

  // 更新與繪製魔法特效
  const effectScale = characterScale;
  const effectWidth = effectFrameWidth * effectScale;
  const effectHeight = effectFrameHeight * effectScale;
  const effectSpeed = max(6, width * 0.008);
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) {
    const effect = activeEffects[effectIndex];
    effect.x += effect.direction * effectSpeed;
    if (effect.x > width || effect.x < 0) {
      activeEffects.splice(effectIndex, 1);
      continue;
    }
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount;
    push();
    translate(effect.x, effect.y);
    scale(effect.direction, 1);
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight);
    pop();
  }
} // 結束繪圖函式

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;
    return false;
  }
  if (keyCode === LEFT_ARROW) {
    isWalking = true;
    facingDirection = -1;
    return false;
  }
  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }
    spaceIsDown = true;
    return false;
  }
}

function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  characterX = constrain(characterX, 1, width - 1);
}