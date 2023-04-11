window.addEventListener('load', () => {
    if (localStorage.getItem(LOCAL_STORAGE_CELL)) {
        window.location.replace("/calendar");
    }

    const form = document.querySelector('.needs-validation')
    const pswrd = document.getElementById('password');
    const pswrd_confirm = document.getElementById('confirm-pass');

    pswrd_confirm.addEventListener('input', (event) => {
        pswrd_confirm.setCustomValidity(
            pswrd.value !== pswrd_confirm.value ?
                "Passwords do not match." :
                ""
        );
    })

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const nickname = form.querySelector('#nickname').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        form.classList.add('was-validated');

        const [result, response] = await sendAPI('/register', "POST", {},{nickname, email, password});

        if (result.ok) {
            console.log("success")
            localStorage.setItem(LOCAL_STORAGE_CELL, response.user);
            window.location.replace("/calendar");
        }
    });
});