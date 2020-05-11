function logEvent(event) {
    console.log(event.type);
}

function updateSite(event) {
    window.applicationCache.swapCache();
}

//window.applicationCache.addEventListener('updateready', updateSite, false); //orce AutoUpdate
window.applicationCache.addEventListener('checking',logEvent,false);
window.applicationCache.addEventListener('noupdate',logEvent,false);
window.applicationCache.addEventListener('downloading',logEvent,false);
window.applicationCache.addEventListener('cached',logEvent,false);
window.applicationCache.addEventListener('updateready',logEvent,false);
window.applicationCache.addEventListener('obsolete',logEvent,false);
window.applicationCache.addEventListener('error',logEvent,false);