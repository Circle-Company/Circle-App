interface TimeDifference {
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}
  
export function timeDifferenceConverter(inputDate: string): string {
    const currentDate = new Date();
    const inputDateObj = new Date(inputDate);
  
    const timeDiff = Math.abs(currentDate.getTime() - inputDateObj.getTime());
  
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
  
    if (weeks > 0) {
      return `${weeks} ${weeks === 1 ? 'sem' : 'sem'}`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? 'd' : 'd'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'h' : 'h'}`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'min' : 'min'}`;
    } else {
      return `${seconds} ${seconds === 1 ? 's' : 's'}`;
    }
}