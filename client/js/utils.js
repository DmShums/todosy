
const LOCAL_STORAGE_CELL = 'user';

const sendAPI = async (url, method, headers = {}, body = {}) => {
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

    const request = await fetch(url, params)
    const response = await request.json();

    if (response['message']) {
        const first_number = Math.floor(request.status / 100)
        document.querySelector('.false-alert-block').classList
            .add((first_number === 2 || first_number === 1) ? 'success' : 'failure');

        document.querySelector('.false-alert-block strong').textContent = response['message'];
        document.querySelector('.false-alert-block').classList.remove("hidden");

        setInterval(() => {
            document.querySelector('.false-alert-block').classList.add("hidden");
        }, 500000000);
    }

    return [request, response];
};

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

const deleteBySelector = (selector) => {
    const prevCreate = document.querySelector(selector);

    if (prevCreate) {
        prevCreate.parentElement.removeChild(prevCreate);
    }
}

// Close false-alert-block
function closeAlertBlock(){
	document.querySelector('.false-alert-block').classList.add('.hidden');
}