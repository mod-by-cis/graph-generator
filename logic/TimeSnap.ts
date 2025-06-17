import "$$polyfills";
export class TimeSnap {
    // # --- GRUPA ROKU ---
    /**
     * Rok (np. 2024)
     */
    readonly Y: number;
    /**
     * Numer dnia w roku (1-366)
     */
    readonly YD: number;
    /** [
     * Ilość dni w roku,
     * Dzień tyg. 1. dnia roku,
     * Dzień tyg. ostatniego dnia roku
     * ] */
    readonly YX: [number, number, number];
    /**
     * Litera niedzielna (np. "AG" dla roku przestępnego, "F" dla zwykłego)
     */
    readonly Y7:
        | "A"
        | "B"
        | "C"
        | "D"
        | "E"
        | "F"
        | "G"
        | "AG"
        | "BA"
        | "CB"
        | "DC"
        | "ED"
        | "FE"
        | "GA";

    // # --- GRUPA MIESIĄCA ---
    /**
     * Numer miesiąca (1-12)
     */
    readonly M: number;
    /** Numer dnia w miesiącu (1-31) */
    readonly MD: number;
    /** [
     * Ilość dni w miesiącu,
     * Dzień tyg. 1. dnia miesiąca,
     * Dzień tyg. ostatniego dnia miesiąca
     * ] */
    readonly MX: [number, number, number];

    // # --- GRUPA TYGODNIA ---
    /**
     * Numer tygodnia w roku wg ISO 8601 (1-53)
     */
    readonly W: number;
    /**
     * Numer dnia tygodnia (poniedziałek=1, wtorek=2, ..., niedziela=7)
     */
    readonly WD: number;
    /** [
     * Ilość tygodni w roku,
     * Tydzień 1. stycznia,
     * Tydzień 31. grudnia
     * ] */
    readonly WX: [number, number, number];
    /**
     * Rok tygodniowy wg ISO 8601 (może różnić się od roku kalendarzowego na przełomie lat)
     */
    readonly WY: number;

    // # --- GRUPA CZASU (UTC) ---
    /**
     * Godzina UTC (0-23)
     */
    readonly TH: number;
    /**
     * Minuta (0-59)
     */
    readonly TM: number;
    /**
     * Sekunda (0-59)
     */
    readonly TS: number;
    /**
     * Tercja (1/60 sekundy, 0-59)
     */
    readonly TT: number;
    /**
     * Kwarta (1/60 tercji, 0-59)
     */
    readonly TQ: number;
    /**
     * Milisekunda (0-999)
     */
    readonly TZ: number;

    // # --- GRUPA STREFY CZASOWEJ ---
    /**
     * Znak offsetu czasu lokalnego względem UTC ("+" lub "-")
     */
    readonly ZS: "+" | "-";
    /**
     * Nazwa znaku offsetu ("plus" lub "minus")
     */
    readonly ZO: "inc" | "dec";
    /**
     * Godziny offsetu strefy czasowej
     */
    readonly ZH: number;
    /**
     * Minuty offsetu strefy czasowej
     */
    readonly ZM: number;

    constructor(sourceDate: Date = new Date()) {
        // --- PRYWATNE FUNKCJE POMOCNICZE ---
        const getDayOfWeek = (d: Date): number => d.getDay() === 0 ? 7 : d.getDay();
        const isLeapYear = (year: number): boolean =>
            (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

        const getIsoWeekAndYear = (d: Date): { week: number; year: number } => {
            const date = new Date(d.getTime());
            date.setHours(0, 0, 0, 0);
            // Czwatek w bieżącym tygodniu
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            const week1 = new Date(date.getFullYear(), 0, 4);
            // Dopasuj do Czwartku w pierwszym tygodniu
            week1.setDate(week1.getDate() + 3 - (week1.getDay() + 6) % 7);

            const week = 1 +
                Math.round(((date.getTime() - week1.getTime()) / 86400000) / 7);
            return { week, year: date.getFullYear() };
        };

        const getDominicalLetter = (
            year: number,
            isLeap: boolean,
        ): typeof this.Y7 => {
            const letters = ["A", "B", "C", "D", "E", "F", "G"] as const;
            const mapping = ["A", "G", "F", "E", "D", "C", "B"] as const;
            const jan1Day = new Date(year, 0, 1).getDay(); // 0=Niedz
            const firstLetter = mapping[jan1Day];

            if (isLeap) {
                const firstLetterIndex = letters.indexOf(firstLetter);
                // Poprzednia litera w cyklu A->G, B->A, itd.
                const secondLetter = letters[(firstLetterIndex + 6) % 7];
                return `${firstLetter}${secondLetter}` as typeof this.Y7;
            }
            return firstLetter;
        };

        // --- INICJALIZACJA PÓL ---
        const year = sourceDate.getFullYear();
        const monthIndex = sourceDate.getMonth(); // 0-11

        // Grupa Roku
        this.Y = year;
        const startOfYear = new Date(year, 0, 1);
        this.YD =
            Math.floor(
                (sourceDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1;
        const isLeap = isLeapYear(year);
        this.YX = [
            isLeap ? 366 : 365,
            getDayOfWeek(startOfYear),
            getDayOfWeek(new Date(year, 11, 31)),
        ];
        this.Y7 = getDominicalLetter(year, isLeap);

        // Grupa Miesiąca
        this.M = monthIndex + 1;
        this.MD = sourceDate.getDate();
        const daysInMonth = new Date(year, this.M, 0).getDate();
        this.MX = [
            daysInMonth,
            getDayOfWeek(new Date(year, monthIndex, 1)),
            getDayOfWeek(new Date(year, monthIndex, daysInMonth)),
        ];

        // Grupa Tygodnia
        const { week, year: weekYear } = getIsoWeekAndYear(sourceDate);
        this.W = week;
        this.WY = weekYear;
        this.WD = getDayOfWeek(sourceDate);
        const lastWeekDetails = getIsoWeekAndYear(new Date(year, 11, 28)); // 28.12 zawsze jest w ostatnim tygodniu roku
        this.WX = [
            lastWeekDetails.week,
            getIsoWeekAndYear(new Date(year, 0, 1)).week,
            getIsoWeekAndYear(new Date(year, 11, 31)).week,
        ];

        // Grupa Czasu (UTC)
        this.TH = sourceDate.getUTCHours();
        this.TM = sourceDate.getUTCMinutes();
        this.TS = sourceDate.getUTCSeconds();
        this.TZ = sourceDate.getUTCMilliseconds();
        // Tercja i Kwarta są obliczane z milisekund
        const totalMicroSeconds = Math.floor(this.TZ / 1000 * 3600);
        this.TT = Math.floor(totalMicroSeconds / 60);
        this.TQ = totalMicroSeconds % 60;

        // Grupa Strefy Czasowej
        const offset = sourceDate.getTimezoneOffset(); // Np. -120 dla UTC+2
        this.ZS = offset <= 0 ? "+" : "-";
        this.ZO = offset <= 0 ? "inc" : "dec";
        const absOffset = Math.abs(offset);
        this.ZH = Math.floor(absOffset / 60);
        this.ZM = absOffset % 60;
    }
    
    get toIsoDate():string {
        return `${this.Y}-${this.M.nL(2)}-${this.MD.nL(2)}`;
    }
    get toIsoWeek():string {
        return `${this.WY}-${this.W.nL(2)}W-${this.WD}`;
    }

    get toText(){
        return {
            date: {
                yearDay:`${this.Y}d${this.YD.nL(3)}`,
                yearWeekDay: `${this.WY}w${this.W.nL(2)}d${this.WD}`,
                monthDay: `M${this.M.nL(2)}d${this.MD.nL(2)}`,
                day:`d${this.WD}`,
                year:`${this.Y}`
            },
            time:{
                hourMinuteSecund:`h${this.TH.nL(2)}m${this.TM.nL(2)}s${this.TS.nL(2)}`,
                tarciaQuadra: `t${this.TT.nL(2)}q${this.TQ.nL(2)}`,
                millisecond:`z${this.TZ.nL(3)}`,
                zone:`${this.ZO}${this.ZH.nL(2)}m${this.ZM.nL(2)}`

            }
        };
    }

    static stampWRITE(I:string='-', stamp?:TimeSnap):string{
        const xx = stamp ?? new TimeSnap();
        return `${xx.WY}w${xx.W.nL(2)}d${xx.WD}${I}${xx.M.nL(2)}d${xx.MD.nL(2)}${I}${xx.TH.nL(2)}m${xx.TM.nL(2)}s${xx.TS.nL(2)}t${xx.TT.nL(2)}q${xx.TQ.nL(2)}${I}${xx.ZO}${xx.ZH.nL(2)}m${xx.ZM.nL(2)}`;
    }

    /**
     * Parsuje sformatowany łańcuch znaków i tworzy z niego nową instancję TimeSnap.
     * Jest to operacja odwrotna do stampWRITE.
     * @param I Separator użyty w łańcuchu znaków.
     * @param stamp Sformatowany łańcuch do sparsowania.
     * @returns Nowa instancja klasy TimeSnap.
     */
    static stampPARSE(I: string = '-', stamp: string): TimeSnap {
        const parts = stamp.split(I);
        if (parts.length !== 4) {
            throw new Error("Nieprawidłowy format znacznika: nieprawidłowa liczba części.");
        }
        
        const [weekPart, monthDayPart, timePart, zonePart] = parts;

        // Wyrażenia regularne do bezpiecznego parsowania każdej części
        const weekRegex = /^(?<wy>\d{4})w(?<w>\d{2})d(?<wd>\d{1})$/;
        const timeRegex = /^(\d{2})m(\d{2})s(\d{2})t(\d{2})q(\d{2})$/;
        const zoneRegex = /^(inc|dec)(\d{2})m(\d{2})$/;

        const weekMatch = weekPart.match(weekRegex);
        const timeMatch = timePart.match(timeRegex);
        // Ignorujemy monthDayPart, ponieważ data jest jednoznacznie określona przez tydzień ISO.
        // Strefa czasowa również jest ignorowana, bo czas jest podany w UTC.

        if (!weekMatch || !timeMatch) {
            throw new Error("Nieprawidłowy format znacznika: błąd dopasowania wzorca.");
        }

        const wy = parseInt(weekMatch.groups!.wy, 10);
        const w = parseInt(weekMatch.groups!.w, 10);
        const wd = parseInt(weekMatch.groups!.wd, 10);

        const th = parseInt(timeMatch[1], 10);
        const tm = parseInt(timeMatch[2], 10);
        const ts = parseInt(timeMatch[3], 10);
        const tt = parseInt(timeMatch[4], 10);
        const tq = parseInt(timeMatch[5], 10);

        // Funkcja pomocnicza do odtworzenia daty z tygodnia ISO
        const getDateFromIsoWeek = (year: number, week: number, day: number): Date => {
            // Obliczamy przesunięcie dla 4 stycznia danego roku (zawsze jest w 1. tygodniu)
            const jan4 = new Date(Date.UTC(year, 0, 4));
            const dayOfWeekJan4 = jan4.getUTCDay() === 0 ? 7 : jan4.getUTCDay(); // pon=1, niedz=7

            // Obliczamy datę pierwszego dnia (poniedziałku) pierwszego tygodnia
            const firstDayOfWeek1 = new Date(jan4);
            firstDayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeekJan4 + 1);

            // Obliczamy docelową datę
            const targetDate = new Date(firstDayOfWeek1);
            targetDate.setUTCDate(firstDayOfWeek1.getUTCDate() + (week - 1) * 7 + (day - 1));
            return targetDate;
        };

        // Odtworzenie daty z komponentów tygodniowych
        const date = getDateFromIsoWeek(wy, w, wd);

        // Odtworzenie milisekund z tercji i kwart
        const milliseconds = Math.round(((tt * 60 + tq) / 3600) * 1000);

        // Ustawienie czasu UTC na odtworzonej dacie
        date.setUTCHours(th, tm, ts, milliseconds);

        return new TimeSnap(date);
    }

    /**
     * Konwertuje instancję TimeSnap z powrotem na standardowy obiekt Date.
     * @param timesnap Instancja klasy TimeSnap do konwersji.
     * @returns Obiekt Date reprezentujący ten sam punkt w czasie.
     */
    static toDate(timesnap:TimeSnap):Date {
        // Używamy komponentów UTC przechowywanych w obiekcie TimeSnap,
        // aby jednoznacznie zrekonstruować datę.
        // Miesiąc w konstruktorze Date.UTC jest 0-indeksowany (0=styczeń), 
        // dlatego od M (który jest 1-indeksowany) odejmujemy 1.
        return new Date(Date.UTC(
            timesnap.Y,
            timesnap.M - 1,
            timesnap.MD,
            timesnap.TH,
            timesnap.TM,
            timesnap.TS,
            timesnap.TZ
        ));
    }
}  
