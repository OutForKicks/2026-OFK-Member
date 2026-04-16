const APP_CONFIG = {
  SEASON_LABEL: "2026 Season OFK Member",
  LOGO_PATH: "./assets/ofk-logo.png"
};

const els = {
  appView: document.getElementById("app-view"),
  verifyView: document.getElementById("verify-view"),
  firstNameInput: document.getElementById("firstNameInput"),
  surnameInput: document.getElementById("surnameInput"),
  teamNameInput: document.getElementById("teamNameInput"),
  generateBtn: document.getElementById("generateBtn"),
  resetBtn: document.getElementById("resetBtn"),
  statusMessage: document.getElementById("statusMessage"),
  memberCard: document.getElementById("memberCard"),
  memberName: document.getElementById("memberName"),
  memberTeam: document.getElementById("memberTeam"),
  previewLink: document.getElementById("previewLink"),
  qrcode: document.getElementById("qrcode"),
  verifyName: document.getElementById("verifyName"),
  verifyMembershipText: document.getElementById("verifyMembershipText"),
  verifyBadge: document.getElementById("verifyBadge"),
  verifyNote: document.getElementById("verifyNote"),
  brandLogoMain: document.getElementById("brandLogoMain"),
  brandLogoVerify: document.getElementById("brandLogoVerify")
};

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")                 // 🔥 splits accents from letters
    .replace(/[\u0300-\u036f]/g, "")  // 🔥 removes accents
    .replace(/[’']/g, "")             // remove apostrophes
    .replace(/\s+/g, "");             // remove spaces
}
function normaliseText(value) {
  return String(value || "").trim().toLowerCase();
}

function setStatus(message, type = "") {
  els.statusMessage.textContent = message;
  els.statusMessage.className = `status ${type}`.trim();
}

function clearStatus() {
  setStatus("");
}

function fullName(member) {
  return `${member.firstName} ${member.surname}`;
}

function buildMemberKey(member) {
  return encodeURIComponent(
    `${normaliseText(member.firstName)}|${normaliseText(member.surname)}|${normaliseText(member.teamName)}`
  );
}

function buildVerificationUrl(member) {
  const key = buildMemberKey(member);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?member=${key}`;
}

function findMember(firstName, surname, teamName) {
  return (
    MEMBERS.find(
      member =>
        normalize(member.firstName) === normalize(firstName) &&
        normalize(member.surname) === normalize(surname) &&
        normalize(member.teamName) === normalize(teamName)
    ) || null
  );
}

function findMemberByKey(memberKey) {
  const decoded = decodeURIComponent(memberKey || "");
  const [first, last, team] = decoded.split("|");

  return (
    MEMBERS.find(
      member =>
        normalize(member.firstName) === normalize(first) &&
        normalize(member.surname) === normalize(last) &&
        normalize(member.teamName) === normalize(team)
    ) || null
  );
}

function renderLogo(container) {
  if (!APP_CONFIG.LOGO_PATH) return;

  const img = new Image();
  img.src = APP_CONFIG.LOGO_PATH;
  img.alt = "OFK logo";

  img.onload = () => {
    container.innerHTML = "";
    container.appendChild(img);
  };
}

function renderMemberCard(member) {
  const verificationUrl = buildVerificationUrl(member);

  els.memberName.textContent = fullName(member);
  els.memberTeam.textContent = member.teamName;
  els.previewLink.href = verificationUrl;
  els.memberCard.classList.remove("hidden");
  els.qrcode.innerHTML = "";

  QRCode.toCanvas(
    verificationUrl,
    {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#153781",
        light: "#ffffff"
      }
    },
    (error, canvas) => {
      if (error) {
        setStatus("Could not generate QR code. Please try again.", "error");
        return;
      }
      els.qrcode.appendChild(canvas);
    }
  );
}

function hideMemberCard() {
  els.memberCard.classList.add("hidden");
  els.qrcode.innerHTML = "";
}

function handleGenerate() {
  clearStatus();

  const firstName = els.firstNameInput.value;
  const surname = els.surnameInput.value;
  const teamName = els.teamNameInput.value;

  if (!firstName.trim() || !surname.trim() || !teamName.trim()) {
    hideMemberCard();
    setStatus("Please enter first name, surname, and team name.", "error");
    return;
  }

  const member = findMember(firstName, surname, teamName);

  if (!member) {
    hideMemberCard();
    setStatus("No member found with that combination.", "error");
    return;
  }

  renderMemberCard(member);
  setStatus("Membership card generated successfully.", "success");
}

function handleReset() {
  els.firstNameInput.value = "";
  els.surnameInput.value = "";
  els.teamNameInput.value = "";
  hideMemberCard();
  clearStatus();
  els.firstNameInput.focus();
}

function renderVerificationPage(member) {
  els.appView.classList.add("hidden");
  els.verifyView.classList.remove("hidden");
  els.verifyName.textContent = fullName(member);
  els.verifyMembershipText.textContent = APP_CONFIG.SEASON_LABEL;
  els.verifyBadge.textContent = "Verified member";
  els.verifyNote.textContent = "This member is valid for the 2026 OFK season.";
}

function renderVerificationError() {
  els.appView.classList.add("hidden");
  els.verifyView.classList.remove("hidden");
  els.verifyName.textContent = "Member not found";
  els.verifyMembershipText.textContent = "Unable to validate";
  els.verifyBadge.textContent = "Verification failed";
  els.verifyNote.textContent = "This QR code does not match a valid member in the current list.";
}

function initRoute() {
  const params = new URLSearchParams(window.location.search);
  const memberKey = params.get("member");

  renderLogo(els.brandLogoMain);
  renderLogo(els.brandLogoVerify);

  if (memberKey) {
    const member = findMemberByKey(memberKey);
    if (member) {
      renderVerificationPage(member);
    } else {
      renderVerificationError();
    }
    return;
  }

  els.appView.classList.remove("hidden");
  els.verifyView.classList.add("hidden");
}

els.generateBtn.addEventListener("click", handleGenerate);
els.resetBtn.addEventListener("click", handleReset);

[els.firstNameInput, els.surnameInput, els.teamNameInput].forEach(input => {
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      handleGenerate();
    }
  });
});

initRoute();

// ===== DISCOUNT MODAL =====

const discountsBtn = document.getElementById("discountsBtn");
const discountModal = document.getElementById("discountModal");
const closeDiscounts = document.getElementById("closeDiscounts");

// Open modal
if (discountsBtn) {
  discountsBtn.addEventListener("click", () => {
    discountModal.classList.remove("hidden");
  });
}

// Close modal
if (closeDiscounts) {
  closeDiscounts.addEventListener("click", () => {
    discountModal.classList.add("hidden");
  });
}

// Optional: click outside to close
if (discountModal) {
  discountModal.addEventListener("click", (e) => {
    if (e.target === discountModal) {
      discountModal.classList.add("hidden");
    }
  });
}
