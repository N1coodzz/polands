const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function haptic(type = "light") {
  if (!tg?.HapticFeedback) return;
  try {
    tg.HapticFeedback.impactOccurred(type);
  } catch {}
}

let toastTimer = null;
function showToast(text) {
  const toast = $("#toast");
  const toastText = $("#toastText");
  toastText.textContent = text;

  toast.classList.add("show");
  toast.setAttribute("aria-hidden", "false");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 1700);
}

// ===== Navigation stack (как в приложении) =====
let currentScreen = "home";
let screenStack = ["home"];

const headerTitle = $("#headerTitle");
const headerSub = $("#headerSub");
const backBtn = $("#backBtn");

function setHeaderFor(screen) {
  // Можно настроить подписи под каждую страницу
  if (screen === "home") {
    headerTitle.textContent = "Профиль";
    headerSub.textContent = "🟡 Новичок • до 22.02.2026";
  } else if (screen === "materials") {
    headerTitle.textContent = "База материалов";
    headerSub.textContent = "Подборки, гайды, уроки";
  } else if (screen === "community") {
    headerTitle.textContent = "Сообщество";
    headerSub.textContent = "Ивенты, эфиры, объявления";
  } else if (screen === "chats") {
    headerTitle.textContent = "Чаты по городам";
    headerSub.textContent = "Выбери город и общайся";
  } else if (screen === "favorites") {
    headerTitle.textContent = "Избранное";
    headerSub.textContent = "Сохранённые материалы";
  }
}

function showScreen(screen, push = true) {
  const screens = $$(".screen");
  const tabs = $$(".tab");

  screens.forEach(s => s.classList.toggle("active", s.dataset.screen === screen));

  // активность табов только для home/community/favorites
  tabs.forEach(t => t.classList.remove("active"));
  const tabToActivate = [...tabs].find(t => t.dataset.tab === screen);
  if (tabToActivate) tabToActivate.classList.add("active");

  if (push && screenStack[screenStack.length - 1] !== screen) {
    screenStack.push(screen);
  }

  currentScreen = screen;
  setHeaderFor(screen);

  // кнопка назад
  if (currentScreen !== "home") backBtn.classList.remove("hidden");
  else backBtn.classList.add("hidden");
}

backBtn.addEventListener("click", () => {
  haptic("light");
  if (screenStack.length > 1) {
    screenStack.pop(); // убрать текущий
    const prev = screenStack[screenStack.length - 1] || "home";
    showScreen(prev, false);
  } else {
    showScreen("home", false);
  }
}, { passive: true });

// ===== Tabs =====
$$(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    haptic("light");
    showScreen(btn.dataset.tab, true);
  }, { passive: true });
});

// ===== Quick actions (верхние 3 кнопки) =====
$$(".qa").forEach(btn => {
  btn.addEventListener("click", () => {
    haptic("light");
    const go = btn.dataset.go;
    showScreen(go, true);
  }, { passive: true });
});

// ===== Fake interactions on list/chips =====
$$(".list-item").forEach(item => {
  item.addEventListener("click", () => {
    haptic("light");
    showToast("Откроем это позже 👌");
  }, { passive: true });
});

$$(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    haptic("light");
    showToast(`Чат «${chip.textContent}» скоро будет доступен`);
  }, { passive: true });
});

// ===== Rewards modal =====
const modal = $("#rewardsModal");
const openRewards = $("#openRewards");
const closeRewards = $("#closeRewards");

function openModal() {
  haptic("light");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModalFn() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

openRewards.addEventListener("click", openModal, { passive: true });
closeRewards.addEventListener("click", closeModalFn, { passive: true });
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
}, { passive: true });

// ===== Rewards: 12 levels + progress updates =====
// Тут ты потом подставишь реальный прогресс с бэка/подписки
let currentLevel = 1;
const maxLevel = 12;

const progressTxt = $("#progressTxt");
const progressBar = $("#progressBar");
const rewardsTrack = $("#rewardsTrack");

function renderRewards() {
  rewardsTrack.innerHTML = "";

  for (let i = 1; i <= maxLevel; i++) {
    const locked = i > currentLevel;

    const card = document.createElement("div");
    card.className = `reward ${locked ? "locked" : "active"}`;

    card.innerHTML = `
      <div class="reward-head">${i} месяц • <span>${getTitleByLevel(i)}</span></div>
      <div class="reward-body">
        <div class="reward-img"></div>
        ${locked
          ? `<button class="pill" disabled>ЗАКРЫТО</button>`
          : `<button class="pill tap" data-claim="${i}">ЗАБРАТЬ</button>`
        }
      </div>
    `;

    rewardsTrack.appendChild(card);
  }

  updateProgressUI();
}

function getTitleByLevel(i){
  const titles = [
    "Новичок","Работяга","Микро-блогер","Крепкий орех",
    "Стабильный","Уверенный","Сильный","Профи",
    "Лидер","Топ","Мастер","Легенда"
  ];
  return titles[i-1] || `Уровень ${i}`;
}

function updateProgressUI() {
  progressTxt.textContent = `${currentLevel}/${maxLevel}`;
  const pct = Math.max(0, Math.min(100, (currentLevel / maxLevel) * 100));
  progressBar.style.width = `${pct}%`;
}

// Делает прогресс “живым” при скролле ленты
rewardsTrack.addEventListener("scroll", () => {
  // вычисляем ближайшую карточку слева как "текущий просмотр"
  const cards = [...rewardsTrack.children];
  if (!cards.length) return;

  const left = rewardsTrack.scrollLeft;
  let bestIdx = 0;
  let bestDist = Infinity;

  cards.forEach((c, idx) => {
    const dist = Math.abs(c.offsetLeft - left);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = idx;
    }
  });

  // обновляем текст прогресса по позиции (визуально приятно)
  const viewedLevel = bestIdx + 1;
  $("#progressTxt").textContent = `${Math.min(currentLevel, viewedLevel)}/${maxLevel}`;
}, { passive: true });

// Claim button -> sendData to bot + toast
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-claim]");
  if (!btn) return;

  const lvl = Number(btn.dataset.claim);
  haptic("light");

  const payload = JSON.stringify({ action: "claim_reward", level: lvl, ts: Date.now() });
  if (tg) tg.sendData(payload);

  showToast("Готово ✅ Заявка отправлена");
}, { passive: true });

// Init
showScreen("home", false);
renderRewards();
