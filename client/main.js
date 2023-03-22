/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {


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

const sendAPI = (url, method, body) => {
    return fetch(url, {
        method,
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(body)
    }).then((response) => response.json())
}

columns.forEach((column) => {
    column.addEventListener('click', (event) => {
        if (!event.target.isSameNode(column)) {
            return;
        }

        event.preventDefault();
        deleteBySelector('#create-task');
        
        const createForm = createFormTemplate.content.cloneNode(true);
        createForm.querySelector('form').addEventListener('submit', (evt) => {
            evt.preventDefault();
            const target = evt.target;
            
            const data = {
                "title": target.querySelector('#task-title').value,
                "group_id": target.querySelector('#group-select').value,
                "is_work": target.querySelector("#is_work").value === 'on',
                "start": target.querySelector("#start").value || Date.now(),
                "end_date": '111111',
                "end_time": target.querySelector("#deadline").value || null,
            };

            console.log(data)
            console.log(sendAPI(`/calendar/create`, "POST", data))
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

})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// extracted by mini-css-extract-plugin

})();

/******/ })()
;