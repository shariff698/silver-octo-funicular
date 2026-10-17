/* ============ CONFIG: EDIT THIS SECTION ============ */
const TILL_NUMBER = "123456"; // your real Till Number

const PLANS = [
  { id: "day",   label: "1 day",   price: 50  },
  { id: "week",  label: "7 days",  price: 200 },
  { id: "month", label: "30 days", price: 500 }
];

const CATEGORIES = ["All", "Videos", "Photos", "Popular", "New"];

/* Add your own items. Put files in /media and point to them here.
   t = title, c = category, d = label (duration or photo count),
   free = true shows without payment,
   thumb = preview image path (optional),
   src = full video (.mp4/.webm) or image path,
   g = fallback gradient colours if there is no thumb. */
const ITEMS = [
  { t: "Item 1", c: "Videos",  d: "12:40",     free: true,  thumb: "", src: "media/video1.mp4", g: ["#7a1f4a", "#2a0f20"] },
  { t: "Item 2", c: "Videos",  d: "18:05",     free: false, thumb: "", src: "media/video2.mp4", g: ["#a3294f", "#1a0a13"] },
  { t: "Item 3", c: "Photos",  d: "24 photos", free: true,  thumb: "", src: "media/photo1.jpg", g: ["#5c2a6e", "#1b0b22"] },
  { t: "Item 4", c: "Videos",  d: "22:10",     free: false, thumb: "", src: "media/video3.mp4", g: ["#c2503a", "#2a0f20"] },
  { t: "Item 5", c: "Photos",  d: "36 photos", free: false, thumb: "", src: "media/photo2.jpg", g: ["#b9822f", "#2a1810"] },
  { t: "Item 6", c: "Popular", d: "31:20",     free: false, thumb: "", src: "media/video4.mp4", g: ["#6a2f8a", "#14070f"] },
  { t: "Item 7", c: "New",     d: "15:33",     free: false, thumb: "", src: "media/video5.mp4", g: ["#d1385f", "#1f0d18"] }
];
/* ================================================== */

const $ = s => document.querySelector(s);
let premium = false, plan = PLANS[1], cat = "All";

try { premium = localStorage.getItem("velvet_premium") === "1"; } catch (e) {}
try { if (sessionStorage.getItem("velvet_age") === "1") $("#age").classList.remove("open"); } catch (e) {}

$("#ageYes").onclick = () => {
  $("#age").classList.remove("open");
  try { sessionStorage.setItem("velvet_age", "1"); } catch (e) {}
};
$("#ageNo").onclick = () => { location.href = "https://www.google.com"; };

function renderTabs() {
  $("#tabs").innerHTML = "";
  CATEGORIES.forEach(c => {
    const b = document.createElement("button");
    b.className = "tab";
    b.textContent = c;
    b.setAttribute("aria-pressed", c === cat);
    b.onclick = () => { cat = c; renderTabs(); renderGrid(); };
    $("#tabs").appendChild(b);
  });
}

function renderGrid() {
  $("#grid").innerHTML = "";
  ITEMS.filter(i => cat === "All" || i.c === cat).forEach(i => {
    const open = i.free || premium;
    const bg = i.thumb
      ? `url('${i.thumb}')`
      : `linear-gradient(135deg,${i.g[0]},${i.g[1]})`;
    const b = document.createElement("button");
    b.className = "card" + (open ? "" : " locked");
    b.setAttribute("aria-label", i.t + (open ? "" : " (locked)"));
    b.innerHTML = `
      <div class="thumb" style="background-image:${bg}">${open ? '<div class="play">▶</div>' : ""}</div>
      ${open ? (i.free && !premium ? '<span class="free-tag">Free</span>' : "") : '<span class="lock">🔒 Premium</span>'}
      <div class="meta"><h3>${i.t}</h3><span>${i.c} · ${i.d}</span></div>`;
    b.onclick = () => (open ? openViewer(i) : openPay());
    $("#grid").appendChild(b);
  });
  $("#status").hidden = !premium;
  $("#openPay").hidden = premium;
  document.querySelector(".banner").hidden = premium;
}

function openViewer(i) {
  $("#viewT").textContent = i.t;
  const isVideo = /\.(mp4|webm|ogg)$/i.test(i.src);
  $("#player").innerHTML = isVideo
    ? `<video controls playsinline src="${i.src}"></video>`
    : `<img src="${i.src}" alt="${i.t}">`;
  $("#view").classList.add("open");
}
$("#viewClose").onclick = () => {
  $("#player").innerHTML = "";
  $("#view").classList.remove("open");
};

function renderPlans() {
  $("#plans").innerHTML = "";
  PLANS.forEach(p => {
    const b = document.createElement("button");
    b.className = "plan";
    b.setAttribute("aria-pressed", p.id === plan.id);
    b.innerHTML = `<span>${p.label}</span><strong>KES ${p.price}</strong>`;
    b.onclick = () => { plan = p; renderPlans(); };
    $("#plans").appendChild(b);
  });
  $("#amt").textContent = "KES " + plan.price;
}

function openPay() {
  $("#err").textContent = "";
  $("#code").value = "";
  renderPlans();
  $("#pay").classList.add("open");
}
document.querySelectorAll("[data-pay]").forEach(b => (b.onclick = openPay));
$("#openPay").onclick = openPay;
$("#payClose").onclick = () => $("#pay").classList.remove("open");
$("#tillNo").textContent = TILL_NUMBER;

$("#copyTill").onclick = async () => {
  try {
    await navigator.clipboard.writeText(TILL_NUMBER);
    $("#copyTill").textContent = "Copied";
    setTimeout(() => ($("#copyTill").textContent = "Copy"), 1500);
  } catch (e) {}
};

$("#confirm").onclick = async () => {
  const code = $("#code").value.trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(code)) {
    $("#err").textContent = "Enter the 10-character code from your M-Pesa SMS.";
    return;
  }
  $("#err").textContent = "Checking payment…";

  /* TODO: replace the demo line below with a real server check.
     Your backend should confirm the code through Safaricom Daraja,
     check the amount matches the plan, and reject reused codes.

     const r = await fetch("https://YOUR-SERVER/api/verify", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ code, planId: plan.id })
     });
     const { ok } = await r.json();
  */
  const ok = true; // DEMO ONLY: unlocks for any valid-looking code

  if (!ok) {
    $("#err").textContent = "We could not find that payment. Check the code and amount.";
    return;
  }
  premium = true;
  try { localStorage.setItem("velvet_premium", "1"); } catch (e) {}
  $("#pay").classList.remove("open");
  renderGrid();
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2500);
};

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    $("#pay").classList.remove("open");
    $("#view").classList.remove("open");
  }
});

renderTabs();
renderGrid();
