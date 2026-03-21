var imported = document.createElement('script');
var AdsenseId = "ca-pub-6129580795478709"
var ChannelId = "6743179465"
var adFrequency = "180s";
var testAdsOn = false;

window.adsbygoogle = window.adsbygoogle || [];
const adBreak = adConfig = function(o) {adsbygoogle.push(o);}
adConfig({
    preloadAdBreaks: 'on',
    sound: 'on', // This game has sound
    onReady: () => {
        console.log("ready");
    }, // Called when API has initialised and adBreak() is ready
});
function showNextAd()
{
    console.log("showNextAd")
    adBreak({
        type: 'next', // ad shows at start of next level
        name: 'next-game',
        beforeAd: () => {            
            console.log("beforeAd")
            passBeforeAdData()
        }, // You may also want to mute thegame's sound.
        afterAd: () => {
            console.log("afterAd")
            adBreakDoneData()
        }, // resume the game flow.
        adBreakDone: (placementInfo) => {
            console.log("adBreak complete ");
            console.log(placementInfo.breakType);
            console.log(placementInfo.breakName);
            console.log(placementInfo.breakFormat);
            console.log(placementInfo.breakStatus);
        },
    });
}

function showReward()
{
    console.log("showReward")
    adBreak({
        type: 'reward', // ad shows at start of next level
        name: 'rewarded Ad',
        beforeAd: () => {            
            console.log("beforeAd")
            passBeforeAdData()
        }, // You may also want to mute thegame's sound.
        afterAd: () => {
            console.log("afterAd")
        }, // resume the game flow.
        beforeReward: (showAdFn) => {console.log("beforeReward ")+showAdFn(0)},
        adDismissed: () => {console.log("adDismissed");cancelReward()},
        adViewed: () => {console.log("adViewed");gainReward()},
        adBreakDone: (placementInfo) => {
            console.log("adBreak complete ");
            console.log(placementInfo.breakType);
            console.log(placementInfo.breakName);
            console.log(placementInfo.breakFormat);
            console.log(placementInfo.breakStatus);
            if(placementInfo.breakStatus == "frequencyCapped"){noRewardAdsAvailable()};
            if(placementInfo.breakStatus == "other"){noRewardAdsAvailable()};
        },
    });
}
function noRewardAdsAvailable()
{
    console.log("noRewardAdsAvailable")
    myGameInstance.SendMessage('Game', 'NoRewardedAdsTryLater');
}

function cancelReward()
{
    console.log("cancelReward")
    myGameInstance.SendMessage('Game', 'resumeGameRewarded');
    myGameInstance.SendMessage('Game', 'rewardAdsCanceled');
}

function gainReward()
{
    console.log("gainReward")
    myGameInstance.SendMessage('Game', 'resumeGameRewarded');
    myGameInstance.SendMessage('Game', 'rewardAdsCompleted');
}

function passBeforeAdData() 
{
    myGameInstance.SendMessage('Game', 'pauseGame');
}

function adBreakDoneData()
{
    myGameInstance.SendMessage('Game', 'resumeGame');
}

function createAFGScript()
{
    imported.setAttribute('data-ad-client', AdsenseId);
    imported.setAttribute('data-ad-channel', ChannelId);
    imported.setAttribute('data-ad-frequency-hint', adFrequency);
    if(testAdsOn == true){imported.setAttribute('data-adbreak-test', "on");}
    imported.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    imported.setAttribute("type", "text/javascript");
    imported.async = true;
    document.head.appendChild(imported);
}

createAFGScript()
