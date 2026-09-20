import { doltExec, esc } from "./seed/engine/dolt.js";

const originalHashes: [string, string][] = [
  ["gowthamcd.23cse@kongu.edu", "$2b$10$s3855CduR4SV7tOdnQB0BObl.fIaBDOkvW7PJZWvh27Lv5pK3sLYO"],
  ["konguengineeringcollege@kongu.edu", "$2a$10$.8ZM6LghRJc52u9MideaxO6AFU.FE2QIdxXjA.AS9lq3ADXz/w7k6"],
  ["principal.test@kongu.edu", "$2a$10$ufEAzvx6SqCtTt48qdt2heVh3NROZr74ratBvf.T/90tdfjW0b0xC"],
  ["coord.test@kongu.edu", "$2a$10$9qBqJNGafZQWcL/7pyI0Vu4QPV/gCvq1uP8OfH51tm5yylXd1DdQm"],
  ["incharge.cse@kongu.edu", "$2a$10$jvdTqk3YOmYsDKvHabt6UubVGA2KEyd9Ny91VF3jxujRueFPQRnMS"],
  ["gowthamcdstudies@gmail.com", "$2a$10$PdKuoxeQTPr2rZ8GugWqfO2Co0AxPYta9fN7QcrZJhtuMm5WR/Q0i"],
  ["kowshikp.23cse@kongu.edu", "$2a$10$lV2gu9r95uBkg3LCV4kLietLlKizLJ.vkR2C7jVbWm5eQyyvGpAhy"],
  ["harishkannann.23cse@kongu.edu", "$2b$12$/UsLniNwe4zance5sqDHzuixuwyEEuiPDAxvLkzkJiBZ1I0YOBo/i"],
  ["gotm@grito.in", "$2a$10$JuH1Lxgi7LztrP8AWMUf3.l.XpCyv40QyU2WAsU2whAdwYiMWZNaq"],
  ["recruiter@infosys.com", "$2a$10$6MDpHrfxLfWulTV/rsPLrO8YasO6YYhx1WG4bu2Zk3aUdDxDSs6SG"],
  ["superadmin@beyon.io", "$2a$10$trVSJHzMLc9sP.9wHvMN/O4/FFvPtMDU9YOFbiiWQekWdobObBWb6"],
  ["verifier@beyon.io", "$2a$10$0Al4DPaLLWX0cka8tHj9COmEj15SmtiiSxfYiHdMkUJPIdjB2eKD."],
  ["skillcontent@beyon.io", "$2a$10$OTBrf5KFcHI7uy1orde6auaTFmAzr8Qw.yBPzMrnoXuiDcxvACrI2"],
  ["questionsetter@beyon.io", "$2a$10$tD9I6rwgf1tQQ2eWEYsbceJlIrC5VamtMJxQgm7cP83DdwufIpYXO"],
  ["supportadmin@beyon.io", "$2a$10$0Zids6x/CRFhRikDF0ltjuVg04aP0fal4OfHeOPVdfcmHiEmB3zQe"],
  ["analytics@beyon.io", "$2a$10$C6fDb4RmmJztsGXHQIR3T.WAqtwjMMt.yJ9l.SBz1IQiD05XnGEF6"],
  ["beyontech@beyon.tech", "$2a$10$BoNR/y8964VvaJfpc0PNcOXeJHtGY10SvX.1N25NKIfpjOTgRCVVa"],
  ["dean_1789261356143@benedictine.edu", "$2a$10$VKrN14pJWJKj0Zs6Nz0PAOEtE.8Rb6Oy57sjYVtcGX16cLN8riz06"],
  ["aitm2007@rediffmail.com", "$2a$10$LD5ZwI.A.bqrvyKVQJbEiesUtp5YFEMR9ckYL0JObgTxpLz.FVkqe"],
  ["instmgr.test@beyon.io", "$2a$10$XL4hcpLdPoaC9CbwxPh4ZuZZQnEj9mIZCsu8ltOftx1nZ7b7VSrfG"],
  ["student_1789259923734@example.com", "$2a$10$eBxkRlzqBkrQ7tbSKyDEZOBsH9OOfsps0QlxxQW94p92xoVpDXJg."]
];

console.log("Restoring original historical passwords for all 21 accounts...");
for (const [email, hash] of originalHashes) {
  doltExec(`UPDATE users SET password_hash = ${esc(hash)} WHERE email = ${esc(email)};`);
  console.log(`  ✓ Restored ${email}`);
}
console.log("Done!");
