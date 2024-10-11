(function () {
  "use strict";

  const currentScript = document.currentScript;

  const dataPrefix = "data-";
  const getAttribute = currentScript.getAttribute.bind(currentScript);

  const apiUrl = new URL(currentScript.src).origin + "/api/events";

  const websiteId = getAttribute(dataPrefix + "website-id");
  const domain = getAttribute(dataPrefix + "domain");

  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function collectEventData() {
    const data = {
      websiteId,
      domain,
      href: window.location.href || null,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
    };

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    data.visitorId = visitorId;
    data.sessionId = sessionId;

    return data;
  }

  function trackPageView(callback) {
    const data = collectEventData();
    data.type = "pageview";
    sendEventData(data, callback);
  }

  function trackCustomEvent(eventType, customData, callback) {
    const data = collectEventData();
    data.type = eventType;
    data.extraData = customData;
    sendEventData(data, callback);
  }

  window.sitepulse = function (eventType, customData) {
    if (eventType === "initiate_checkout") {
      trackCustomEvent("initiate_checkout", {});
    } else if (eventType === "signup") {
      trackCustomEvent("signup", customData);
    } else if (eventType === "payment") {
      trackCustomEvent("payment", customData);
    } else {
      // console.warn("Unsupported event type:", eventType);
      trackCustomEvent("custom", { eventName: eventType, ...customData });
    }
  };

  function isExternalLink(url) {
    const currentDomain = window.location.hostname;
    const linkDomain = new URL(url, window.location.origin).hostname;
    return currentDomain !== linkDomain;
  }

  function handleLink(target) {
    if (target && target.href && isExternalLink(target.href)) {
      trackCustomEvent("external_link", {
        url: target.href,
        text: target.textContent.trim(),
      });
    } else if (target && target.href && !isExternalLink(target.href)) {
      trackCustomEvent("internal_link", {
        url: target.href,
        text: target.textContent.trim(),
      });
    }
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("a");
    handleLink(target);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target.closest("a");
      handleLink(target);
    }
  });

  function generateVisitorId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function generateSessionId() {
    return "sxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function getOrCreateVisitorId() {
    let visitorId = getCookie("sitepulse_visitor_id");
    if (!visitorId) {
      visitorId = generateVisitorId();
      setCookie("sitepulse_visitor_id", visitorId, 365); // Set cookie for 1 year
    }
    return visitorId;
  }

  function getOrCreateSessionId() {
    let sessionId = getCookie("sitepulse_session_id");
    if (!sessionId) {
      sessionId = generateSessionId();
      setCookie("sitepulse_session_id", sessionId, 1 / 48); // Set cookie for 30 minutes (1/48 of a day)
    }
    return sessionId;
  }

  function sendEventData(data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log("Event data sent successfully");
          const sessionId = getOrCreateSessionId();
          setCookie("sitepulse_session_id", sessionId, 1 / 48);
        } else {
          console.error("Error sending event data:", xhr.status);
        }
        if (callback) callback({ status: xhr.status });
      }
    };
    xhr.send(JSON.stringify(data));
  }

  if (!websiteId || !domain) {
    console.warn("Missing website ID or domain");
    return;
  }
  if (
    /^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(
      window.location.hostname
    ) ||
    window.location.protocol === "file:"
  ) {
    console.warn("Ignoring localhost or file protocol");
    return;
  }

  trackPageView();

  let currentPathname = window.location.pathname;
  const originalPushState = window.history.pushState;
  window.history.pushState = function () {
    originalPushState.apply(this, arguments);
    if (currentPathname !== window.location.pathname) {
      currentPathname = window.location.pathname;
      trackPageView();
    }
  };
  window.addEventListener("popstate", function () {
    if (currentPathname !== window.location.pathname) {
      currentPathname = window.location.pathname;
      trackPageView();
    }
  });
})();
