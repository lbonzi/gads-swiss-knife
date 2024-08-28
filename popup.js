document.addEventListener('DOMContentLoaded', function() {
    const dismissRecommendationsButton = document.getElementById('dismissRecommendationsButton');
    const musicSwitch = document.getElementById('musicSwitch');
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Verifica che tutti gli elementi siano presenti nel DOM
    if (!dismissRecommendationsButton || !musicSwitch || !backgroundMusic) {
        console.error('One or more elements are missing.');
        return; // Non procedere se manca qualche elemento
    }

    chrome.storage.local.get(['selectedLanguage', 'musicEnabled'], function(result) {
        languageSelect.value = result.selectedLanguage || 'en';
        musicSwitch.checked = result.musicEnabled || false;
    });

    languageSelect.addEventListener('change', function() {
        chrome.storage.local.set({selectedLanguage: languageSelect.value});
    });

    musicSwitch.addEventListener('change', function() {
        chrome.storage.local.set({musicEnabled: musicSwitch.checked});
    });

    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];
    const confirmButton = document.getElementById('confirmDismiss');
    const cancelButton = document.getElementById('cancelDismiss');

    dismissRecommendationsButton.addEventListener('click', function() {
        modal.style.display = "block";
    });

    confirmButton.addEventListener('click', function() {
        chrome.storage.local.get(['musicEnabled'], function(result) {
            if (result.musicEnabled) {
                backgroundMusic.play();
            }
        });

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                files: ['dismiss_recommendations.js']
            });
        });
        modal.style.display = "none";
    });

    cancelButton.addEventListener('click', function() {
        modal.style.display = "none";
    });

    span.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "playMusic" || request.action === "stopMusic") {
        // Non fare nulla qui, la logica è stata spostata in background.js
    }
});