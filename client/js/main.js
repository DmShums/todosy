Date.prototype.isSameDateAs = function (pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
}

window.addEventListener('load', () => {
    // Templates
    const createFormTemplate = document.querySelector('#create-form');
    const createGroupTemplate = document.querySelector('#create-group');

    let ACTIVE_DATE = new Date();

    // wrappers
    const columns = document.querySelectorAll('.table__date-tasks');
    const tasks = document.querySelectorAll('.task');

    // utils
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

    // set calendar
    const setUpCalendar = (active_date) => {
        const tableHeadings = document.querySelectorAll('.table__heading');
        const tableHeadingToday = document.querySelector('.table__heading--today');
        const controller = document.querySelector('.controllers__week-text');

        if (tableHeadingToday) {
            tableHeadingToday.classList.remove('table__heading--today');
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const today = new Date();
        const curr = new Date(active_date.getTime()); // get current date

        const mondayDate = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
        const sundayDate = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)); // First day is the day of the month - the day of the week

        controller.textContent = `${mondayDate.toLocaleString('default', { month: 'long', day: 'numeric' })} — `;
        controller.textContent += sundayDate.toLocaleString('default', { month: 'long', day: 'numeric' });

        tableHeadings.forEach((heading, idx) => {
            const day = new Date();
            day.setDate(mondayDate.getDate() + idx)

            heading.textContent = `${day.getDate()} ${days[idx]}`;

            if (today.isSameDateAs(day)) {
                heading.classList.add('table__heading--today');
            }
        });
    };

    setUpCalendar(ACTIVE_DATE);

    const prevWeekBtn = document.querySelector('.controllers__week-prev');
    const nextWeekBtn = document.querySelector('.controllers__week-next');
    const controller = document.querySelector('.controllers__week-text');

    controller.addEventListener('click', (event) => {
        event.preventDefault();
        ACTIVE_DATE = new Date;
        setUpCalendar(ACTIVE_DATE);
    });

    prevWeekBtn.addEventListener('click', (event) => {
        event.preventDefault();
        ACTIVE_DATE.setDate(ACTIVE_DATE.getDate() - 7);
        setUpCalendar(ACTIVE_DATE);
    });

    nextWeekBtn.addEventListener('click', (event) => {
        event.preventDefault();
        ACTIVE_DATE.setDate(ACTIVE_DATE.getDate() + 7);
        setUpCalendar(ACTIVE_DATE);
    });

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
                const response = await sendAPI(`/calendar/task/create`, "POST", data);

                if (Math.floor(response.status / 100) === 2) {
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
                const response = await sendAPI(`/calendar/group/create`, "POST", data);

                if (Math.floor(response.status / 100) === 2) {
                    deleteBySelector('#create-group');
                }
            });
            column.appendChild(createGroup);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
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
});