import 'normalize.css'

const createFormTemplate = document.querySelector('#create-form');
const createGroupTemplate = document.querySelector('#create-group');

const columns = document.querySelectorAll('.table__date-tasks');
const tasks = document.querySelectorAll('.task');

const deleteBySelector = (selector) => {
    const prevCreate = document.querySelector(selector);

    if (prevCreate) {
        prevCreate.parentElement.removeChild(prevCreate);
    }
}

columns.forEach((column) => {
    column.addEventListener('click', (event) => {
        if (!event.target.isSameNode(column)) {
            return;
        }

        event.preventDefault();
        deleteBySelector('#create-task');
        
        const createForm = createFormTemplate.content.cloneNode(true);
        column.appendChild(createForm);
    });

    column.addEventListener('contextmenu', (event) => {
        if (!event.target.isSameNode(column)) {
            return;
        }

        event.preventDefault();
        deleteBySelector('#create-group');

        const createGroup = createGroupTemplate.content.cloneNode(true);
        column.appendChild(createGroup);
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape') {
        deleteBySelector('#create-group');
        deleteBySelector('#create-task');
    }
})

tasks.forEach((task) => {
    task.addEventListener('click', (event) => {
        event.preventDefault();
        task.classList.toggle('task--edit');
    });
});
