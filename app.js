// Telegram WebApp init
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// Tabs
const tabs = document.querySelectorAll(".tab");
const screens = document.querySelectorAll(".screen");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    screens.forEach(s => s.classList.toggle("active", s.dataset.screen === tab));
  });
});

// Rewards modal
const modal = document.getElementById("rewardsModal");
const openRewards = document.getElementById("openRewards");
const closeRewards = document.getElementById("closeRewards");

openRewards.addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
});

closeRewards.addEventListener("click", () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
});

// Claim button -> sendData to bot
document.getElementById("claimBtn").addEventListener("click", () => {
  const payload = JSON.stringify({ action: "claim_reward", level: 1, ts: Date.now() });
  if (tg) tg.sendData(payload);
  alert("✅ Запрос отправлен боту (sendData).");
});
