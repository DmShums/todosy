const loginForm = document.querySelector('#login');
const syncBtn = document.querySelector('.sync__wrapper');

// // Retrieve the color from storage and update the button's style and value
const token = localStorage.getItem('user')

if (token) {
  loginForm.classList.add('hidden');
  syncBtn.classList.remove('hidden');
} else {
  loginForm.classList.remove('hidden');
  syncBtn.classList.add('hidden');
}


loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;

  const email = form.querySelector("#email").value;
  const password = form.querySelector("#password").value;

  const result = await fetch('https://todosy.pythonanywhere.com/login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, Content-Type, Accept"

    },
    body: JSON.stringify({email, password})
  });

  if (result.ok) {
    const response = await result.json();
    const token = response.user;

    localStorage.setItem('user', token)


    loginForm.classList.add('hidden');
    syncBtn.classList.remove('hidden');

    return;
  }

  const response = await result.json();

  alert(response.message);
});

syncBtn.addEventListener('click', async (event) => {
  const token = localStorage.getItem('user');

  const tabs = await chrome.tabs.query({active: true, currentWindow: true})
  const tab = tabs[0]

  // Use the Scripting API to execute a script
  await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    args: [token, tab.url],
    func: async (token, activeUrl) => {
      if (!activeUrl.startsWith("https://cms.ucu.edu.ua/my")) return;

      const result = await fetch('https://todosy.pythonanywhere.com/moodle/parse', {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Origin, Content-Type, Accept"
        },
        body: JSON.stringify({text: document.body.innerHTML})
      });

      if (result.status === 201) {
        alert("Success");
      }
    }
  });
});