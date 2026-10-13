class Time{
    constructor(hours, minutes,second=0,day=0, month=0, year=0) {
        this.hours = hours;
        this.minutes = minutes;
        this.second = second;
        this.day = day;
        this.month = month;
        this.year = year;
    }
    toString() {
        return `${this.hours}:${this.minutes}`;
    }
}
export {Time};