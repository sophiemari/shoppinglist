const input = document.getElementById("items");
const ul = document.getElementById("shoppinglist");
const button = document.getElementById("add-button");

const deleteButton = document.getElementsByClassName("delete");
const divInstall = document.getElementById("installContainer");
const butInstall = document.getElementById("butInstall");
const pushButton = document.querySelector(".js-push-btn");
let items = [];
const applicationServerPublicKey =
  "BMSfBQCwZbyLsdRAqAJD9keL8752MQk7il9scfp7thj8WUZBeVTh61zu37ncx2gazMNVx2q6v6QK-Jd9j94wUH4";

//hide installButton in installed app
if (
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true
) {
  divInstall.style.display = "none";
}

window.addEventListener("beforeinstallprompt", (event) => {
  window.deferredPrompt = event;
  divInstall.style.display = "block";
});

butInstall.addEventListener("click", () => {
  const promptEvent = window.deferredPrompt;
  if (!promptEvent) {
    alert("Can't install the app to your homescreen :(");
    divInstall.style.display = "none";
    return;
  }

  promptEvent.prompt();

  promptEvent.userChoice.then((result) => {
    window.deferredPrompt = null;
    divInstall.style.display = "none";
  });
});

window.addEventListener("appinstalled", (event) => {
  divInstall.style.display = "none";
});

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ("PushManager" in window) {
  console.log("Push is supported");
} else {
  console.warn("Push messaging is not supported");
  pushButton.textContent = "Push Not Supported";
}

function initializeUI() {
  pushButton.addEventListener("click", function () {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  swRegistration.pushManager.getSubscription().then(function (subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log("User IS subscribed.");
    } else {
      console.log("User is NOT subscribed.");
    }

    updateBtn();
  });
}

navigator.serviceWorker.register("sw.js").then(function (swReg) {
  console.log("Service Worker is registered", swReg);

  swRegistration = swReg;
  initializeUI();
});

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription) {
      console.log("User is subscribed.");

      isSubscribed = true;

      updateBtn();
    })
    .catch(function (err) {
      console.log("Failed to subscribe the user: ", err);
      updateBtn();
    });
}

function updateBtn() {
  if (Notification.permission === "denied") {
    pushButton.textContent = "Push Messaging Blocked.";
    pushButton.disabled = true;
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = "Disable Push Messaging";
  } else {
    pushButton.textContent = "Enable Push Messaging";
  }

  pushButton.disabled = false;
}

function unsubscribeUser() {
  swRegistration.pushManager
    .getSubscription()
    .then(function (subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function (error) {
      console.log("Error unsubscribing", error);
    })
    .then(function () {
      console.log("User is unsubscribed.");
      isSubscribed = false;

      updateBtn();
    });
}

function createNode(element) {
  return document.createElement(element);
}

function append(parent, element) {
  return parent.appendChild(element);
}

const getItems = () => {
  if (localStorage.getItem("listItems") == null) {
    items = [];
  } else {
    items = JSON.parse(localStorage.getItem("listItems"));
  }
  return items;
};

button.onclick = (ev) => {
  ev.preventDefault();
  let text = input.value;
  console.log(text);
  if (text !== "") {
    items.push(text);

    localStorage.setItem("listItems", JSON.stringify(items));

    input.value = "";
    let li = createNode("li");
    let div = createNode("div");

    li.className = "collection-item";
    li.id = text;

    div.innerHTML = text;

    append(li, div);
    append(ul, li);
    if (isSubscribed) {
      const notification = new Notification("Item added to list", {
        body: text,
        icon: "../images/icons/icon-192x192.png",
      });
    }
  }
};

const createList = (items) => {
  items.forEach((item) => {
    console.log(item);
    let li = createNode("li");
    let div = createNode("div");

    li.className = "collection-item";
    li.id = item;

    div.innerHTML = item;
    append(li, div);
    append(ul, li);
  });
};

console.log("items", items);
window.addEventListener("load", function () {
  createList(getItems());
});

ul.addEventListener("click", function (e) {
  let items = getItems();
  let result;
  if (e.target && e.target.nodeName == "LI") {
    result = items.filter((item) => item != e.target.id);
  }
  if (e.target && e.target.nodeName == "DIV") {
    result = items.filter((item) => item != e.srcElement.parentElement.id);
  }

  console.log("ID", typeof sourceid);
  console.log("res", result);
  items = result;
  localStorage.setItem("listItems", JSON.stringify(items));
  ul.innerHTML = "";
  createList(getItems());
});
