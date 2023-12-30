export function createCustomDate(dateString: string | Date): CustomDate {
    return new CustomDate(dateString);
  }
  
  class CustomDate {
    private date: Date;
  
    constructor(dateString: string | Date) {
      if (dateString instanceof Date) {
        this.date = dateString;
      } else {
        this.date = new Date(dateString);
      }
    }
  
    format(formatString: string = 'YYYY-MM-DD'): string {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
  
      return this.date.toLocaleString(undefined, options).replace(/[0-9]+/g, match => {
        switch (match) {
          case 'YYYY':
            return this.date.getFullYear().toString();
          case 'MM':
            return (this.date.getMonth() + 1).toString().padStart(2, '0');
          case 'DD':
            return this.date.getDate().toString().padStart(2, '0');
          case 'hh':
            return this.date.getHours().toString().padStart(2, '0');
          case 'mm':
            return this.date.getMinutes().toString().padStart(2, '0');
          case 'ss':
            return this.date.getSeconds().toString().padStart(2, '0');
          default:
            return match;
        }
      });
    }
  
    addDays(days: number): CustomDate {
      const newDate = new Date(this.date);
      newDate.setDate(this.date.getDate() + days);
      return new CustomDate(newDate);
    }
    subtractDays(days: number): CustomDate {
      return this.addDays(-days);
    }
    diffInDays(otherDate: CustomDate): number {
      const oneDay = 24 * 60 * 60 * 1000;
      const diffMilliseconds = Math.abs(this.date.getTime() - otherDate.date.getTime());
      return Math.round(diffMilliseconds / oneDay);
    }
  }
  