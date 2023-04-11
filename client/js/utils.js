
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

    if ((request.status).toString()[0] !== '2'){
        document.querySelector('.false-alert-block').style = "display: flex;justify-content: space-between;align-items: center;"
    }

    return request;
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