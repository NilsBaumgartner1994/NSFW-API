/**
 * A simple DateHelper
 * TODO: Use momentum.js for a better Date Formater
 */
export default class DateHelper {

    /**
     * Calculates the difference in seconds of two dates
     * @param newerDate The newer date
     * @param olderDate The older date
     * @returns {number} new-old; Negative seconds
     */
    static diff_seconds(newerDate, olderDate) {
        let diff = (newerDate.getTime() - olderDate.getTime()) / 1000;
        return diff;
    }

    /**
     * Calculates the absolute minute difference betweeen two dates
     * @param dateA A date
     * @param dateB A date
     * @returns {number}
     */
    static diff_minutes_abs(dateA, dateB) {
        let diff = DateHelper.diff_seconds(dateA, dateB);
        diff /= 60;
        return Math.abs(Math.round(diff));
    }

    /**
     * Rounds a Date down to the next milli seconds
     * @param date The date
     * @param ms the milli seconds we want to round (1000 will round to seconds)
     * @returns {Date} The rounded date
     */
    static roundDownToNextMilliSeconds(date, ms) {
        return new Date(Math.round(date.getTime() / ms) * ms);
    }

    /**
     * Rounds a Date up to the next milli seconds
     * @param date The date
     * @param ms the milli seconds we want to round (1000 will round to seconds)
     * @returns {Date} The rounded date
     */
    static roundUpToNextMilliSeconds(date, ms) {
        return new Date(Math.ceil(date.getTime() / ms) * ms);
    }

    /**
     * Adds Hours to a Date
     * @param date The date we want to add hours
     * @param hours the amount of hours to be added
     * @returns {Date} The new date with added hours
     */
    static addHoursToDate(date, hours) {
        let newDate = new Date(date);
        newDate.setTime(newDate.getTime() + (hours * 60 * 60 * 1000));
        return newDate;
    }

    /**
     * Formats a Date to YearMonthDayHoursMinutesSeconds
     * @param day The Date
     * @returns {string} YYYYMMDDHHSS
     */
    static dateToYYYYMMDDHHMMSS(day) {
        let today = day;
        let dd = today.getDate();
        let mm = today.getMonth() + 1; //January is 0!

        let hours = day.getHours();
        let minutes = day.getMinutes();
        let seconds = day.getSeconds();

        let yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return yyyy + '' + mm + '' + dd + "" + hours + "" + minutes + "" + seconds;
    }

    /**
     * Adds leading Zeros
     * @param num
     * @param size
     * @returns {string}
     */
    static pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    /**
     * Validates given Parameters for a Date and returns the date if valid
     * @param day the day
     * @param month the month
     * @param year the year
     * @returns {null|Date}
     */
    static validateAndFormatDate(day, month, year) {
        let composedDate = new Date(year + "/" + month + "/" + day); // create a date and maybe it works
	let dayAsNumber = parseInt(day);
	let monthAsNumber = parseInt(month);
	let yearAsNumber = parseInt(year);

	if(isNaN(dayAsNumber) || isNaN(monthAsNumber) || isNaN(yearAsNumber)){
	    return null;
	}

        let valid_date = composedDate.getDate() === dayAsNumber &&
            composedDate.getMonth() === (monthAsNumber - 1) && //but then at checking again
            composedDate.getFullYear() === yearAsNumber;
        if (valid_date) { //we can see if that was a real date
            return composedDate;
        } else {
            return null;
        }
    }

}
