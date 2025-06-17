import { TimeSnap } from "../logic/TimeSnap.ts";

const D = new Date();
const A = new TimeSnap(D);
const T = TimeSnap.stampWRITE( '-',A)
console.log(D);
console.log(A);
console.log(T); // -> 2025w25d2-06d17-08m07s47t25q30-inc02m00
console.log(TimeSnap.stampPARSE( '-',T));
console.log(TimeSnap.toDate(A));


