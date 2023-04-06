window.addEventListener('load', () => {
    if (localStorage.getItem(LOCAL_STORAGE_CELL)) {
        window.location.replace("/calendar");
    }

    const form = document.querySelector('.needs-validation')
    const pswrd = document.getElementById('password');
    const pswrd_confirm = document.getElementById('confirm-pass');

    form.addEventListener('submit', async (event) => {
        if (pswrd.value !== pswrd_confirm.value) {
            pswrd_confirm.setCustomValidity("Passwords do not match.");
        }

        if (!form.checkValidity()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const nickname = form.querySelector('#nickname').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        form.classList.add('was-validated');

        const result = await sendAPI('/register', "POST", {},{nickname, email, password});
        const response = await result.json();

        if (result.ok) {
            console.log("success")
            localStorage.setItem(LOCAL_STORAGE_CELL, response.user);
            window.location.replace("/calendar");
            return;
        }
        
        alert(response.message);
    });
});