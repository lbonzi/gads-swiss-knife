var dismissTranslations = {
    "en": ["Dismiss all", "Dismiss"],
    "it": ["Ignora tutto", "Ignora", "Elimina"],
    "pt-pt": ["Ignorar tudo", "Ignorar"],
    "pt-br": ["Dispensar tudo", "Dispensar"],
    "es": ["Rechazar todas", "Rechazar", "Cerrar"],
    "de": ["Alle ablehnen", "Ablehnen"],
    "fr": ["Tout supprimer", "Supprimer", "Ignorer"],
    "nl": ["Alles sluiten", "Sluiten"]
};

var menuTranslations = {
    "en": ["Overflow menu"],
    "it": ["Menu extra"],
    "pt-pt": ["Menu adicional"],
    "pt-br": ["Menu flutuante"],
    "es": ["Menú adicional"],
    "de": ["Dreipunkt-Menü"],
    "fr": ["Menu à développer"],
    "nl": ["Overloopmenu"]
};

function playMusic() {
    let audioElement = document.getElementById('backgroundMusicElement');
    if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = 'backgroundMusicElement';
        audioElement.src = chrome.runtime.getURL('audio.mp3');
        audioElement.loop = true;
        document.body.appendChild(audioElement);
    }
    audioElement.play();
}

function stopMusic() {
    const audioElement = document.getElementById('backgroundMusicElement');
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

function showFireworks() {
    const fireworksDiv = document.createElement('div');
    fireworksDiv.id = 'fireworks';
    fireworksDiv.style.position = 'fixed';
    fireworksDiv.style.top = '0';
    fireworksDiv.style.left = '0';
    fireworksDiv.style.width = '100%';
    fireworksDiv.style.height = '100%';
    fireworksDiv.style.zIndex = '9999';
    fireworksDiv.style.pointerEvents = 'none';

    const fireworksImg = document.createElement('img');
    fireworksImg.src = chrome.runtime.getURL('fireworks.gif');
    fireworksImg.style.width = '100%';
    fireworksImg.style.height = '100%';
    fireworksImg.style.objectFit = 'cover';
    fireworksImg.style.position = 'absolute';
    fireworksImg.style.top = '0';
    fireworksImg.style.left = '0';
    fireworksDiv.appendChild(fireworksImg);

    document.body.appendChild(fireworksDiv);

    setTimeout(() => {
        fireworksDiv.remove();
    }, 3500);
}

function dismissAllRecommendations() {
    console.log("Starting to dismiss all recommendations...");

    function attemptDismissal() {
        chrome.storage.local.get(['selectedLanguage', 'musicEnabled'], function(result) {
            const language = result.selectedLanguage || 'en';
            const dismissTextOptions = dismissTranslations[language] || dismissTranslations['en'];
            const menuText = menuTranslations[language] || menuTranslations['en'];

            const firstButton = Array.from(document.querySelectorAll("suggestion-card-menu material-button")).find(el => el.getAttribute('aria-label') && el.getAttribute('aria-label').includes(menuText));
            if (firstButton) {
                firstButton.click();
                console.log("First 'Overflow menu' button clicked.");

                setTimeout(() => {
                    const dismissAllButton = document.querySelector("material-list-item[debugid='dismiss-all-menu-item']");
                    if (dismissAllButton) {
                        dismissAllButton.click();
                        console.log("Dismiss All button clicked from dropdown.");

                        setTimeout(() => {
                            const confirmDismissAllButton = Array.from(document.querySelectorAll("material-button.btn-yes")).find(el =>
                                dismissTextOptions.some(text => el.textContent.trim().includes(text))
                            );
                            if (confirmDismissAllButton) {
                                confirmDismissAllButton.click();
                                console.log("Confirmed Dismiss All or Dismiss button clicked.");

                                setTimeout(attemptDismissal, 1000);
                            } else {
                                console.log("Confirm Dismiss All or Dismiss button not found.");
                                if (result.musicEnabled) {
                                    showFireworks();
                                    stopMusic();
                                }
                            }
                        }, 1000);
                    } else {
                        console.log("Dismiss All button not found in dropdown.");
                        setTimeout(attemptDismissal, 1000);
                    }
                }, 1000);
            } else {
                console.log("'Overflow menu' button not found. Stopping the process.");
                if (result.musicEnabled) {
                    showFireworks();
                    stopMusic();
                }
            }
        });
    }

    attemptDismissal();
}

function addFloatingButton() {
    const floatingButton = document.createElement('button');
    floatingButton.id = 'dismissRecommendationsFloatingButton';
    floatingButton.innerText = "Dismiss All Recommendations";
    floatingButton.style.position = 'fixed';
    floatingButton.style.bottom = '20px';
    floatingButton.style.right = '20px';
    floatingButton.style.zIndex = '10000';
    floatingButton.style.backgroundColor = '#d11317';
    floatingButton.style.color = 'white';
    floatingButton.style.border = 'none';
    floatingButton.style.padding = '10px 20px';
    floatingButton.style.borderRadius = '5px';
    floatingButton.style.cursor = 'pointer';
    floatingButton.style.fontSize = '1em';
    floatingButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    floatingButton.style.display = 'none'; // Inizialmente nascosto

    floatingButton.addEventListener('click', function() {
        showConfirmationModal();
    });

    document.body.appendChild(floatingButton);
}

function toggleFloatingButton() {
    const floatingButton = document.getElementById('dismissRecommendationsFloatingButton');
    if (window.location.href.includes("https://ads.google.com/aw/recommendations")) {
        floatingButton.style.display = 'block';
    } else {
        floatingButton.style.display = 'none';
    }
}

function monitorPageChange() {
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            toggleFloatingButton();
        }
    }).observe(document, {
        subtree: true,
        childList: true
    });
}

function showConfirmationModal() {
    const modal = document.createElement('div');
    modal.id = 'floatingModal';
    modal.style.position = 'fixed';
    modal.style.zIndex = '10001';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = 'auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.textAlign = 'center';

    const modalText = document.createElement('p');
    modalText.innerText = "This Will Dismiss ALL Recommendations, Are You Sure?";

    const confirmButton = document.createElement('button');
    confirmButton.innerText = "YES";
    confirmButton.style.backgroundColor = '#d11317';
    confirmButton.style.color = 'white';
    confirmButton.style.border = 'none';
    confirmButton.style.padding = '10px 20px';
    confirmButton.style.borderRadius = '5px';
    confirmButton.style.cursor = 'pointer';
    confirmButton.style.margin = '10px';

    const cancelButton = document.createElement('button');
    cancelButton.innerText = "NO";
    cancelButton.style.backgroundColor = '#aaa';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.margin = '10px';

    confirmButton.addEventListener('click', function() {
        chrome.storage.local.get(['musicEnabled'], function(result) {
            if (result.musicEnabled) {
                playMusic(); // Sposta la chiamata qui, così la musica parte solo dopo "YES"
            }
        });
        dismissAllRecommendations();
        modal.remove();
    });

    cancelButton.addEventListener('click', function() {
        modal.remove();
    });

    modalContent.appendChild(modalText);
    modalContent.appendChild(confirmButton);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

addFloatingButton();
monitorPageChange();
toggleFloatingButton();
dismissAllRecommendations();
