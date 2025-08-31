// ==UserScript==
// @name         YouTube Anti Pause
// @namespace    Violentmonkey Scripts
// @version      1.0
// @author       Maxwilso
// @description  Block YouTube "Video paused. Continue watching?" popup + overlay permanently
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    console.log("YouTube Nuke Mode");

    let userPaused = false;

    function hookVideo() {
        const video = document.querySelector("video");
        if (!video) return;

        video.addEventListener("pause", () => {
            setTimeout(() => {
                // Respect end of video
                if (video.ended) {
                    console.log("Video ended, not resuming");
                    return;
                }

                // Respect user pause
                if (userPaused) {
                    console.log("⏸ User paused video (respected)");
                    return;
                }

                // Otherwise, YouTube paused — force resume
                console.log("Auto-resume (YouTube forced pause)");
                video.play().catch(()=>{});
            }, 50);
        });

        video.addEventListener("play", () => {
            userPaused = false;
        });

        // Detect manual pause via keys/clicks
        document.addEventListener("keydown", (e) => {
            if (e.code === "Space" || e.code === "KeyK") {
                userPaused = !video.paused;
            }
        });
        video.addEventListener("click", () => {
            userPaused = !video.paused;
        });

        console.log("Video hooks installed");
    }

    function nukeOverlays() {
        document.querySelectorAll("yt-confirm-dialog-renderer, tp-yt-iron-overlay-backdrop").forEach(el => el.remove());
    }

    setInterval(nukeOverlays, 2000);

    const obs = new MutationObserver(() => {
        nukeOverlays();
        hookVideo();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    hookVideo();
})();