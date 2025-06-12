/**
 * @file ./tasks/utils/get-date-iso.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T15:12:17.303+02:00
 * @description Pomocnicze,wyświetla aktualny czas.
 */
const date = new Date();

const offset = -date.getTimezoneOffset(); // w minutach, np. -120 → 120
const sign = offset >= 0 ? '+' : '-';
const absOffset = Math.abs(offset);
const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
const minutes = String(absOffset % 60).padStart(2, '0');

const iso = date.toISOString().replace('Z', `${sign}${hours}:${minutes}`);

console.log(iso);
