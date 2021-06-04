const moment = require('moment')


exports.formatDate = async function (date) {
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const year = date.getFullYear();
	const formateDate = month + '/' + day + '/' + year;
	return formateDate
}

exports.dateRange = async function (startDate, endDate) {
	let dates;
	for (dates = [], date = startDate;date < endDate;date.setDate(date.getDate() + 1)) {
		dates.push(new Date(date));
	}
	return dates;
}

exports.getMonths = (num) => {
	let months = []
	for (let i = 0;i < num;i++) {
		const date = moment().subtract(i, 'month').format('lll')
		const month = moment().subtract(i, 'month').format('MMMM')
		const startDate = moment(date).clone().startOf('month').format('YYYY-MM-DD')
		const endDate = moment(date).clone().endOf('month').format('YYYY-MM-DD')

		months = [...months, { startDate, endDate, month }]
	}
	return months;
}

exports.getPrevMonth = (number) => {
	let months = [];
	let num = number;
	if (num) {
		months = this.getMonths(number).reverse();
	} else {
		const currentMonth = new Date().getMonth() + 1
		months = this.getMonths(currentMonth).reverse();
	}
	return months;
}

