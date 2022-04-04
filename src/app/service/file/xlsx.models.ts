/* */
export interface VerbalProcessData {
    name: string;
    coordinatorName: string;
    coordinatorFunction: string;
    presentationDate: Date;
    attendanceYear: number;
    thesisTitle: string;
    rows: VerbalProcessTableRow[];
}

export interface VerbalProcessTableRow {
    number: number;
    coordinatorName: string;
    commission: string;

    /* Those fields are not completed here */
    grade?: number;
    signature?: string;
}

/* */
export interface FAZDayActivity {
    day: number;
    interval: string;
    discipline: string;
    year: string;
    cad: string;
    sad: string;
    td: string;
    csrd: string;
    hours: number;

    /* Suplimentar */
    weekDay: string;
}

export interface FAZData {
    professorName: string;
    professorFunction: string;
    month: number;
    year: number;
    monthlyActivity: FAZDayActivity[];
}

/* */
export interface SemesterTimetableData {
    emailTo: string;
    professorActivity: SemesterTimetableDataActivity[];
}

export interface SemesterTimetableDataActivity {
    activity: string;
    weekHours: number;
}