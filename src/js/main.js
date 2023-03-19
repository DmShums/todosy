import 'normalize.css'

const createFormTemplate = document.querySelector('#create-form');
const columns = document.querySelectorAll('.table__date-tasks');

const tasks = document.querySelectorAll('.task');

columns.forEach((column) => {
    console.log(column.classList.value)

    column.addEventListener('click', (event) => {
        const eventClass = event.target.classList.value;

        if (eventClass != column.classList.value) {
            return;
        }

        event.preventDefault();
        const prevCreate = document.querySelector('#create-task');

        if (prevCreate) {
            prevCreate.parentElement.removeChild(prevCreate);
        }
        
        const createForm = createFormTemplate.content.cloneNode(true);
        column.appendChild(createForm);
    });
});

tasks.forEach((task) => {
    task.addEventListener('click', (event) => {
        event.preventDefault();
        task.classList.toggle('task--edit');
    });
});