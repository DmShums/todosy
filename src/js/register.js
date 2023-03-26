 // Fetch all the forms we want to apply custom Bootstrap validation styles to
 var forms = document.querySelectorAll('.needs-validation')

 // Loop over them and prevent submission
 Array.prototype.slice.call(forms)
     .forEach(function (form) {
     form.addEventListener('submit', function (event) {
         let pswrd = document.getElementById('pass').value
         let pswrd_confirm = document.getElementById('confirm-pass').value
         let form = document.getElementById('form')
         if (pswrd != pswrd_confirm){
             event.preventDefault()
             event.stopPropagation()
         }

         // fetch()

         form.classList.add('was-validated')
     }, false)
     })