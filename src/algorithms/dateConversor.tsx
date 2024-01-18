interface TimeDifferenceConverterProps {
  date: string, 
  small?: boolean
}
  
export function timeDifferenceConverter({
  date,
  small = true
}: TimeDifferenceConverterProps): string {
    const currentDate = new Date();
    const inputDateObj = new Date(date);
  
    const timeDiff = Math.abs(currentDate.getTime() - inputDateObj.getTime());
  
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
  
    if (weeks > 0) {
      if(small) return `${weeks} ${weeks === 1 ? 'w' : 'w'}`;
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (days > 0) {
      if(small) return `${weeks} ${weeks === 1 ? 'd' : 'd'}`;
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours > 0) {
      if(small) return `${weeks} ${weeks === 1 ? 'h' : 'h'}`;
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
      if(small) return `${weeks} ${weeks === 1 ? 'min' : 'min'}`;
      return `${minutes} ${minutes === 1 ? 'min' : 'minutes'} ago`;
    } else {
      if(small) return `${weeks} ${weeks === 1 ? 's' : 's'}`;
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
    }
}