interface MyObject {
  created_at?: Date;
  updated_at?: Date;
  // outras propriedades do objeto
}

interface GroupedObject {
  date: string;
  content: MyObject[];
  count: number;
}

const DEFAULT_TIME_INTERVAL = 15 * 60 * 1000; // 15 minutos em milissegundos
export enum TimeInterval {
  SECOND = 1000,
  MINUTE = 60 * 1000,
  HOUR = 60 * 60 * 1000,
  DAY = 24 * 60 * 60 * 1000,
  WEEK = 7 * 24 * 60 * 60 * 1000,
  BIMONTH = 2 * 30 * 24 * 60 * 60 * 1000,
  MONTH = 30 * 24 * 60 * 60 * 1000, // Um mês em milissegundos (aproximadamente)
  TRIMESTER = 3 * 30 * 24 * 60 * 60 * 1000,
  SEMESTER = 6 * 30 * 24 * 60 * 60 * 1000,
  YEAR = 365 * 24 * 60 * 60 * 1000,
}

export function groupObjectsByDate(objects: MyObject[], timeInterval: number = DEFAULT_TIME_INTERVAL): GroupedObject[] {

  console.log('time: ', objects )
  const groupedObjects = new Map<string, GroupedObject>();
  // Agrupar objetos pela data de criação ou atualização
  objects.forEach((obj) => {
    let dateProperty: Date | undefined;

    if (obj.created_at) {
      dateProperty = new Date(obj.created_at);
    } else if (obj.updated_at) {
      dateProperty = new Date(obj.updated_at);
    }

    if (dateProperty) {
      const dateString = getDateStringRelative(dateProperty, timeInterval);

      if (!groupedObjects.has(dateString)) {
        groupedObjects.set(dateString, { date: dateString, content: [], count: 0 });
      }

      const group = groupedObjects.get(dateString)!;
      group.content.push(obj);
      group.count += 1;
    }
  });

  // Converter o Map em um array de objetos
  const result = Array.from(groupedObjects.values());

  return result;
}

function getDateStringRelative(date: Date, timeInterval: TimeInterval): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (timeInterval === TimeInterval.SECOND) {
    const secondsAgo = Math.floor(diff / timeInterval);
    return secondsAgo === 0 ? 'now' : `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`;
  } else if (timeInterval === TimeInterval.MINUTE) {
    const minutesAgo = Math.floor(diff / timeInterval);
    return minutesAgo === 0 ? 'now' : `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
  } else if (timeInterval === TimeInterval.HOUR) {
    const hoursAgo = Math.floor(diff / timeInterval);
    return hoursAgo === 0 ? 'now' : `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
  } else if (timeInterval === TimeInterval.DAY) {
    const daysAgo = Math.floor(diff / timeInterval);
    return getDayString(daysAgo);
  } else if (timeInterval === TimeInterval.WEEK) {
    const weeksAgo = Math.floor(diff / timeInterval);
    return weeksAgo === 0 ? 'this week' : (weeksAgo === 1 ? 'last week' : `${weeksAgo} weeks ago`);
  } else if (timeInterval === TimeInterval.BIMONTH) {
    const bimonthsAgo = Math.floor(diff / timeInterval);
    return bimonthsAgo === 0 ? 'this two months' : (bimonthsAgo === 1 ? 'last two months' : `${bimonthsAgo} two months ago`);
  } else if (timeInterval === TimeInterval.MONTH) {
    const monthsAgo = Math.floor(diff / timeInterval);
    return monthsAgo === 0 ? 'this month' : (monthsAgo === 1 ? 'last month' : `${monthsAgo} months ago`);
  } else if (timeInterval === TimeInterval.TRIMESTER) {
    const trimestersAgo = Math.floor(diff / timeInterval);
    return trimestersAgo === 0 ? 'this quarter' : (trimestersAgo === 1 ? 'last quarter' : `${trimestersAgo} quarters ago`);
  } else if (timeInterval === TimeInterval.SEMESTER) {
    const semestersAgo = Math.floor(diff / timeInterval);
    return semestersAgo === 0 ? 'this semester' : (semestersAgo === 1 ? 'last semester' : `${semestersAgo} semesters ago`);
  } else if (timeInterval === TimeInterval.YEAR) {
    const currentYear = now.getFullYear();
    const objYear = date.getFullYear();

    if (currentYear === objYear) {
      return 'this year';
    } else {
      const yearsAgo = Math.floor(diff / timeInterval);
      return yearsAgo === 1 ? 'last year' : `${yearsAgo} years ago`;
    }
  } else {
    return 'more than a year ago';
  }
}

function getDayString(daysAgo: number): string {
  if (daysAgo === 0) {
    return 'today';
  } else if (daysAgo === 1) {
    return 'yesterday';
  } else {
    return `${daysAgo} days ago`;
  }
}