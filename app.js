const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// ===== Tabs =====
const tabs = document.querySelectorAll(".tab");
const screens = document.querySelectorAll(".screen");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    // haptic like Telegram
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("light");

    tabs.forEach(x => x.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    screens.forEach(s => s.classList.toggle("active", s.dataset.screen === tab));
  }, { passive: true });
});

// ===== Rewards modal =====
const modal = document.getElementById("rewardsModal");
const openRewards = document.getElementById("openRewards");
const closeRewards = document.getElementById("closeRewards");

function openModal() {
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

openRewards.addEventListener("click", openModal, { passive: true });
closeRewards.addEventListener("click", closeModal, { passive: true });

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
}, { passive: true });

// ===== Claim button -> sendData to bot =====
document.getElementById("claimBtn").addEventListener("click", () => {
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");

  const payload = JSON.stringify({
    action: "claim_reward",
    level: 1,
    ts: Date.now()
  });

  if (tg) tg.sendData(payload);

  // небольшая реакция
  alert("✅ Запрос отправлен боту (sendData).");
});
