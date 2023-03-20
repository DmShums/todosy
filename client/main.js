(()=>{
    "use strict";
    (()=>{
        const e=document.querySelector("#create-form"),
        t=document.querySelectorAll(".table__date-tasks"),
        c=document.querySelectorAll(".task");
        t.forEach((t=>{
            console.log(t.classList.value),
            t.addEventListener("click",(c=>{
                if(c.target.classList.value!=t.classList.value)
                return;
                c.preventDefault();
                const l=document.querySelector("#create-task");
                l&&l.parentElement.removeChild(l);
                const s=e.content.cloneNode(!0);
                t.appendChild(s)
            }))
        })),
        c.forEach((e=>{
            e.addEventListener("click",(t=>{
                t.preventDefault(),
                e.classList.toggle("task--edit")
            }))
        }))
    })()
})();