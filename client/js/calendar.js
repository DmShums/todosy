const TOKEN = localStorage.getItem(LOCAL_STORAGE_CELL)

if (!TOKEN) {
	window.location.replace("/");
}

window.addEventListener('load', async () => {
	// CONSTANTS AND VARIABLES
	// templates
	const taskTemplate = document.querySelector('#task-template');
	const createFormTemplate = document.querySelector('#create-form');
	const createGroupTemplate = document.querySelector('#create-group');

	let ACTIVE_DATE = new Date();
	let USER_GROUPS = []

	// wrappers
	const columns = document.querySelectorAll('.table__date-tasks');

	// additional functions
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

		// get date of monday by date
		const today = new Date();
		const curr = new Date(active_date.getTime()); // get current date

		const day = curr.getDay();
		const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

		const mondayDate = new Date(curr.setDate(diff));
		const sundayDate = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));

		// set previous data
		controller.textContent = `${mondayDate.toLocaleString('default', {month: 'long', day: 'numeric'})} — `;
		controller.textContent += sundayDate.toLocaleString('default', {month: 'long', day: 'numeric'});

		// set tasks for each day
		tableHeadings.forEach((heading, idx) => {
			const day = new Date(mondayDate.getTime());
			day.setDate(mondayDate.getDate() + idx)

			heading.textContent = `${day.getDate()} ${days[idx]}`;

			if (today.isSameDateAs(day)) {
				heading.classList.add('table__heading--today');
			}

			// show info on heading click
			heading.addEventListener('click', async (event) => {
				event.preventDefault();
				const curr = new Date(active_date.getTime()); // get current date

				const curr_day = curr.getDay();
				const diff = curr.getDate() - curr_day + (curr_day === 0 ? -6 : 1); // adjust when day is sunday

				const mondayDate = new Date(curr.setDate(diff));

				const day = new Date(mondayDate.getTime());
				day.setDate(mondayDate.getDate() + idx)

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

			result.query[index].forEach((task_info) => {
				const {
					id,
					title,
					end_time,
					start_time,
					is_work,
					group,
					is_done
				} = task_info;
				const task = taskTemplate.content.cloneNode(true).querySelector('.task');

				task.querySelector('.task__heading').textContent = title;
				task.querySelector('.task__heading').classList.add(is_done && 'heading--done');
				task.querySelector('.task__deadline').textContent = `Deadline: ${end_time.slice(0, 5)}`;
				task.querySelector('.task__start-time').textContent = `Start Time: ${start_time.slice(0, 5)}`;
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

				task.addEventListener('submit', async (event) => {
					event.preventDefault();
					task.classList.remove('task--edit');

					const target = event.target;
					const data = {
						"title": target.querySelector('#task-title').value,
						"group_id": target.querySelector('#group-select').value,
						"is_work": target.querySelector("#is_work").checked,
						"start": target.querySelector("#start").value,
						"end_time": target.querySelector("#deadline").value || null,
					};

					await sendAPI(`/calendar/task/edit/${id}`, "PATCH", {
						Authorization: `Bearer ${TOKEN}`
					}, data);
                    await setUpCalendar(ACTIVE_DATE);
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

				task.querySelector(".task__heading").addEventListener('click', async (event) => {
					event.stopPropagation();

					const result = await sendAPI(`/calendar/task/done/${id}`, "PATCH", {
						Authorization: `Bearer ${TOKEN}`,
					});

					if (result.status === 201) {
						await setUpCalendar(ACTIVE_DATE);
					}
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

			const start = createForm.querySelector("#start");
			const end_time_input = createForm.querySelector("#deadline");

			end_time_input.addEventListener('input', () => {
				end_time_input.setCustomValidity(
					end_time_input.value <= start.value ?
						"End time must be bigger than start." :
						""
				);
			})

			createForm.querySelector('form').addEventListener('submit', async (evt) => {
				evt.preventDefault();
				const target = evt.target;

				const current = new Date(ACTIVE_DATE.getTime()); // get current date

				const day = current.getDay();
				const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

				const end_date = new Date(current.setDate(diff + index));
				const start = evt.target.querySelector("#start").value;
				const end_time = evt.target.querySelector("#deadline").value;

				const data = {
					end_date, start, end_time,
					"title": target.querySelector('#task-title').value,
					"group_id": target.querySelector('#group-select').value,
					"is_work": target.querySelector("#is_work").checked,
				};

				const response = await sendAPI(`/calendar/task/create`, "POST", {
					Authorization: `Bearer ${TOKEN}`
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

// Info popup
function returnBackInfo(){
	document.querySelector('.info-popup').style = "display: none;"
}

function popOutWindowInfo(){
	document.querySelector('.info-popup').style = "display: block;"
}