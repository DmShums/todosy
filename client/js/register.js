window.addEventListener('load', () => {
    const LOCAL_STORAGE_CELL = 'user'

    if (localStorage.getItem(LOCAL_STORAGE_CELL)) {
        window.location.replace("/");
    }

    const form = document.querySelector('.needs-validation')
    const pswrd = document.getElementById('password');
    const pswrd_confirm = document.getElementById('confirm-pass');

    const sendAPI = async (url, method, body) => {
        return await fetch(url, {
            method,
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(body)
        });
    };

    form.addEventListener('submit', async (event) => {
        if (pswrd.value != pswrd_confirm.value) {
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

        result = await sendAPI('/register', "POST", {nickname, email, password});
        response = await result.json();

        if (result.ok) {
            localStorage.setItem(LOCAL_STORAGE_CELL, response.user);
            window.location.replace("/calendar");
            return;
        }
        
        alert(response.message);
    });
});