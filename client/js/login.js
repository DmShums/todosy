window.addEventListener('load', () => {
    if (localStorage.getItem(LOCAL_STORAGE_CELL)) {
        window.location.replace("/calendar");
    }

    const form = document.querySelector('.login')

    form.addEventListener('submit', async (event) => {
        if (!form.checkValidity()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        form.classList.add('was-validated');

        const result = await sendAPI('/login', "POST", {},{email, password});
        const response = await result.json();

        if (result.ok) {
            localStorage.setItem(LOCAL_STORAGE_CELL, response.user);
            window.location.replace("/calendar");
            return;
        }
        
        alert(response.message);
    });
});