import './style.css';

// =================== SCREEN MANAGER ===================
window.showScreen = function(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
};

window.goToSetup = function() { showScreen('screen-setup'); };
window.goToResult = function() { showScreen('screen-result'); };

// =================== GAME STATE ===================
const GS = {
  playerName: 'ผู้เล่น',
  charChoice: 'bom',
  exp: 0,
  unlocked: [1],
  completed: [],
  stars: {},
  pretestScore: 0,
  posttestScore: 0,
  posttestDone: false,
};

const CHAR_IMG = { bom: '/bom.png', bam: '/bam.png' };
const CHAR_SAY = {
  bom: { correct: "เยี่ยมครับ! ถูกต้องเลย!", wrong: "ไม่เป็นไรครับ ลองใหม่ได้เลย!", hint: "ลองคิดดีๆ นะครับ" },
  bam: { correct: "เก่งมากเลย! ถูกต้องค่ะ!", wrong: "ยังไม่ใช่ค่ะ แต่เรียนรู้ได้เสมอนะคะ!", hint: "คิดดูนะคะ Stack คืออะไรนะ?" },
};

// =================== SCREEN MANAGER ===================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// =================== CHARACTER SELECT ===================
let selectedChar = 'bom';
window.selectChar = function(c) {
  selectedChar = c;
  ['bom','bam'].forEach(ch => {
    const el = document.getElementById(`setup-char-${ch}`);
    const ring = document.getElementById(`setup-ring-${ch}`);
    if (el) {
      el.style.opacity = ch === c ? '1' : '0.65';
      el.style.filter = ch === c ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.4)) brightness(1.05)' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.4)) brightness(0.7)';
    }
    if (ring) {
      ring.style.opacity = ch === c ? '1' : '0';
    }
  });
};

// =================== GAME START ===================
window.startGame = function() {
  const name = document.getElementById('player-name-input').value.trim();
  if (!name) {
    document.getElementById('player-name-input').focus();
    document.getElementById('player-name-input').style.borderColor = '#FF5252';
    return;
  }
  GS.playerName = name;
  GS.charChoice = selectedChar;
  startPretest(); // Force pretest directly after setup
};

// =================== PRE-TEST ===================
const TEST_QUESTIONS = [
  {
    q: "Stack คือโครงสร้างข้อมูลแบบใด?",
    choices: ["แบบสุ่ม (Random)", "แบบ LIFO (Last In First Out)", "แบบ FIFO (First In First Out)", "แบบ Circular"],
    ans: 1
  },
  {
    q: "ข้อมูลใดจะถูกนำออกจาก Stack ก่อน?",
    choices: ["ข้อมูลที่ใส่เข้ามาแรกสุด", "ข้อมูลที่ใส่เข้ามาล่าสุด", "ข้อมูลตรงกลาง", "ข้อมูลที่มีค่ามากสุด"],
    ans: 1
  },
  {
    q: "การเพิ่มข้อมูลลงใน Stack เรียกว่าอะไร?",
    choices: ["Pop", "Peek", "Push", "Insert"],
    ans: 2
  },
  {
    q: "Stack Overflow เกิดขึ้นเมื่อใด?",
    choices: ["Pop จาก Stack ที่ว่าง", "Push ลง Stack ที่เต็ม", "ดู Top โดยไม่มีข้อมูล", "ไม่มีข้อใดถูก"],
    ans: 1
  },
  {
    q: "peek() ทำหน้าที่อะไร?",
    choices: ["นำข้อมูลออก", "เพิ่มข้อมูลใหม่", "ดูข้อมูลบนสุดโดยไม่นำออก", "ตรวจสอบว่า Stack ว่างหรือเปล่า"],
    ans: 2
  },
  {
    q: "ข้อใดคือการใช้งาน Stack ในชีวิตจริงที่ชัดเจนที่สุด?",
    choices: ["การต่อคิวซื้อตั๋วหนัง", "การซ้อนจานในร้านอาหาร", "การเดินรถทางเดียว", "การสุ่มจับฉลาก"],
    ans: 1
  },
  {
    q: "ฟังก์ชันใดในโปรแกรมที่มักจะใช้โครงสร้าง Stack?",
    choices: ["Undo (ย้อนกลับการกระทำ)", "Search (ค้นหา)", "Sort (เรียงลำดับ)", "Print (พิมพ์เอกสาร)"],
    ans: 0
  },
  {
    q: "ในการลบข้อมูลออกจาก Stack จะสามารถลบได้จากตำแหน่งใด?",
    choices: ["ด้านล่างสุด (Bottom)", "ตรงกลาง (Middle)", "ด้านบนสุด (Top)", "ตำแหน่งใดก็ได้แบบสุ่ม"],
    ans: 2
  },
  {
    q: "ถ้าเรา Push ข้อมูล A, B, C ตามลำดับ เมื่อเรา Pop ครั้งแรกจะได้ข้อมูลใด?",
    choices: ["A", "B", "C", "จะเกิด Error"],
    ans: 2
  },
  {
    q: "ตัวชี้ที่คอยระบุตำแหน่งข้อมูลล่าสุดของ Stack เรียกว่าอะไร?",
    choices: ["Bottom", "Index", "Cursor", "Top"],
    ans: 3
  }
];

let currentTestQ = 0;
let testIsPretest = true;
let testScore = 0;
let pretestAnswers = {};

function startPretest() {
  testIsPretest = true;
  testScore = 0;
  pretestAnswers = {};
  currentTestQ = 0;
  const el = document.getElementById('pretest-char-img');
  if (el) el.src = CHAR_IMG[GS.charChoice];
  document.getElementById('pretest-guide-bubble').innerText =
    `สวัสดี ${GS.playerName}! ตอบตามความเข้าใจตัวเองเลยนะ ไม่ต้องกลัวผิดค่ะ/ครับ`;
  renderTestQuestion('pretest');
  showScreen('screen-pretest');
}

function renderTestQuestion(prefix) {
  const q = TEST_QUESTIONS[currentTestQ];
  const total = TEST_QUESTIONS.length;
  
  // Update header progress if it exists (pretest style)
  const headerProg = document.getElementById(`${prefix}-header-progress`);
  if (headerProg) {
    headerProg.innerHTML = `<span style="color:#FBBF24; font-size:1.4rem; margin-right:10px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">⭐</span> ข้อที่ ${currentTestQ + 1} / ${total}`;
  }
  
  // Update progress bar if it exists (pretest style)
  const progBar = document.getElementById(`${prefix}-progress-bar`);
  if (progBar) {
    progBar.style.width = `${((currentTestQ + 1) / total) * 100}%`;
  }
  
  // Update ribbon text if it exists (pretest style)
  const ribbonTxt = document.getElementById(`${prefix}-ribbon-text`);
  if (ribbonTxt) {
    ribbonTxt.innerHTML = `<span style="color:#FBBF24; font-size:1.4rem; margin-right:10px;">⭐</span> ข้อที่ ${currentTestQ + 1}`;
  }

  // Fallback for old progress style
  const oldProg = document.getElementById(`${prefix}-progress`);
  if (oldProg) {
    oldProg.innerText = `ข้อ ${currentTestQ + 1} / ${total}`;
  }

  const cont = document.getElementById(`${prefix}-question-container`);
  
  if (prefix === 'pretest') {
    // New styled UI for pretest
    cont.innerHTML = `
      <div style="color: #1E3A8A; font-size: 1.6rem; font-weight: 800; margin-bottom: 25px; text-align: left; font-family:'Kanit',sans-serif;">
        ${q.q}
      </div>
      <div style="display:flex; flex-direction:column; flex-grow:1;">
        ${q.choices.map((c, i) => `
          <button class="pretest-choice-btn" onclick="answerTest(${i})" id="choice-${i}">
            <div class="choice-letter" style="background: #A78BFA; color:white; min-width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; margin-right:20px; box-shadow:0 4px 10px rgba(167,139,250,0.3); transition:all 0.2s;">
              ${String.fromCharCode(65 + i)}
            </div>
            ${c}
          </button>
        `).join('')}
      </div>
      <!-- Footer Buttons -->
      <div style="display:flex; justify-content:space-between; margin-top: 20px;">
        <button onclick="prevTestQuestion()" style="background: #E2E8F0; color:#64748B; border:none; padding:12px 30px; border-radius:50px; font-weight:bold; font-size:1.1rem; font-family:'Kanit',sans-serif; display:flex; align-items:center; gap:10px; cursor:${currentTestQ === 0 ? 'not-allowed' : 'pointer'}; opacity:${currentTestQ === 0 ? '0.5' : '1'};">
          <span style="font-size:1.4rem;">❮</span> ย้อนกลับ
        </button>
        <button onclick="nextTestQuestion()" style="background: linear-gradient(135deg, #7E57C2, #5E35B1); color:white; border:none; padding:12px 40px; border-radius:50px; font-weight:bold; font-size:1.1rem; font-family:'Kanit',sans-serif; display:flex; align-items:center; gap:10px; box-shadow:0 5px 15px rgba(94,53,177,0.4); cursor:pointer;">
          ${currentTestQ === total - 1 ? 'ส่งคำตอบ' : 'ถัดไป'} <span style="font-size:1.4rem;">❯</span>
        </button>
      </div>
    `;

    // Restore selected answer visually
    if (pretestAnswers[currentTestQ] !== undefined) {
      const selectedBtn = document.getElementById(`choice-${pretestAnswers[currentTestQ]}`);
      if (selectedBtn) {
        selectedBtn.style.background = '#E0E7FF';
        selectedBtn.style.borderColor = '#6366F1';
      }
    }
  } else {
    // Old UI for posttest (if needed)
    cont.innerHTML = `
      <div class="question-text">${currentTestQ + 1}. ${q.q}</div>
      <div class="quiz-choices" id="test-choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" onclick="answerTest(${i})" id="choice-${i}">
            ${String.fromCharCode(65 + i)}. ${c}
          </button>
        `).join('')}
      </div>
    `;
  }
}

window.answerTest = function(idx) {
  const q = TEST_QUESTIONS[currentTestQ];
  const prefix = testIsPretest ? 'pretest' : 'posttest';
  const btnClass = testIsPretest ? '.pretest-choice-btn' : '.choice-btn';
  
  const allBtns = document.querySelectorAll(btnClass);
  
  if (testIsPretest) {
    // Manual navigation for pretest: just highlight the choice
    allBtns.forEach((b, i) => {
      b.style.background = i === idx ? '#E0E7FF' : '';
      b.style.borderColor = i === idx ? '#6366F1' : '';
    });
    pretestAnswers[currentTestQ] = idx;
  } else {
    // Auto advance for posttest
    allBtns.forEach(b => b.disabled = true);
    
    if (allBtns[q.ans]) allBtns[q.ans].classList.add('correct');
    
    if (idx !== q.ans) {
      if (allBtns[idx]) allBtns[idx].classList.add('wrong');
    } else {
      testScore++;
    }
    
    setTimeout(() => {
      currentTestQ++;
      if (currentTestQ < TEST_QUESTIONS.length) {
        renderTestQuestion(prefix);
      } else {
        GS.posttestScore = testScore;
        GS.posttestDone = true;
        showResult();
      }
    }, 900);
  }
};

window.nextTestQuestion = function() {
  if (pretestAnswers[currentTestQ] === undefined) {
    return; // Do nothing if answer not selected
  }
  
  currentTestQ++;
  if (currentTestQ < TEST_QUESTIONS.length) {
    renderTestQuestion('pretest');
  } else {
    // Calculate final score
    testScore = 0;
    for (let i = 0; i < TEST_QUESTIONS.length; i++) {
      if (pretestAnswers[i] === TEST_QUESTIONS[i].ans) {
        testScore++;
      }
    }
    GS.pretestScore = testScore;
    showMap();
  }
};

window.prevTestQuestion = function() {
  if (currentTestQ > 0) {
    currentTestQ--;
    renderTestQuestion('pretest');
  }
};

// =================== MAP ===================
function showMap() {
  document.getElementById('map-player-name').innerText = GS.playerName;
  document.getElementById('map-exp').innerText = GS.exp;
  updateMapNodes();
  showScreen('screen-map');
}
window.goToMap = showMap;
window.goToPosttest = function() {
  startPosttest();
};

function updateMapNodes() {
  const completed = GS.completed.length;
  // Update progress bar
  const fill = document.getElementById('map-progress-fill');
  const txt = document.getElementById('map-progress-txt');
  if (fill) fill.style.width = `${(completed / 10) * 100}%`;
  if (txt) txt.innerText = `${completed}/10`;

  for (let i = 1; i <= 10; i++) {
    const node = document.getElementById(`node-${i}`);
    if (!node) continue;
    node.className = 'map-node';
    if (i === 10) node.classList.add('boss');
    if (GS.completed.includes(i)) {
      node.classList.add('completed');
      document.getElementById(`stars-${i}`).innerText = '⭐⭐⭐';
    } else if (GS.unlocked.includes(i)) {
      node.classList.add('unlocked');
    } else {
      node.classList.add('locked');
    }
  }
}

// =================== ZONES DATA ===================
const ZONES = {
  1: {
    title: "Level 1 : Stack Village — รู้จัก Stack",
    emoji: "🏠",
    bubble: ["ลองนึกถึงกองจานนะ!<br>ถ้าเราวางซ้อนกัน...<br>เราจะหยิบจานใบไหนออกก่อน?",
             "วิดีโอนี้จะช่วยสรุปให้เข้าใจง่ายขึ้นครับ!",
             "ทีนี้ลองตอบคำถามสั้นๆ เพื่อยืนยันว่าเข้าใจแล้วนะครับ!"],
    steps: [
      { type: 'learn', content: learnStack },
      { type: 'learn', content: videoStack },
      { type: 'quiz', content: quizStackBasic },
    ]
  },
  2: {
    title: "Level 2 : LIFO Forest — หลักการ LIFO",
    emoji: "🌿",
    bubble: ["LIFO ย่อมาจาก Last In, First Out ค่ะ!",
             "ลองจินตนาการว่าเป็นถาดอาหารซ้อนกัน ถาดบนสุดจะถูกหยิบออกก่อนเสมอ",
             "ลองทายว่าถ้า Pop 1 ครั้ง จะได้อะไร?"],
    steps: [
      { type: 'learn', content: learnLIFO },
      { type: 'quiz', content: quizLIFO },
    ]
  },
  3: {
    title: "Level 3 : Top Tower — ตำแหน่ง Top",
    emoji: "🗼",
    bubble: ["Top คือตำแหน่งบนสุดของ Stack ที่เราจะเพิ่ม/ลบข้อมูลได้เสมอ",
             "ลองคลิกที่ข้อมูลที่คิดว่าอยู่ตำแหน่ง Top!"],
    steps: [
      { type: 'learn', content: learnTop },
      { type: 'interactive', content: quizTop },
    ]
  },
  4: {
    title: "Level 4 : Push Factory — การ Push",
    emoji: "🏭",
    bubble: ["Push คือการเพิ่มข้อมูลเข้า Stack ที่ตำแหน่ง Top เสมอครับ",
             "ลองกด Push เพื่อใส่ข้อมูลลงใน Stack ดูสิ!",
             "สังเกตว่า Top จะขยับขึ้นทุกครั้งที่ Push"],
    steps: [
      { type: 'learn', content: learnPush },
      { type: 'interactive', content: demoPush },
    ]
  },
  5: {
    title: "Level 5 : Pop Cave — การ Pop",
    emoji: "🔴",
    bubble: ["Pop คือการนำข้อมูลออกจาก Top ของ Stack ครับ",
             "ลอง Pop ข้อมูลออกมาดูสิ สังเกตว่าชิ้นไหนออกมาก่อน?"],
    steps: [
      { type: 'learn', content: learnPop },
      { type: 'interactive', content: demoPop },
      { type: 'quiz', content: quizPop },
    ]
  },
  6: {
    title: "Level 6 : ⚠️ Overflow Zone",
    emoji: "⚠️",
    bubble: ["Stack นี้จุได้แค่ 4 ช่อง! ลองกด Push จนเต็มแล้วกดอีกครั้งสิ",
             "เห็นไหมว่าเกิดอะไรขึ้นเมื่อ Stack เต็ม?",
             "ลองตอบคำถามเพื่อยืนยันความเข้าใจ"],
    steps: [
      { type: 'interactive', content: demoOverflow },
      { type: 'quiz', content: quizOverflow },
    ]
  },
  7: {
    title: "Level 7 : 🌊 Underflow Zone",
    emoji: "🌊",
    bubble: ["ตอนนี้ Stack มีข้อมูล 2 ชิ้น ลอง Pop จนหมด แล้วกดอีกครั้ง!",
             "Stack Underflow คือการ Pop ตอนที่ Stack ว่างเปล่า"],
    steps: [
      { type: 'interactive', content: demoUnderflow },
      { type: 'quiz', content: quizUnderflow },
    ]
  },
  8: {
    title: "Level 8 : 💻 Array Lab",
    emoji: "💻",
    bubble: ["ในโปรแกรมจริง เราสร้าง Stack ด้วย Array และตัวแปร top ครับ",
             "ลองกด PUSH D เพื่อดูการเปลี่ยนแปลงของ Array"],
    steps: [
      { type: 'learn', content: learnArray },
      { type: 'interactive', content: demoArray },
    ]
  },
  9: {
    title: "Level 9 : 🧪 Application Lab",
    emoji: "🧪",
    bubble: ["ถึงด่านประยุกต์ใช้แล้วครับ! เราจะใช้ Stack แปลงเลขฐาน 10 เป็นฐาน 2",
             "จากนั้นจะได้ลองแปลง Infix เป็น Postfix กันด้วย!"],
    steps: [
      { type: 'learn', content: learnBinary },
      { type: 'interactive', content: demoBinary },
      { type: 'interactive', content: demoPostfix },
    ]
  },
  10: {
    title: "Level 10 : 👾 Stack Guardian — ด่านบอส!",
    emoji: "👾",
    bubble: ["ยินดีต้อนรับสู่ด่านบอสครับ! Stack Guardian กำลังรอคุณอยู่",
             "ตอบคำถามรวบยอดให้ผ่านเพื่อปลดล็อก Post-test!"],
    steps: [
      { type: 'quiz', content: quizBoss1 },
      { type: 'quiz', content: quizBoss2 },
    ]
  },
};

// =================== CONTENT FUNCTIONS ===================
window.plateStackGame = [];

function learnStack() {
  const charImg = GS.charChoice === 'bom' ? '/bom.png' : '/bam.png';
  window.plateStackGame = []; // Reset game on load
  setTimeout(renderPlateGame, 100); // initial render
  return `
    <div class="game-board">
      <div class="board-body" style="justify-content: center;">
        
        
        <!-- Center: Plate Stack Visual -->
        <div class="board-center">
          <div class="plate-stack-area" id="plate-stack-area">
            <!-- Dynamic Plates handled by JS -->
          </div>
        </div>

        <!-- Right Side: Learning Checklist -->
        <div class="board-right" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 30px rgba(0,0,0,0.1); color: #1F1235; border-radius: 20px;">
          <h3 style="color: #FF8F00; text-shadow: none;">⭐ สิ่งที่ได้เรียนรู้</h3>
          <ul style="color: #333;">
            <li>ความหมายของ Stack</li>
            <li>ลักษณะและโครงสร้าง</li>
            <li>การเข้าถึงข้อมูล</li>
            <li>ตำแหน่ง Top</li>
            <li>แนวคิด LIFO</li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Side: Mini Game -->
      <div class="board-bottom" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.8); box-shadow: 0 -4px 20px rgba(0,0,0,0.1); border-radius: 20px; color: #1F1235;">
        <div class="board-bottom-title" style="margin-bottom: 8px; color: #FF8F00; text-shadow: none;">🎮 มินิเกม : สร้างกองข้อมูล (เรียงจาน)</div>
        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 1rem;">คลิกปุ่ม A B C D ตามลำดับเพื่อเรียงจานให้เป็น Stack บนโต๊ะ</div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div class="game-options" id="plate-game-options">
            <button class="game-btn" onclick="pushPlateGame('A', this)">A</button>
            <button class="game-btn" onclick="pushPlateGame('B', this)">B</button>
            <button class="game-btn" onclick="pushPlateGame('C', this)">C</button>
            <button class="game-btn" onclick="pushPlateGame('D', this)">D</button>
            <button class="game-btn" style="background: linear-gradient(135deg, #EF5350, #D32F2F); margin-left: 15px; width: auto; padding: 10px 24px; font-size: 1.1rem; border-radius: 20px;" onclick="popPlateGame()">Pop (ดึงออก)</button>
          </div>
          <div style="display: flex; gap: 20px; align-items: flex-end;">
            <button class="btn-primary" style="padding: 12px 24px; font-size: 1.15rem; width: auto; max-width: none; border-radius: 20px; box-shadow: 0 5px 15px rgba(124, 77, 255, 0.5);" onclick="checkPlateGame()">ตรวจคำตอบ</button>
          </div>
        </div>
        <div style="margin-top: 15px; font-size: 0.95rem; color: #90CAF9; font-weight: 600;">🎯 เป้าหมาย : เข้าใจแนวคิดของ Stack และรู้ว่าข้อมูลล่าสุดจะอยู่ด้านบนสุด (Top)</div>
      </div>
    </div>
  `;
}

window.pushPlateGame = function(val) {
  if(window.plateStackGame.length >= 4) return;
  if(window.plateStackGame.includes(val)) return; // Don't add duplicate
  window.plateStackGame.push(val);
  renderPlateGame();
};

window.popPlateGame = function() {
  if(window.plateStackGame.length === 0) return;
  
  // Animate pop
  const area = document.getElementById('plate-stack-area');
  const plates = area.querySelectorAll('.plate-item');
  if(plates.length > 0) {
    const topPlate = plates[plates.length - 1];
    topPlate.classList.remove('anim-drop');
    topPlate.classList.add('anim-pop');
    setTimeout(() => {
      window.plateStackGame.pop();
      renderPlateGame();
    }, 350); // wait for pop animation
  }
};

window.renderPlateGame = function() {
  const area = document.getElementById('plate-stack-area');
  if(!area) return;

  let html = '';
  
  window.plateStackGame.forEach((val, index) => {
    const bottomPos = 10 + (index * 20); // Adjusted offset for responsiveness
    const zIndex = 10 + index;
    html += '<div class="plate-item anim-drop" style="bottom:' + bottomPos + 'px; z-index:' + zIndex + ';"><img src="/จาน.png" alt="จาน"><span class="plate-label">' + val + '</span></div>';
  });
  
  if (window.plateStackGame.length > 0) {
    const topPos = 10 + ((window.plateStackGame.length - 1) * 20) + 50;
    html += '<div class="top-pointer" style="bottom: ' + topPos + 'px; z-index: 50;">Top</div>';
  }
  
  area.innerHTML = html;
};

window.checkPlateGame = function() {
  const expected = ['A', 'B', 'C', 'D'];
  const isCorrect = window.plateStackGame.length === expected.length && window.plateStackGame.every((val, index) => val === expected[index]);
  
  if(isCorrect) {
    alert('✅ เก่งมาก! จัดเรียง Stack ได้ถูกต้อง (A อยู่ล่างสุด D อยู่บนสุด) +20 EXP');
    addEXP(20);
    setTimeout(() => { document.getElementById('btn-zone-next').click(); }, 1000);
  } else {
    alert('❌ ยังไม่ถูกต้อง ลองเรียงใหม่ให้อยู่ในลำดับ A, B, C, D ดูนะ (เรียงจากล่างขึ้นบน)');
    window.plateStackGame = [];
    renderPlateGame();
  }
};

function videoStack() {
  return `
    <div class="game-board">
      <div class="board-header">
        <h2>ด่านที่ 1 : วิดีโออธิบายเรื่อง Stack</h2>
        <div class="board-exp">⭐ XP 50</div>
      </div>
      <div class="board-body" style="flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px;">
        <h3 style="font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg, #1565C0, #8E24AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 4px 15px rgba(21,101,192,0.3); margin-bottom: 10px;">มาดูวิดีโอสรุปกันอีกครั้งเพื่อให้เข้าใจมากขึ้น! 🎬</h3>
        <p style="color: #455A64; font-size: 1.15rem; font-weight: 600; max-width: 550px; margin-bottom: 25px;">วิดีโอนี้จะช่วยทบทวนหลักการ LIFO (เข้าทีหลัง ออกก่อน) ให้เพื่อนๆ เห็นภาพการนำไปใช้งานจริงได้ชัดเจนยิ่งขึ้นครับ</p>
        
        <div style="width: 100%; max-width: 650px; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.3); background: #000; position: relative; padding-bottom: 56.25%; height: 0; border: 4px solid #BBDEFB;">
          <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/KInG04mAjO0?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        
        <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 15px;">
          <p style="color: #78909C; font-size: 1rem; font-weight: 600;">(หากดูจบแล้ว กดปุ่มด้านล่างเพื่อไปด่านถัดไปได้เลย 👇)</p>
          <button class="btn-primary" style="width: auto; padding: 14px 40px; font-size: 1.25rem; border-radius: 50px; box-shadow: 0 8px 25px rgba(124, 77, 255, 0.5);" onclick="addEXP(50); document.getElementById('btn-zone-next').click();">ดูจบแล้ว ไปต่อเลย ▶</button>
        </div>
      </div>
    </div>
  `;
}

function quizStackBasic() {
  return makeQuiz(
    "Stack ใช้หลักการใดในการนำข้อมูลออก?",
    ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Random Access", "Sorted Order"],
    1,
    15
  );
}

function learnLIFO() {
  return `
    <div class="lesson-card">
      <h2>หลักการ LIFO</h2>
      <p><strong>LIFO = Last In, First Out</strong></p>
      <p>ข้อมูลที่ <strong>เข้ามาล่าสุด</strong> จะ <strong>ออกไปก่อน</strong></p>
      <div class="highlight">เหมือนซอง Pringles 🥂 — เม็ดที่ใส่ลงไปล่าสุดจะถูกหยิบออกมาก่อน!</div>
      <div class="stack-wrapper">
        <div style="position:relative;">
          <div style="display:flex;gap:20px;align-items:flex-end;margin:16px 0;">
            <div style="text-align:center;">
              <div style="font-size:0.85rem;margin-bottom:4px;color:#FF6B9D;">⬆ Push ตามลำดับ</div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="padding:8px 16px;border-radius:8px;background:rgba(124,77,255,0.3);font-size:0.9rem;">C (ล่าสุด)</div>
                <div style="padding:8px 16px;border-radius:8px;background:rgba(255,107,157,0.3);font-size:0.9rem;">B</div>
                <div style="padding:8px 16px;border-radius:8px;background:rgba(0,188,212,0.3);font-size:0.9rem;">A (แรกสุด)</div>
              </div>
            </div>
            <div style="font-size:2rem;">→</div>
            <div style="text-align:center;">
              <div style="font-size:0.85rem;margin-bottom:4px;color:#00E676;">⬇ Pop ตามลำดับ</div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="padding:8px 16px;border-radius:8px;background:rgba(0,230,118,0.25);font-size:0.9rem;">C (ออกก่อน)</div>
                <div style="padding:8px 16px;border-radius:8px;background:rgba(255,107,157,0.15);font-size:0.9rem;">B</div>
                <div style="padding:8px 16px;border-radius:8px;background:rgba(0,188,212,0.1);font-size:0.9rem;">A (ออกทีหลัง)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function quizLIFO() {
  return makeQuiz(
    "Push A, B, C เข้า Stack ตามลำดับ ถ้า Pop 1 ครั้ง จะได้อะไร?",
    ["A", "B", "C", "ไม่มีข้อมูล"],
    2, 15
  );
}

function learnTop() {
  return `
    <div class="lesson-card">
      <h2>ตำแหน่ง Top คืออะไร?</h2>
      <p>Top คือ <strong>ตัวชี้ตำแหน่ง (Pointer)</strong> ที่บอกว่าข้อมูลอยู่ที่ไหนบนสุดของ Stack</p>
      <p>การ Push และ Pop จะเกิดขึ้น <strong>ที่ Top เสมอ</strong></p>
      <div class="highlight">💡 ถ้า Stack ว่าง Top = -1 (หรือ null) แล้วแต่การ implement</div>
      <div class="stack-wrapper">
        <div style="position:relative;display:inline-block;">
          <div style="position:absolute;right:-80px;top:0;color:#FF6B9D;font-weight:700;display:flex;align-items:center;gap:6px;">
            <span style="font-size:1.5rem;">←</span> TOP = index 2
          </div>
          <div class="stack-box" style="width:140px;">
            <div class="stack-cell" style="background:linear-gradient(135deg,#7C4DFF,#651FFF);border:3px solid #FFD600;">C</div>
            <div class="stack-cell" style="background:linear-gradient(135deg,#FF6B9D,#C2185B);">B</div>
            <div class="stack-cell" style="background:linear-gradient(135deg,#00BCD4,#006064);">A</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function quizTop() {
  return `
    <div class="lesson-card">
      <h2>🎯 หา Top ของ Stack!</h2>
      <p>คลิกที่ข้อมูลที่เป็น <strong>Top</strong> ของ Stack นี้</p>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center;margin:16px 0;">
        <div onclick="checkTop(this,'wrong','A')" style="cursor:pointer;padding:14px 40px;background:linear-gradient(135deg,#00BCD4,#006064);border-radius:10px;font-weight:700;font-size:1.2rem;color:white;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">A</div>
        <div onclick="checkTop(this,'wrong','B')" style="cursor:pointer;padding:14px 40px;background:linear-gradient(135deg,#FF6B9D,#C2185B);border-radius:10px;font-weight:700;font-size:1.2rem;color:white;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">B</div>
        <div onclick="checkTop(this,'correct','D')" style="cursor:pointer;padding:14px 40px;background:linear-gradient(135deg,#7C4DFF,#651FFF);border-radius:10px;font-weight:700;font-size:1.2rem;color:white;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">D ← บนสุด</div>
      </div>
      <div id="top-result" class="status-msg"></div>
    </div>
  `;
}
window.checkTop = function(el, res, val) {
  const r = document.getElementById('top-result');
  if (res === 'correct') {
    el.style.boxShadow = '0 0 20px rgba(0,230,118,0.8)';
    r.className = 'status-msg success';
    r.innerText = `✅ ถูกต้อง! ${val} เป็น Top ของ Stack! +15 EXP`;
    addEXP(15);
  } else {
    el.style.boxShadow = '0 0 20px rgba(255,82,82,0.8)';
    r.className = 'status-msg overflow';
    r.innerText = `❌ ไม่ใช่ครับ ${val} ไม่ได้อยู่บนสุด ดูดีๆ อีกครั้ง`;
  }
};

function learnPush() {
  return `
    <div class="lesson-card">
      <h2>Push — เพิ่มข้อมูลเข้า Stack</h2>
      <p>Push คือ operation ที่ <strong>เพิ่มข้อมูลใหม่เข้าที่ตำแหน่ง Top</strong> ของ Stack</p>
      <div class="highlight">เมื่อ Push: Top จะเพิ่มขึ้น 1 และข้อมูลใหม่อยู่ที่ตำแหน่ง Top</div>
      <div class="stack-wrapper">
        <div style="display:flex;align-items:flex-end;gap:20px;">
          <div style="text-align:center;">
            <div style="font-size:0.85rem;margin-bottom:4px;">ก่อน Push D</div>
            <div class="stack-box" style="width:100px;">
              <div class="stack-cell" style="height:36px;background:#7C4DFF;">C</div>
              <div class="stack-cell" style="height:36px;background:#FF6B9D;">B</div>
              <div class="stack-cell" style="height:36px;background:#00BCD4;">A</div>
            </div>
          </div>
          <div style="font-size:2rem;margin-bottom:30px;">→</div>
          <div style="text-align:center;">
            <div style="font-size:0.85rem;margin-bottom:4px;color:#00E676;">หลัง Push D</div>
            <div class="stack-box" style="width:100px;">
              <div class="stack-cell" style="height:36px;background:#FFD600;color:#1F1235;border:2px solid #FFD600;">D ← NEW TOP</div>
              <div class="stack-cell" style="height:36px;background:#7C4DFF;">C</div>
              <div class="stack-cell" style="height:36px;background:#FF6B9D;">B</div>
              <div class="stack-cell" style="height:36px;background:#00BCD4;">A</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function demoPush() {
  const items = ['A','B','C'];
  let stack = [...items];
  const labels = ['E','F','G','H'];
  let pushIdx = 0;
  const colors = ['#7C4DFF','#FF6B9D','#00BCD4','#FFD600','#00E676','#FF9800','#E91E63','#9C27B0'];
  
  window._pushStack = stack;
  window._pushColors = colors;
  window._pushIdx = 0;
  window._pushLabels = labels;
  
  return `
    <div class="lesson-card">
      <h2>🏭 Push Factory — ลองเพิ่มข้อมูล!</h2>
      <div class="stack-wrapper">
        <div class="stack-label-top" style="color:#FFD600;">↑ TOP</div>
        <div class="stack-box" id="push-demo-stack" style="width:160px;height:220px;">
          ${items.map((it, i) => `<div class="stack-cell" style="background:${colors[i]};${i===colors.length-1?'color:#1F1235;':''}"> ${it}</div>`).join('')}
        </div>
      </div>
      <div class="interactive-row">
        <button class="btn-game btn-push" onclick="doPushDemo()">⬆ PUSH ${labels[0]}</button>
        <button class="btn-game btn-pop" onclick="doPopDemo()">⬇ POP</button>
      </div>
      <div id="push-status" class="status-msg"></div>
    </div>
  `;
}

window._pushDemoStack = ['A','B','C'];
window._pushDemoIdx = 0;
window._pushDemoLabels = ['D','E','F','G'];
window._pushDemoColors = ['#7C4DFF','#FF6B9D','#00BCD4','#FFD600','#00E676','#FF9800'];

window.doPushDemo = function() {
  const st = document.getElementById('push-demo-stack');
  const labels = window._pushDemoLabels;
  const colors = window._pushDemoColors;
  const idx = window._pushDemoIdx;
  if (!st || idx >= labels.length) {
    document.getElementById('push-status').className = 'status-msg overflow';
    document.getElementById('push-status').innerText = '⚠️ Stack เต็มแล้ว!';
    return;
  }
  const cell = document.createElement('div');
  cell.className = 'stack-cell';
  cell.style.background = colors[3 + idx] || '#888';
  cell.innerText = labels[idx];
  st.appendChild(cell);
  window._pushDemoIdx++;
  const btn = document.querySelector('.btn-push');
  if (btn && window._pushDemoIdx < labels.length) btn.innerText = `⬆ PUSH ${labels[window._pushDemoIdx]}`;
  document.getElementById('push-status').className = 'status-msg success';
  document.getElementById('push-status').innerText = `✅ PUSH ${labels[idx]} เข้า Stack สำเร็จ!`;
  addEXP(5);
};

window.doPopDemo = function() {
  const st = document.getElementById('push-demo-stack');
  if (!st || st.children.length === 0) {
    document.getElementById('push-status').className = 'status-msg underflow';
    document.getElementById('push-status').innerText = '🌊 Stack ว่างเปล่า! Underflow!';
    return;
  }
  const top = st.lastElementChild;
  top.classList.add('pop-anim');
  const txt = top.innerText;
  setTimeout(() => { if (top.parentNode) top.parentNode.removeChild(top); }, 300);
  document.getElementById('push-status').className = 'status-msg success';
  document.getElementById('push-status').innerText = `✅ POP ${txt} ออกจาก Stack!`;
  if (window._pushDemoIdx > 0) window._pushDemoIdx--;
};

function learnPop() {
  return `
    <div class="lesson-card">
      <h2>Pop — นำข้อมูลออกจาก Stack</h2>
      <p>Pop คือ operation ที่ <strong>นำข้อมูลที่อยู่บน Top ออก</strong> จาก Stack</p>
      <div class="highlight">เมื่อ Pop: Top จะลดลง 1 และข้อมูลที่อยู่บนสุดถูกนำออก</div>
      <p>ฟังก์ชันที่เกี่ยวข้อง:</p>
      <ul style="margin:10px 0 0 20px;line-height:2;">
        <li><code style="background:rgba(124,77,255,0.2);padding:2px 8px;border-radius:4px;">pop()</code> — นำข้อมูล Top ออกและ return ค่า</li>
        <li><code style="background:rgba(124,77,255,0.2);padding:2px 8px;border-radius:4px;">peek()</code> — ดูข้อมูล Top <em>โดยไม่นำออก</em></li>
        <li><code style="background:rgba(124,77,255,0.2);padding:2px 8px;border-radius:4px;">isEmpty()</code> — ตรวจว่า Stack ว่างหรือไม่</li>
      </ul>
    </div>
  `;
}

function demoPop() {
  return `
    <div class="lesson-card">
      <h2>🔴 Pop Cave — ลองนำข้อมูลออก!</h2>
      <div class="stack-wrapper">
        <div class="stack-label-top">↑ TOP</div>
        <div class="stack-box" id="pop-demo-stack" style="width:160px;height:220px;">
          <div class="stack-cell" style="background:#7C4DFF">D</div>
          <div class="stack-cell" style="background:#FF6B9D">C</div>
          <div class="stack-cell" style="background:#00BCD4">B</div>
          <div class="stack-cell" style="background:#00E676;color:#1F1235">A</div>
        </div>
      </div>
      <div class="interactive-row">
        <button class="btn-game btn-pop" onclick="doPopDemoLevel()">⬇ POP</button>
        <button class="btn-game btn-peek" onclick="doPeekDemo()">👁️ PEEK</button>
      </div>
      <div id="pop-status" class="status-msg"></div>
    </div>
  `;
}
window.doPopDemoLevel = function() {
  const st = document.getElementById('pop-demo-stack');
  if (!st || st.children.length === 0) {
    document.getElementById('pop-status').className = 'status-msg underflow';
    document.getElementById('pop-status').innerText = '🌊 Stack Underflow! ไม่มีข้อมูลให้ Pop';
    return;
  }
  const top = st.lastElementChild;
  const txt = top.innerText;
  top.classList.add('pop-anim');
  setTimeout(() => { if (top.parentNode) top.parentNode.removeChild(top); }, 300);
  document.getElementById('pop-status').className = 'status-msg success';
  document.getElementById('pop-status').innerText = `✅ POP "${txt}" ออกจาก Stack! Top ลดลง 1`;
};
window.doPeekDemo = function() {
  const st = document.getElementById('pop-demo-stack');
  if (!st || st.children.length === 0) {
    document.getElementById('pop-status').className = 'status-msg overflow';
    document.getElementById('pop-status').innerText = '❌ Stack ว่าง ไม่มีข้อมูล Top';
    return;
  }
  const txt = st.lastElementChild.innerText;
  st.lastElementChild.style.boxShadow = '0 0 16px rgba(255,214,0,0.8)';
  document.getElementById('pop-status').className = 'status-msg success';
  document.getElementById('pop-status').innerText = `👁️ Peek: Top คือ "${txt}" (ยังอยู่ใน Stack)`;
  setTimeout(() => { if (st.lastElementChild) st.lastElementChild.style.boxShadow = ''; }, 1000);
};

function quizPop() {
  return makeQuiz(
    "peek() แตกต่างจาก pop() อย่างไร?",
    ["peek() นำข้อมูลออก, pop() แค่ดู", "peek() ดูข้อมูลโดยไม่นำออก, pop() นำข้อมูลออก", "เหมือนกันทุกอย่าง", "peek() เพิ่มข้อมูล, pop() ลบข้อมูล"],
    1, 15
  );
}

function demoOverflow() {
  return `
    <div class="lesson-card">
      <h2>⚠️ Stack Overflow!</h2>
      <p>Stack นี้จุได้แค่ <strong>4 ช่อง</strong> ลอง PUSH จนเต็มแล้วกดอีกครั้ง!</p>
      <div class="stack-wrapper">
        <div class="stack-label-top">↑ TOP (MAX = 4)</div>
        <div class="stack-box" id="overflow-stack" style="width:160px;height:220px;">
          <div class="stack-cell" style="background:#7C4DFF">A</div>
        </div>
      </div>
      <div class="interactive-row">
        <button class="btn-game btn-push" onclick="doOverflowPush()" id="overflow-btn">⬆ PUSH</button>
      </div>
      <div id="overflow-status" class="status-msg"></div>
    </div>
  `;
}
window._overflowItems = ['B','C','D','E','F'];
window._overflowIdx = 0;
window._overflowColors = ['#FF6B9D','#00BCD4','#FFD600','#00E676','#FF5252'];
window.doOverflowPush = function() {
  const st = document.getElementById('overflow-stack');
  const status = document.getElementById('overflow-status');
  if (st.children.length >= 4) {
    status.className = 'status-msg overflow';
    status.innerHTML = '🚨 <strong>Stack Overflow!</strong> ไม่สามารถ Push ได้ Stack เต็มแล้ว!';
    document.getElementById('overflow-btn').style.animation = 'shake 0.5s';
    setTimeout(() => { document.getElementById('overflow-btn').style.animation = ''; }, 500);
    return;
  }
  const idx = window._overflowIdx;
  const cell = document.createElement('div');
  cell.className = 'stack-cell';
  cell.style.background = window._overflowColors[idx];
  if (window._overflowItems[idx] === 'D') cell.style.color = '#1F1235';
  cell.innerText = window._overflowItems[idx];
  st.appendChild(cell);
  window._overflowIdx++;
  status.className = 'status-msg success';
  status.innerText = `✅ PUSH ${window._overflowItems[idx-1]} (${st.children.length}/4)`;
};

function quizOverflow() {
  return makeQuiz(
    "Stack Overflow เกิดขึ้นเมื่อ...?",
    ["Pop จาก Stack ที่ว่างเปล่า", "Push ข้อมูลลงใน Stack ที่เต็มแล้ว", "ดูข้อมูล Top ตอน Stack เต็ม", "Stack มีข้อมูลเกินกว่าจะนับได้"],
    1, 20
  );
}

function demoUnderflow() {
  return `
    <div class="lesson-card">
      <h2>🌊 Stack Underflow!</h2>
      <p>ลอง POP จน Stack <strong>ว่างเปล่า</strong> แล้วกด POP อีกครั้ง!</p>
      <div class="stack-wrapper">
        <div class="stack-box" id="underflow-stack" style="width:160px;height:200px;">
          <div class="stack-cell" style="background:#7C4DFF">B</div>
          <div class="stack-cell" style="background:#00BCD4">A</div>
        </div>
        <div class="stack-bottom-label" id="underflow-label">2 รายการ</div>
      </div>
      <div class="interactive-row">
        <button class="btn-game btn-pop" onclick="doUnderflowPop()">⬇ POP</button>
      </div>
      <div id="underflow-status" class="status-msg"></div>
    </div>
  `;
}
window.doUnderflowPop = function() {
  const st = document.getElementById('underflow-stack');
  const status = document.getElementById('underflow-status');
  const lbl = document.getElementById('underflow-label');
  if (st.children.length === 0) {
    status.className = 'status-msg underflow';
    status.innerHTML = '🌊 <strong>Stack Underflow!</strong> ไม่สามารถ Pop ได้ Stack ว่างเปล่าแล้ว!';
    st.style.animation = 'shake 0.5s';
    setTimeout(() => { st.style.animation = ''; }, 500);
    return;
  }
  const top = st.lastElementChild;
  const txt = top.innerText;
  top.classList.add('pop-anim');
  setTimeout(() => { if (top.parentNode) top.parentNode.removeChild(top); if (lbl) lbl.innerText = `${st.children.length} รายการ`; }, 300);
  status.className = 'status-msg success';
  status.innerText = `✅ POP "${txt}" สำเร็จ`;
};

function quizUnderflow() {
  return makeQuiz(
    "Stack Underflow คือ...?",
    ["Stack มีข้อมูลล้น", "Pop จาก Stack ที่ว่างเปล่า", "Push ข้อมูลซ้ำ", "Stack ขนาดเล็กเกินไป"],
    1, 20
  );
}

function learnArray() {
  return `
    <div class="lesson-card">
      <h2>💻 Array Lab — Stack ในโปรแกรม</h2>
      <p>ในการเขียนโปรแกรม Stack มักถูก implement ด้วย <strong>Array + ตัวแปร top</strong></p>
      <div class="highlight">top = -1 หมายถึง Stack ว่าง</div>
      <p>โครงสร้าง:</p>
      <div class="code-block">
        <span class="code-line"><span class="var">maxstack</span> = <span class="num">5</span>      <span class="cmt"># ขนาดสูงสุดของ Stack</span></span>
        <span class="code-line"><span class="var">arrstack</span> = [<span class="kw">None</span>] * <span class="var">maxstack</span>  <span class="cmt"># Array สำหรับเก็บข้อมูล</span></span>
        <span class="code-line"><span class="var">top</span> = <span class="num">-1</span>         <span class="cmt"># ชี้ตำแหน่ง Top (-1 = ว่าง)</span></span>
      </div>
    </div>
  `;
}

function demoArray() {
  return `
    <div class="lesson-card">
      <h2>🔬 ห้องทดลอง Array Stack</h2>
      <p>MAX = 5 | ดูการเปลี่ยนแปลงของ Array และตัวแปร top</p>
      <div class="array-viz" id="array-viz-box">
        <div class="array-row" id="array-cells"></div>
        <div class="array-index" id="array-idx"></div>
        <div class="top-indicator" id="array-top-ind"></div>
      </div>
      <div id="array-top-display" style="text-align:center;font-weight:700;color:var(--secondary);margin:8px 0;">top = -1</div>
      <div class="interactive-row">
        <button class="btn-game btn-push" onclick="doArrayPush()">PUSH</button>
        <button class="btn-game btn-pop" onclick="doArrayPop()">POP</button>
      </div>
      <div class="code-block" id="array-code" style="margin-top:12px;">
        <span class="code-line cmt"># กด PUSH หรือ POP เพื่อดูโค้ด</span>
      </div>
      <div id="array-status" class="status-msg"></div>
    </div>
  `;
}

window._arrStack = [null,null,null,null,null];
window._arrTop = -1;
window._arrLabels = ['A','B','C','D','E'];
window._arrLabelIdx = 0;
window._arrColors = ['#7C4DFF','#FF6B9D','#00BCD4','#FFD600','#00E676'];

function renderArrayViz() {
  const cells = document.getElementById('array-cells');
  const idx = document.getElementById('array-idx');
  const topInd = document.getElementById('array-top-ind');
  const topDisplay = document.getElementById('array-top-display');
  if (!cells) return;
  cells.innerHTML = '';
  idx.innerHTML = '';
  topInd.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const cell = document.createElement('div');
    cell.className = 'array-cell' + (window._arrStack[i] ? ' filled' : '') + (i === window._arrTop ? ' top-marker' : '');
    cell.style.color = 'white';
    if (window._arrStack[i]) { cell.style.background = window._arrColors[i]; cell.innerText = window._arrStack[i]; }
    cells.appendChild(cell);

    const idxEl = document.createElement('div');
    idxEl.className = 'array-index-num';
    idxEl.innerText = i;
    idx.appendChild(idxEl);

    const tEl = document.createElement('div');
    tEl.className = 'top-ind-cell';
    tEl.innerText = i === window._arrTop ? '↑ top' : '';
    topInd.appendChild(tEl);
  }
  topDisplay.innerText = `top = ${window._arrTop}`;
}
setTimeout(renderArrayViz, 100);

window.doArrayPush = function() {
  const status = document.getElementById('array-status');
  const code = document.getElementById('array-code');
  if (window._arrTop >= 4) {
    status.className = 'status-msg overflow'; status.innerText = '🚨 Stack Overflow! top = maxstack-1';
    return;
  }
  window._arrTop++;
  const label = window._arrLabels[window._arrLabelIdx % 5];
  window._arrStack[window._arrTop] = label;
  window._arrLabelIdx++;
  renderArrayViz();
  code.innerHTML = `<span class="code-line highlight-line"><span class="cmt"># Push "${label}" เข้า Stack</span></span>
<span class="code-line"><span class="kw">if</span> <span class="var">top</span> < <span class="var">maxstack</span> - <span class="num">1</span>:</span>
<span class="code-line highlight-line">    <span class="var">top</span> = <span class="var">top</span> + <span class="num">1</span>   <span class="cmt"># top เพิ่มขึ้น 1 → top = ${window._arrTop}</span></span>
<span class="code-line highlight-line">    <span class="var">arrstack</span>[<span class="var">top</span>] = <span class="str">"${label}"</span>   <span class="cmt"># ใส่ข้อมูลที่ index ${window._arrTop}</span></span>`;
  status.className = 'status-msg success'; status.innerText = `✅ PUSH "${label}" ที่ index ${window._arrTop}`;
  addEXP(5);
};
window.doArrayPop = function() {
  const status = document.getElementById('array-status');
  const code = document.getElementById('array-code');
  if (window._arrTop < 0) {
    status.className = 'status-msg underflow'; status.innerText = '🌊 Stack Underflow! top = -1';
    return;
  }
  const val = window._arrStack[window._arrTop];
  window._arrStack[window._arrTop] = null;
  const oldTop = window._arrTop;
  window._arrTop--;
  renderArrayViz();
  code.innerHTML = `<span class="code-line highlight-line"><span class="cmt"># Pop "${val}" จาก Stack</span></span>
<span class="code-line"><span class="kw">if</span> <span class="var">top</span> >= <span class="num">0</span>:</span>
<span class="code-line highlight-line">    <span class="var">data</span> = <span class="var">arrstack</span>[<span class="var">top</span>]   <span class="cmt"># อ่านค่าที่ index ${oldTop} → "${val}"</span></span>
<span class="code-line highlight-line">    <span class="var">top</span> = <span class="var">top</span> - <span class="num">1</span>   <span class="cmt"># top ลดลง 1 → top = ${window._arrTop}</span></span>`;
  status.className = 'status-msg success'; status.innerText = `✅ POP "${val}" จาก index ${oldTop}`;
};

function learnBinary() {
  return `
    <div class="lesson-card">
      <h2>🧪 Application — แปลงเลขฐาน 10 เป็นฐาน 2</h2>
      <p>Stack ช่วยแปลงเลขฐาน 10 เป็นฐาน 2 ได้! วิธีการคือ:</p>
      <div class="binary-steps">
        <div class="binary-step"><div class="step-num">1</div> หารเลขด้วย 2 เก็บเศษไว้</div>
        <div class="binary-step"><div class="step-num">2</div> PUSH เศษที่ได้ลงใน Stack</div>
        <div class="binary-step"><div class="step-num">3</div> ทำซ้ำจนผล÷ = 0</div>
        <div class="binary-step"><div class="step-num">4</div> POP จาก Stack ทีละตัว → ได้เลขฐาน 2!</div>
      </div>
      <div class="highlight">ตัวอย่าง: 10 ÷ 2 = 5 เศษ 0 → Push 0<br/>5 ÷ 2 = 2 เศษ 1 → Push 1<br/>2 ÷ 2 = 1 เศษ 0 → Push 0<br/>1 ÷ 2 = 0 เศษ 1 → Push 1<br/>Pop ออก: 1 0 1 0 → 10 = 1010₂</div>
    </div>
  `;
}

function demoBinary() {
  const steps = [
    {num: 10, div2: 5, rem: 0, push: '0'},
    {num: 5, div2: 2, rem: 1, push: '1'},
    {num: 2, div2: 1, rem: 0, push: '0'},
    {num: 1, div2: 0, rem: 1, push: '1'},
  ];
  let stepIdx = 0;
  let phase = 'divide'; // 'divide' or 'pop'
  let binaryStack = [];
  window._binaryStep = 0;
  window._binaryPhase = 'divide';
  window._binaryStack = [];

  return `
    <div class="lesson-card">
      <h2>🔢 แปลง 10 เป็นเลขฐาน 2</h2>
      <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
        <div>
          <div style="font-size:0.9rem;color:rgba(255,255,255,0.6);margin-bottom:4px;">Stack (กด Push/Pop)</div>
          <div class="stack-box" id="binary-stack" style="width:80px;height:180px;"></div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div id="binary-step-display" style="background:rgba(255,255,255,0.08);border-radius:12px;padding:14px;font-size:0.9rem;line-height:1.8;color:white;min-height:80px;">กด <strong>เริ่มต้น</strong> เพื่อแปลง 10 → ฐาน 2</div>
          <div style="margin-top:12px;font-weight:700;">ผลลัพธ์: <span id="binary-result" style="color:var(--accent-yellow);font-size:1.3rem;letter-spacing:4px;">?</span></div>
        </div>
      </div>
      <div class="interactive-row" style="margin-top:12px;">
        <button class="btn-game btn-push" id="binary-btn" onclick="doBinaryStep()">▶ เริ่มต้น</button>
      </div>
    </div>
  `;
}

window.doBinaryStep = function() {
  const steps = [
    {label: '10 ÷ 2 = 5 เศษ 0 → PUSH 0', push: '0', color:'#7C4DFF'},
    {label: '5 ÷ 2 = 2 เศษ 1 → PUSH 1', push: '1', color:'#FF6B9D'},
    {label: '2 ÷ 2 = 1 เศษ 0 → PUSH 0', push: '0', color:'#00BCD4'},
    {label: '1 ÷ 2 = 0 เศษ 1 → PUSH 1 (หยุด!)', push: '1', color:'#FFD600'},
  ];
  const st = document.getElementById('binary-stack');
  const display = document.getElementById('binary-step-display');
  const result = document.getElementById('binary-result');
  const btn = document.getElementById('binary-btn');
  if (!st) return;

  if (!window._binPhase) window._binPhase = 'push';
  if (!window._binIdx) window._binIdx = 0;
  if (!window._binData) window._binData = [];

  if (window._binPhase === 'push' && window._binIdx < steps.length) {
    const s = steps[window._binIdx];
    const cell = document.createElement('div');
    cell.className = 'stack-cell';
    cell.style.background = s.color;
    cell.style.height = '36px';
    if (s.color === '#FFD600') cell.style.color = '#1F1235';
    cell.innerText = s.push;
    st.appendChild(cell);
    window._binData.push(s.push);
    display.innerHTML = `<strong>ขั้นที่ ${window._binIdx+1}:</strong> ${s.label}`;
    window._binIdx++;
    if (window._binIdx >= steps.length) {
      window._binPhase = 'pop';
      window._binPopData = [...window._binData].reverse();
      window._binPopIdx = 0;
      btn.innerText = '⬇ POP → อ่านผล';
    }
  } else if (window._binPhase === 'pop' && window._binPopIdx < window._binPopData.length) {
    const top = st.lastElementChild;
    const val = window._binPopData[window._binPopIdx];
    if (top) { top.classList.add('pop-anim'); setTimeout(() => { if (top.parentNode) top.parentNode.removeChild(top); }, 300); }
    result.innerText = (result.innerText === '?' ? '' : result.innerText) + val;
    display.innerHTML = `<strong>POP ครั้งที่ ${window._binPopIdx+1}:</strong> ได้ "${val}" → ต่อท้ายผลลัพธ์`;
    window._binPopIdx++;
    if (window._binPopIdx >= window._binPopData.length) {
      btn.innerText = '✅ เสร็จแล้ว!';
      btn.disabled = true;
      display.innerHTML += '<br/><strong style="color:#00E676">10₁₀ = 1010₂ 🎉</strong>';
      addEXP(20);
    }
  }
};

function demoPostfix() {
  const tokens = ['(','2','+','3',')','*','5'];
  const steps = [
    { tokenIdx: 0, action: "อ่าน '(' → Push ลง Operator Stack", stack: ['('], output: '', highlight: '(' },
    { tokenIdx: 1, action: "อ่าน '2' (Operand) → เขียน Output ทันที", stack: ['('], output: '2', highlight: '2' },
    { tokenIdx: 2, action: "อ่าน '+' (Operator) → Push ลง Stack", stack: ['(', '+'], output: '2', highlight: '+' },
    { tokenIdx: 3, action: "อ่าน '3' (Operand) → เขียน Output", stack: ['(', '+'], output: '2 3', highlight: '3' },
    { tokenIdx: 4, action: "อ่าน ')' → Pop จน Stack เจอ '('", stack: [], output: '2 3 +', highlight: ')' },
    { tokenIdx: 5, action: "อ่าน '*' (Operator) → Stack ว่าง Push ได้เลย", stack: ['*'], output: '2 3 +', highlight: '*' },
    { tokenIdx: 6, action: "อ่าน '5' (Operand) → เขียน Output", stack: ['*'], output: '2 3 + 5', highlight: '5' },
    { tokenIdx: -1, action: "อ่านครบ! Pop ที่เหลือทั้งหมดออก → ได้ Postfix!", stack: [], output: '2 3 + 5 *', highlight: null },
  ];
  window._postfixStep = 0;
  return `
    <div class="lesson-card">
      <h2>📐 Infix → Postfix: (2 + 3) * 5</h2>
      <p>กด <strong>ขั้นตอนถัดไป</strong> เพื่อดูการทำงานของ Stack ทีละขั้น</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;" id="postfix-tokens">
        ${tokens.map((t,i) => {
          const cls = t.match(/[+\-*/]/) ? 'operator' : t.match(/[()]/) ? 'paren' : 'operand';
          return `<div class="infix-token ${cls}" id="ptoken-${i}">${t}</div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">
        <div>
          <div style="font-size:0.85rem;color:rgba(255,255,255,0.6);margin-bottom:4px;">Operator Stack</div>
          <div class="stack-box" id="postfix-stack" style="width:80px;height:160px;"></div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:0.85rem;color:rgba(255,255,255,0.6);">Output (Postfix)</div>
          <div id="postfix-output" style="font-size:1.5rem;font-weight:700;color:var(--accent-yellow);letter-spacing:3px;min-height:36px;margin:4px 0;">_</div>
          <div id="postfix-action" style="background:rgba(255,255,255,0.08);border-radius:8px;padding:10px;font-size:0.9rem;color:white;min-height:50px;margin-top:8px;"></div>
        </div>
      </div>
      <div class="interactive-row" style="margin-top:10px;">
        <button class="btn-game btn-push" id="postfix-btn" onclick="doPostfixStep()">▶ ขั้นตอนถัดไป</button>
      </div>
    </div>
  `;
}

window.doPostfixStep = function() {
  const steps = [
    { tokenIdx: 0, action: "อ่าน '(' → Push ลง Operator Stack", stack: ['('], output: '_' },
    { tokenIdx: 1, action: "อ่าน '2' (Operand) → เขียน Output ทันที", stack: ['('], output: '2' },
    { tokenIdx: 2, action: "อ่าน '+' (Operator) → Push ลง Stack", stack: ['(', '+'], output: '2' },
    { tokenIdx: 3, action: "อ่าน '3' (Operand) → เขียน Output", stack: ['(', '+'], output: '2 3' },
    { tokenIdx: 4, action: "อ่าน ')' → Pop จน Stack เจอ '(' → Output '+' ด้วย", stack: [], output: '2 3 +' },
    { tokenIdx: 5, action: "อ่าน '*' → Stack ว่าง Push ได้เลย", stack: ['*'], output: '2 3 +' },
    { tokenIdx: 6, action: "อ่าน '5' (Operand) → เขียน Output", stack: ['*'], output: '2 3 + 5' },
    { tokenIdx: -1, action: "จบแล้ว! Pop ที่เหลือทั้งหมด → ได้ Postfix สมบูรณ์! 🎉", stack: [], output: '2 3 + 5 *' },
  ];
  const i = window._postfixStep;
  if (i >= steps.length) { document.getElementById('postfix-btn').innerText = '✅ จบแล้ว!'; return; }
  const s = steps[i];
  // update tokens highlight
  document.querySelectorAll('.infix-token').forEach((el, idx) => {
    el.classList.remove('current','done');
    if (idx < i) el.classList.add('done');
    if (idx === s.tokenIdx) el.classList.add('current');
  });
  // update stack
  const stackEl = document.getElementById('postfix-stack');
  if (stackEl) {
    stackEl.innerHTML = s.stack.map(op => `<div class="stack-cell" style="background:var(--primary);height:36px;font-size:1.2rem;">${op}</div>`).join('');
  }
  document.getElementById('postfix-output').innerText = s.output || '_';
  document.getElementById('postfix-action').innerText = s.action;
  if (i === steps.length - 1) {
    document.getElementById('postfix-btn').innerText = '✅ จบแล้ว!';
    addEXP(25);
  }
  window._postfixStep++;
};

function quizBoss1() {
  return makeQuiz(
    "ทำ operations ต่อไปนี้: Push A, Push B, Pop, Push C, Pop\nStack จะเหลืออะไร?",
    ["A B", "A", "B C", "ว่างเปล่า"],
    1, 30
  );
}

function quizBoss2() {
  return makeQuiz(
    "ใน Python Stack ด้วย List ใช้คำสั่งใดแทน push() และ pop()?",
    ["insert() และ remove()", "append() และ pop()", "add() และ delete()", "push() และ pull()"],
    1, 30
  );
}

// =================== GENERIC QUIZ MAKER ===================
function makeQuiz(question, choices, answerIdx, exp) {
  const id = 'quiz-' + Math.random().toString(36).substr(2, 6);
  window[`_quiz_${id}_ans`] = answerIdx;
  window[`_quiz_${id}_exp`] = exp;
  return `
    <div class="quiz-card">
      <h3>❓ ${question.replace(/\n/g,'<br/>')}</h3>
      <div class="quiz-choices">
        ${choices.map((c, i) => `
          <button class="quiz-choice" id="${id}-choice-${i}" onclick="answerZoneQuiz('${id}', ${i})">
            ${String.fromCharCode(65+i)}. ${c}
          </button>
        `).join('')}
      </div>
      <div id="${id}-result" class="status-msg" style="margin-top:8px;"></div>
    </div>
  `;
}

window.answerZoneQuiz = function(id, idx) {
  const ans = window[`_quiz_${id}_ans`];
  const exp = window[`_quiz_${id}_exp`];
  const allBtns = document.querySelectorAll(`[id^="${id}-choice-"]`);
  allBtns.forEach(b => b.disabled = true);
  const correctBtn = document.getElementById(`${id}-choice-${ans}`);
  const chosenBtn = document.getElementById(`${id}-choice-${idx}`);
  if (correctBtn) correctBtn.classList.add('correct');
  if (idx !== ans && chosenBtn) chosenBtn.classList.add('wrong');
  const result = document.getElementById(`${id}-result`);
  if (idx === ans) {
    result.className = 'status-msg success';
    result.innerText = `✅ ถูกต้อง! +${exp} EXP`;
    addEXP(exp);
    showFeedback('correct', exp);
  } else {
    result.className = 'status-msg overflow';
    result.innerText = `❌ ไม่ใช่ครับ! คำตอบที่ถูกต้องคือ "${choices[ans] || ''}"`;
    showFeedback('wrong', 0);
  }
};

const QUIZ_CHOICES_STORE = {};
// =================== ZONE RUNNER ===================
let currentZone = 1;
let currentZoneStep = 0;

window.enterZone = function(zoneNum) {
  if (!GS.unlocked.includes(zoneNum)) return;
  currentZone = zoneNum;
  currentZoneStep = 0;
  // Reset binary/postfix state
  window._binPhase = null; window._binIdx = 0; window._binData = []; window._binPopIdx = 0;
  window._postfixStep = 0;
  window._overflowIdx = 0;
  window._arrStack = [null,null,null,null,null]; window._arrTop = -1; window._arrLabelIdx = 0;
  window._pushDemoStack = ['A','B','C']; window._pushDemoIdx = 0;

  const zone = ZONES[zoneNum];
  document.getElementById('zone-title').innerText = zone.title;
  document.getElementById('zone-exp-display').innerText = GS.exp;
  const zce = document.getElementById('zone-char-img'); if (zce) zce.src = CHAR_IMG[GS.charChoice];
  renderZoneStep();
  showScreen('screen-zone');
};

function renderZoneStep() {
  const zone = ZONES[currentZone];
  const steps = zone.steps;
  const total = steps.length;
  const step = steps[currentZoneStep];

  // bubble
  const bubble = zone.bubble[Math.min(currentZoneStep, zone.bubble.length - 1)];
  document.getElementById('zone-char-bubble').innerHTML = bubble;

  // content
  const content = step.content();
  document.getElementById('zone-content').innerHTML = content;
  document.getElementById('zone-exp-display').innerText = GS.exp;

  // nav
  document.getElementById('btn-zone-prev').style.display = currentZoneStep > 0 ? 'inline-flex' : 'none';
  document.getElementById('btn-zone-next').innerText = currentZoneStep >= total - 1 ? '✅ จบด่านนี้!' : 'ถัดไป ▶';

  // dots
  const dots = document.getElementById('zone-step-dots');
  dots.innerHTML = steps.map((_, i) => `<div class="step-dot ${i < currentZoneStep ? 'done' : i === currentZoneStep ? 'active' : ''}"></div>`).join('');

  // re-init array viz if needed
  if (step.content === demoArray) {
    setTimeout(renderArrayViz, 50);
  }
}

window.zoneNext = function() {
  const zone = ZONES[currentZone];
  if (currentZoneStep < zone.steps.length - 1) {
    currentZoneStep++;
    renderZoneStep();
  } else {
    // Complete zone
    if (!GS.completed.includes(currentZone)) {
      GS.completed.push(currentZone);
      addEXP(50);
    }
    // Unlock next
    const nextZone = currentZone + 1;
    if (nextZone <= 10 && !GS.unlocked.includes(nextZone)) {
      GS.unlocked.push(nextZone);
    }
    // If boss complete, show posttest
    if (currentZone === 10) {
      startPosttest();
    } else {
      showZoneComplete();
    }
  }
};

window.zonePrev = function() {
  if (currentZoneStep > 0) {
    currentZoneStep--;
    renderZoneStep();
  }
};

function showZoneComplete() {
  showFeedback('complete', 50, `ด่าน "${ZONES[currentZone].emoji} ${ZONES[currentZone].title.split('—')[1]?.trim() || ''}" สำเร็จ! ปลดล็อกด่านถัดไปแล้ว`);
  setTimeout(() => {
    closeFeedback();
    showMap();
  }, 2000);
}

// =================== FEEDBACK POPUP ===================
function showFeedback(type, exp, customMsg) {
  const overlay = document.getElementById('popup-feedback');
  const card = document.getElementById('popup-card');
  const icon = document.getElementById('popup-icon');
  const title = document.getElementById('popup-title');
  const msg = document.getElementById('popup-msg');
  const expEl = document.getElementById('popup-exp');
  const charImg = document.getElementById('popup-char-img');
  charImg.src = CHAR_IMG[GS.charChoice];
  card.className = 'popup-card';
  if (type === 'correct') {
    card.classList.add('correct-card');
    icon.innerText = '✅';
    title.innerText = 'ถูกต้อง!';
    msg.innerText = customMsg || CHAR_SAY[GS.charChoice].correct;
    expEl.innerText = `+${exp} EXP`;
  } else if (type === 'wrong') {
    card.classList.add('wrong-card');
    icon.innerText = '❌';
    title.innerText = 'ยังไม่ถูกต้อง';
    msg.innerText = customMsg || CHAR_SAY[GS.charChoice].wrong;
    expEl.innerText = '';
  } else if (type === 'complete') {
    card.classList.add('correct-card');
    icon.innerText = '🏆';
    title.innerText = 'ผ่านด่านแล้ว!';
    msg.innerText = customMsg || 'ยอดเยี่ยมมาก!';
    expEl.innerText = `+${exp} EXP`;
  }
  overlay.classList.remove('hidden');
}

window.closeFeedback = function() {
  document.getElementById('popup-feedback').classList.add('hidden');
};

// =================== EXP ===================
function addEXP(amount) {
  GS.exp += amount;
  document.getElementById('map-exp').innerText = GS.exp;
  document.getElementById('zone-exp-display').innerText = GS.exp;
  // flash
  const flash = document.createElement('div');
  flash.className = 'exp-flash';
  flash.innerText = `+${amount} EXP`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1500);
}

// =================== POST-TEST ===================
function startPosttest() {
  testIsPretest = false;
  testScore = 0;
  currentTestQ = 0;
  const el = document.getElementById('posttest-char-img');
  if (el) el.src = CHAR_IMG[GS.charChoice];
  document.getElementById('posttest-guide-bubble').innerText =
    `เยี่ยมมาก ${GS.playerName}! ถึงเวลาทดสอบความรู้ที่ได้เรียนมาแล้วครับ/ค่ะ!`;
  renderTestQuestion('posttest');
  showScreen('screen-posttest');
}

// =================== RESULT ===================
function showResult() {
  document.getElementById('result-name').innerText = GS.playerName;
  document.getElementById('result-exp').innerText = GS.exp;
  document.getElementById('result-pre').innerText = `${GS.pretestScore}/5`;
  document.getElementById('result-post').innerText = `${GS.posttestScore}/5`;
  const charImg = document.getElementById('result-char-img');
  if (charImg) charImg.src = CHAR_IMG[GS.charChoice];
  const checklist = document.getElementById('result-checklist');
  const topics = ['เข้าใจ Stack ได้','เข้าใจ LIFO ได้','Push ได้','Pop ได้','เข้าใจ Top ได้','วิเคราะห์ Stack จากโค้ดได้'];
  checklist.innerHTML = topics.map(t => `<div class="check-item">${t}</div>`).join('');
  const badges = document.getElementById('result-badges');
  badges.innerHTML = ['🏆','⭐','🎮','💡','🚀'].map((b,i) => `<div class="badge" style="animation-delay:${i*0.15}s">${b}</div>`).join('');
  showScreen('screen-result');
}

// =================== RESTART ===================
window.restartGame = function() {
  GS.exp = 0; GS.unlocked = [1]; GS.completed = [];
  GS.pretestScore = 0; GS.posttestScore = 0; GS.posttestDone = false;
  showScreen('screen-home');
};
