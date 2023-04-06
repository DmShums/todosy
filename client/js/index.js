window.addEventListener('load', () => {
    const LOCAL_STORAGE_CELL = 'user'

    if (localStorage.getItem(LOCAL_STORAGE_CELL)) {
        window.location.replace("/calendar");
    }
});
