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

const sendAPI = async (url, method, body) => {
    return await fetch(url, {
        method,
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(body)
    });
}

columns.forEach((column) => {
    column.addEventListener('click', (event) => {
        if (!event.target.isSameNode(column)) {
            return;
        }

        event.preventDefault();
        deleteBySelector('#create-task');
        
        const createForm = createFormTemplate.content.cloneNode(true);
        createForm.querySelector('form').addEventListener('submit', async (evt) => {
            evt.preventDefault();
            const target = evt.target;
            
            const data = {
                "title": target.querySelector('#task-title').value,
                "group_id": target.querySelector('#group-select').value,
                "is_work": target.querySelector("#is_work").value === 'on',
                "start": target.querySelector("#start").value || Date.now(),
                "end_date": '111111',
                "owner": +localStorage.getItem("user"),
                "end_time": target.querySelector("#deadline").value || null,
            };

            console.log(data);
            response = await sendAPI(`/calendar/task/create`, "POST", data);

            if (Math.floor(response.status / 100) == 2) {
                deleteBySelector('#create-task');
            }
        });
        column.appendChild(createForm);
    });

    column.addEventListener('contextmenu', (event) => {
        if (!event.target.isSameNode(column)) {
            return;
        }

        event.preventDefault();
        deleteBySelector('#create-group');

        const createGroup = createGroupTemplate.content.cloneNode(true);

        createGroup.querySelector('form').addEventListener('submit', async (evt) => {
            evt.preventDefault();
            const target = evt.target;
            
            const data = {
                "title": target.querySelector('#group-title').value,
                "color": target.querySelector("#group-color").value,
                "owner": +localStorage.getItem("user"),
            };

            console.log(data);
            response = await sendAPI(`/calendar/group/create`, "POST", data);
            
            if (Math.floor(response.status / 100) == 2) {
                deleteBySelector('#create-group');
            }
        });
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
