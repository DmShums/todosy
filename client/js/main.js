Date.prototype.isSameDateAs = function(pDate) {
	return (
		this.getFullYear() === pDate.getFullYear() &&
		this.getMonth() === pDate.getMonth() &&
		this.getDate() === pDate.getDate()
	);
}
const msToTime = (duration) => {
  let minutes = Math.floor((duration / 60) % 60);
  let hours = Math.floor((duration / (60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;

  return hours + ":" + minutes;
};

const LOCAL_STORAGE_CELL = 'user'
const TOKEN = localStorage.getItem(LOCAL_STORAGE_CELL)

if (!TOKEN) {
	window.location.replace("/");
}

window.addEventListener('load', async () => {
	// Templates
	const taskTemplate = document.querySelector('#task-template');
	const createFormTemplate = document.querySelector('#create-form');
	const createGroupTemplate = document.querySelector('#create-group');

	let ACTIVE_DATE = new Date();
	let USER_GROUPS = []

	// wrappers
	const columns = document.querySelectorAll('.table__date-tasks');

	// utils
	const deleteBySelector = (selector) => {
		const prevCreate = document.querySelector(selector);

		if (prevCreate) {
			prevCreate.parentElement.removeChild(prevCreate);
		}
	}

	const sendAPI = async (url, method, headers = {}, body = null) => {
		const params = {
			method,
			headers: {
				"Content-Type": 'application/json',
				...headers
			},
		};

		if (body && Object.keys(body).length) {
			params['body'] = JSON.stringify(body);
		}

		return await fetch(url, params);
	}

    const getGroups = async () => {
        const result = await sendAPI('/calendar/groups/get', 'GET', {
			Authorization: `Bearer ${TOKEN}`
		});

		if (result.ok) {
            USER_GROUPS = await result.json();
            USER_GROUPS = USER_GROUPS[0]
        }
    }
	const setGroups = async () => {
        await getGroups();

        const createTemplate = document.querySelector('#create-form');
        const select = createTemplate.content.querySelector("#group-select")
        select.innerHTML = "";

        const fragment = document.createDocumentFragment();

        USER_GROUPS.forEach(({
            id,
            title
        }) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = title;
            fragment.append(option);
        });

        select.appendChild(fragment);

        document.querySelectorAll('.task').forEach((item) => {
            const select = item.querySelector("#group-select");
            const selected = select.value;
            select.innerHTML = "";

            const fragment = document.createDocumentFragment();

            USER_GROUPS.forEach(({
                id,
                title
            }) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = title;
                fragment.append(option);
            });
            select.appendChild(fragment);
            select.value = selected;
        });
	};

	// set calendar
	const setUpCalendar = async (active_date) => {
		// get headers
		const tableHeadings = document.querySelectorAll('.table__heading');
		const tableHeadingToday = document.querySelector('.table__heading--today');
		const controller = document.querySelector('.controllers__week-text');

		if (tableHeadingToday) {
			tableHeadingToday.classList.remove('table__heading--today');
		}

		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

		const today = new Date();
		const curr = new Date(active_date.getTime()); // get current date

		const day = curr.getDay();
		const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

		const mondayDate = new Date(curr.setDate(diff));
		const sundayDate = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));

		controller.textContent = `${mondayDate.toLocaleString('default', {month: 'long', day: 'numeric'})} — `;
		controller.textContent += sundayDate.toLocaleString('default', {
			month: 'long',
			day: 'numeric'
		});

		tableHeadings.forEach((heading, idx) => {
			const day = new Date(mondayDate.getTime());
			day.setDate(mondayDate.getDate() + idx)

			heading.textContent = `${day.getDate()} ${days[idx]}`;

			if (today.isSameDateAs(day)) {
				heading.classList.add('table__heading--today');
			}

			heading.addEventListener('click', async (event) => {
				event.preventDefault();
				const formattedDate = day.toISOString().split('T')[0]
				const result = await sendAPI(`/calendar/day/get/${formattedDate}`, "GET", {
					Authorization: `Bearer ${TOKEN}`
				});


				if (result.ok) {
					const response = await result.json();
					const summary = document.querySelector('.summary')

					summary.querySelector('.summary__title').textContent = `${day.toLocaleDateString()} summary`;
					summary.querySelector('.summary--spent').textContent = msToTime(response.spent_time);
					summary.querySelector('.summary--working').textContent = msToTime(response.working_time);
					summary.querySelector('.summary--leisure').textContent = msToTime(response.leisure_time);

					summary.classList.remove('hidden');

					summary.querySelector('.summary__close').addEventListener('click', (event) => {
						event.preventDefault();

						const chart = Chart.getChart('summary-chart');

						if (chart) {
							chart.destroy()
						}

						summary.classList.add('hidden');
					});

					const canvas = document.getElementById('summary-chart');
					const chart = Chart.getChart('summary-chart');

					if (chart) {
						chart.destroy()
					}

					new Chart(canvas, {
						type: 'pie',
						data: {
						  datasets: [{
							labels: Object.keys(response.groups_time),
							data: Object.values(response.groups_time).map((group) => group.time),
							backgroundColor: Object.values(response.groups_time).map((group) => group.color),
							hoverOffset: 4
						  }]
						},

						options: {
							responsive: true,
							legend: {
								display: false,
							},
							plugins: {
								tooltip: {
									callbacks: {
										label: function (tooltipItem) {
											const dataset = tooltipItem.dataset;
											const index = tooltipItem.dataIndex;
											return `${dataset.labels[index]}: ${msToTime(dataset.data[index])} hours`;
										}
									}
								}
							}
						}
					});

				}
			});
		});


		// get base info
		const dayColumns = document.querySelectorAll('.table__date-tasks');
		const balanceLine = document.querySelector('.controllers__balance-line');
		const formattedDate = ACTIVE_DATE.toISOString().split('T')[0]
		const tasks = await sendAPI(`/calendar/task/get/${formattedDate}`, "GET", {
			Authorization: `Bearer ${localStorage.getItem('user')}`
		});

		const result = await tasks.json();
        await getGroups();

		dayColumns.forEach((column, index) => {
			column.innerHTML = "";

			result.query[index].forEach(({
				id,
				title,
				end_time,
				start_time,
				is_work,
				group
			}) => {
				const task = taskTemplate.content.cloneNode(true).querySelector('.task');

				task.querySelector('.task__heading').textContent = title;
				task.querySelector('.task__deadline').textContent = `Deadline: ${end_time.slice(0, 5)}`;
				task.style.backgroundColor = group.color;

				task.querySelector('.task-name').value = title;
				task.querySelector('#deadline').value = end_time.slice(0, 5);
				task.querySelector('#start').value = start_time.slice(0, 5);
				task.querySelector('#is_work').checked = is_work;

				task.querySelector('.task-delete').addEventListener('click', async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await sendAPI(`/calendar/task/delete/${id}`, 'DELETE', {
						Authorization: `Bearer ${TOKEN}`
					});

					await setUpCalendar(ACTIVE_DATE);
				});

				task.querySelector('.task__footer-cancel').addEventListener('click', (event) => {
					event.preventDefault();
					event.stopPropagation();
					task.classList.remove('task--edit');
				});

				task.querySelector('.task__footer-submit').addEventListener('click', async (event) => {
					event.preventDefault();
					event.stopPropagation();
					task.classList.remove('task--edit');

					const target = event.target;
					const data = {
						"title": target.querySelector('#task-title').value,
						"group_id": target.querySelector('#group-select').value,
						"is_work": target.querySelector("#is_work").checked,
						"start": target.querySelector("#start").value,
						"end_time": target.querySelector("#deadline").value || null,
					};

					await sendAPI(`/calendar/edit/${id}`, "PATCH", {
						Authorization: `Bearer ${TOKEN}`
					}, data);
				});

                const select = task.querySelector("#group-select");
                select.innerHTML = "";

                const fragment = document.createDocumentFragment();

                USER_GROUPS.forEach(({id, title}) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = title;
                    fragment.append(option);
                });
                select.appendChild(fragment);

                select.value = group.id;

				task.addEventListener('click', () => {
					task.classList.add('task--edit');
				});

				column.appendChild(task);
			});
		});

		const color2 = [44, 40, 31];
		const color1 = [231, 207, 181];
		const percentage = result.percentage;
		const w2 = 1 - percentage;
		const rgb = [Math.round(color1[0] * percentage + color2[0] * w2),
			Math.round(color1[1] * percentage + color2[1] * w2),
			Math.round(color1[2] * percentage + color2[2] * w2)
		];

		balanceLine.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		balanceLine.style.left = `${percentage * 100}%`;
	};

	await setUpCalendar(ACTIVE_DATE);
	await setGroups();

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

	columns.forEach((column, index) => {
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

				const current = new Date(ACTIVE_DATE.getTime()); // get current date

				const day = current.getDay();
				const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

				const end_date = new Date(current.setDate(diff + index));

				const start = target.querySelector("#start").value;
				const end_time_input = target.querySelector("#deadline");
				const end_time = end_time_input.value;

				if (start >= end_time) {
					end_time_input.setCustomValidity("End time must be bigger than start.");
					return;
				}

				const data = {
					end_date, start, end_time,
					"title": target.querySelector('#task-title').value,
					"group_id": target.querySelector('#group-select').value,
					"is_work": target.querySelector("#is_work").checked,
				};

				const response = await sendAPI(`/calendar/task/create`, "POST", {
					Authorization: `Bearer ${localStorage.getItem('user')}`
				}, data);

				if (Math.floor(response.status / 100) === 2) {
					deleteBySelector('#create-task');

					await setUpCalendar(ACTIVE_DATE);
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
					"color": target.querySelector("#group-color").value
				};

				const response = await sendAPI(`/calendar/group/create`, "POST", {
					Authorization: `Bearer ${localStorage.getItem('user')}`
				}, data);

				if (Math.floor(response.status / 100) === 2) {
					deleteBySelector('#create-group');
					await setGroups();
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
	});
});

// Log out pop up
function returnBack(){
	document.querySelector('.out-popup').style = "display: none;"
}

function popOutWindow(){
	document.querySelector('.out-popup').style = "display: block;"
}

function logOut(){
	localStorage.removeItem('user');
	window.location.reload();
}