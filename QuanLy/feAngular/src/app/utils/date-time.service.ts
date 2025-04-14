import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {

  /**
   * Convert UTC datetime string to specific timezone
   * @param dateUtc UTC date string or Date object
   * @param timeZone IANA timezone string (default: Asia/Ho_Chi_Minh)
   * @returns formatted date string 'dd/MM/yyyy HH:mm:ss'
   */
  static ConvertUtcToTimeZone(
    dateUtc: string | Date,
    timeZone: string = 'Asia/Ho_Chi_Minh'
  ): string {
    const utcDate = new Date(dateUtc);

    const localDate = new Date(utcDate.toLocaleString('vi-VN', { timeZone }));

    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(localDate.getDate());
    const month = pad(localDate.getMonth() + 1);
    const year = localDate.getFullYear();
    const hours = pad(localDate.getHours());
    const minutes = pad(localDate.getMinutes());
    const seconds = pad(localDate.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  static formatUTCToVN(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
