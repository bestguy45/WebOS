    function updateTime() {
  const timeText = document.querySelector("#time");
  if (timeText) {
    timeText.innerHTML = new Date().toLocaleString();
  }
}

setInterval(updateTime, 1000);
updateTime();

function clampWindowToViewport(element) {
  if (!element) return;

  const padding = 16;
  const maxLeft = Math.max(padding, window.innerWidth - element.offsetWidth - padding);
  const maxTop = Math.max(padding, window.innerHeight - element.offsetHeight - padding);
  const currentLeft = Number.parseFloat(element.style.left) || 0;
  const currentTop = Number.parseFloat(element.style.top) || 0;

  element.style.left = `${Math.min(Math.max(currentLeft, padding), maxLeft)}px`;
  element.style.top = `${Math.min(Math.max(currentTop, padding), maxTop)}px`;
  element.style.right = "auto";
  element.style.bottom = "auto";
}

function positionWindow(element) {
  if (!element) return;

  element.style.right = "auto";
  element.style.bottom = "auto";

  if (!element.style.left && !element.style.top) {
    element.style.left = `${Math.max(16, (window.innerWidth - element.offsetWidth) / 2)}px`;
    element.style.top = `${Math.max(16, (window.innerHeight - element.offsetHeight) / 2)}px`;
  }

  clampWindowToViewport(element);
}

function dragElement(element) {
  if (!element) return;

  let initialX = 0;
  let initialY = 0;
  let currentX = 0;
  let currentY = 0;

  const header = document.getElementById(`${element.id}header`);
  const dragHandle = header || element;

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = dragElementHandler;
  }

  function dragElementHandler(e) {
    e = e || window.event;
    e.preventDefault();

    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;

    element.style.top = `${element.offsetTop - currentY}px`;
    element.style.left = `${element.offsetLeft - currentX}px`;
    clampWindowToViewport(element);
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  dragHandle.onmousedown = startDragging;
}

document.querySelectorAll(".window").forEach((windowElement) => {
  dragElement(windowElement);
  positionWindow(windowElement);
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".window").forEach((windowElement) => clampWindowToViewport(windowElement));
});

const welcomeScreen = document.getElementById("welcome");
const notesScreen = document.getElementById("notes");
const notesEditor = document.getElementById("notesEditor");
const appIcons = document.querySelectorAll(".app-icon");
const NOTES_STORAGE_KEY = "woylieos-notes";
let selectedIcon = null;

function setWindowVisibility(element, isVisible) {
  if (!element) return;

  element.style.display = isVisible ? "flex" : "none";
  element.classList.toggle("is-open", isVisible);

  if (isVisible && element.id === "notes" && notesEditor) {
    notesEditor.focus();
  }
}

function openWindow(element) {
  setWindowVisibility(element, true);
}

function closeWindow(element) {
  setWindowVisibility(element, false);
}

function toggleWindow(element) {
  if (!element) return;
  const shouldOpen = !element.classList.contains("is-open");
  setWindowVisibility(element, shouldOpen);
}

function clearSelection() {
  appIcons.forEach((icon) => icon.classList.remove("selected"));
}

function selectIcon(icon) {
  if (!icon) return;
  clearSelection();
  icon.classList.add("selected");
  selectedIcon = icon;
}

function deselectIcon(icon) {
  if (!icon) return;
  icon.classList.remove("selected");
  if (selectedIcon === icon) {
    selectedIcon = null;
  }
}

function activateApp(icon) {
  if (!icon) return;

  const targetWindowId = icon.dataset.windowTarget;
  const targetWindow = targetWindowId ? document.getElementById(targetWindowId) : null;

  if (selectedIcon && selectedIcon !== icon) {
    const previousWindowId = selectedIcon.dataset.windowTarget;
    const previousWindow = previousWindowId ? document.getElementById(previousWindowId) : null;
    closeWindow(previousWindow);
    deselectIcon(selectedIcon);
  }

  if (selectedIcon === icon) {
    closeWindow(targetWindow);
    deselectIcon(icon);
    return;
  }

  selectIcon(icon);
  openWindow(targetWindow);
}

function loadNotes() {
  if (!notesEditor) return;

  const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  notesEditor.value = savedNotes || "Write your notes here...";
}

function saveNotes() {
  if (!notesEditor) return;

  localStorage.setItem(NOTES_STORAGE_KEY, notesEditor.value);
}

notesEditor?.addEventListener("input", saveNotes);
loadNotes();

appIcons.forEach((icon) => {
  icon.addEventListener("click", () => activateApp(icon));
});

document.querySelectorAll("[data-window-close-target]").forEach((closeButton) => {
  const targetWindowId = closeButton.dataset.windowCloseTarget;
  const targetWindow = document.getElementById(targetWindowId);

  closeButton.addEventListener("click", () => {
    closeWindow(targetWindow);
    const matchingIcon = document.querySelector(`.app-icon[data-window-target="${targetWindowId}"]`);
    if (matchingIcon && selectedIcon === matchingIcon) {
      deselectIcon(matchingIcon);
    }
  });
});

document.querySelectorAll("[data-window-open-target]").forEach((trigger) => {
  const targetWindowId = trigger.dataset.windowOpenTarget;
  const targetWindow = document.getElementById(targetWindowId);

  trigger.addEventListener("click", () => {
    const matchingIcon = document.querySelector(`.app-icon[data-window-target="${targetWindowId}"]`);
    if (matchingIcon) {
      activateApp(matchingIcon);
    } else {
      openWindow(targetWindow);
    }
  });
});

openWindow(welcomeScreen);
closeWindow(notesScreen);