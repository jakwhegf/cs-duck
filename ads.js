/**
 * IMA SDK Ads Wrapper for CS Dust (Unity WebGL)
 * Ad Unit: /23136362493/Adubg
 */

(function () {
  "use strict";

  // ============== CONFIG ==============
  var AD_TAG_BASE = "https://pubads.g.doubleclick.net/gampad/ads"
    + "?iu=/23136362493/Adubg"
    + "&description_url=" + encodeURIComponent(window.location.href)
    + "&tfcd=0&npa=0"
    + "&sz=640x480"
    + "&ciu_szs=300x600%2C160x600"
    + "&gdfp_req=1"
    + "&unviewed_position_start=1"
    + "&output=vast"
    + "&env=vp"
    + "&impl=s"
    + "&correlator=";

  function getAdTagUrl() {
    return AD_TAG_BASE + Date.now();
  }

  // ============== IMA VARIABLES ==============
  var adContainer = null;
  var adDisplayContainer = null;
  var adsLoader = null;
  var adsManager = null;
  var adVideo = null;
  var adDoneCallback = null;
  var adInitialized = false;

  // ============== IMA SETUP ==============
  function initIMA() {
    if (typeof google === "undefined" || !google.ima) {
      console.warn("[Ads] IMA SDK not loaded");
      return false;
    }

    adContainer = document.getElementById("adContainer");
    adVideo = document.getElementById("adVideo");

    if (!adContainer || !adVideo) {
      console.warn("[Ads] adContainer or adVideo element not found");
      return false;
    }

    if (adsLoader) {
      adsLoader.destroy();
    }

    adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, adVideo);
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);

    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );
    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    );

    adInitialized = true;
    return true;
  }

  function requestAd() {
    if (!adInitialized && !initIMA()) {
      adDone();
      return;
    }

    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = getAdTagUrl();
    adsRequest.linearAdSlotWidth = window.innerWidth;
    adsRequest.linearAdSlotHeight = window.innerHeight;
    adsRequest.nonLinearAdSlotWidth = window.innerWidth;
    adsRequest.nonLinearAdSlotHeight = Math.floor(window.innerHeight / 3);

    try {
      adsLoader.requestAds(adsRequest);
    } catch (e) {
      console.error("[Ads] requestAds error:", e);
      adDone();
    }
  }

  function onAdsManagerLoaded(adsManagerLoadedEvent) {
    adsManager = adsManagerLoadedEvent.getAdsManager(adVideo);

    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdComplete);
    adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdComplete);
    adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, onAdComplete);

    try {
      adDisplayContainer.initialize();
      adContainer.style.display = "block";
      adsManager.init(
        window.innerWidth,
        window.innerHeight,
        google.ima.ViewMode.FULLSCREEN
      );
      adsManager.start();
    } catch (err) {
      console.error("[Ads] adsManager start error:", err);
      adDone();
    }
  }

  function onAdError(adErrorEvent) {
    console.log("[Ads] Ad error:", adErrorEvent.getError());
    adDone();
  }

  function onAdComplete() {
    adDone();
  }

  function adDone() {
    if (adsManager) {
      try { adsManager.destroy(); } catch (e) {}
      adsManager = null;
    }

    if (adContainer) {
      adContainer.style.display = "none";
    }

    adInitialized = false;

    if (typeof adDoneCallback === "function") {
      var cb = adDoneCallback;
      adDoneCallback = null;
      cb();
    }
  }

  window.addEventListener("resize", function () {
    if (adsManager) {
      try {
        adsManager.resize(
          window.innerWidth,
          window.innerHeight,
          google.ima.ViewMode.FULLSCREEN
        );
      } catch (e) {}
    }
  });

  // ============== PUBLIC API ==============
  window.AdsManager = {
    showPreroll: function (callback) {
      adDoneCallback = callback || function () {};
      initIMA();
      requestAd();
    }
  };

  // ============== UNITY GAME BRIDGE ==============
  window.showNextAd = function () {
    console.log("[Ads] showNextAd");
    passBeforeAdData();
    AdsManager.showPreroll(function () {
      adBreakDoneData();
    });
  };

  window.showReward = function () {
    console.log("[Ads] showReward");
    passBeforeAdData();
    AdsManager.showPreroll(function () {
      gainReward();
    });
  };

  window.noRewardAdsAvailable = function () {
    if (window.myGameInstance) {
      window.myGameInstance.SendMessage("Canvas", "NoRewardedAdsTryLater");
    }
  };

  window.cancelReward = function () {
    if (window.myGameInstance) {
      window.myGameInstance.SendMessage("Canvas", "resumeGameRewarded");
      window.myGameInstance.SendMessage("Canvas", "rewardAdsCanceled");
    }
  };

  window.gainReward = function () {
    if (window.myGameInstance) {
      window.myGameInstance.SendMessage("Canvas", "resumeGameRewarded");
      window.myGameInstance.SendMessage("Canvas", "rewardAdsCompleted");
    }
  };

  window.passBeforeAdData = function () {
    if (window.myGameInstance) {
      window.myGameInstance.SendMessage("Canvas", "pauseGame");
    }
  };

  window.adBreakDoneData = function () {
    if (window.myGameInstance) {
      window.myGameInstance.SendMessage("Canvas", "resumeGame");
    }
  };

})();
