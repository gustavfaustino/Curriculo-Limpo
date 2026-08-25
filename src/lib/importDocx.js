import mammoth from "mammoth/mammoth.browser";
import { createId } from "../utils/helpers";

const sectionNames = {
  summary: ["resumo", "resumo profissional", "perfil", "objetivo", "summary", "profile", "objective"],
  work: ["experiencia", "experiencia profissional", "experiencias profissionais", "experience", "employment", "work history"],
  education: ["formacao", "formacao academica", "educacao", "education", "academic background"],
  skills: ["habilidades", "competencias", "competencias tecnicas", "competencias comportamentais", "skills", "technical skills"],
  languages: ["idiomas", "linguas", "languages"],
  certificates: ["certificado", "certificados", "cursos", "reconhecimentos", "certifications", "courses"],
};

const normalize = (value) => value.replace(/\s+/g, " ").trim();
const plain = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const linesOf = (text) => text.split(/\r?\n/).map(normalize).filter(Boolean);
const findSection = (line) => {
  const candidate = plain(line.replace(/[:：]$/, ""));
  return Object.entries(sectionNames).find(([, names]) => names.includes(candidate))?.[0];
};
const monthNumber = (value) => {
  const months = { jan: "01", feb: "02", mar: "03", abr: "04", apr: "04", mai: "05", may: "05", jun: "06", jul: "07", ago: "08", aug: "08", set: "09", sep: "09", out: "10", oct: "10", nov: "11", dez: "12", dec: "12" };
  const match = value.toLowerCase().match(/(\d{1,2})[/-](\d{4})|(jan|feb|mar|abr|apr|mai|may|jun|jul|ago|aug|set|sep|out|oct|nov|dez|dec)[a-z]*[ ./-]+(\d{4})|(\d{4})/);
  if (!match) return ["", ""];
  if (match[3]) return [months[match[3].slice(0, 3)], match[4]];
  if (match[5]) return ["", match[5]];
  return [match[1]?.padStart(2, "0") || "", match[2] || ""];
};

const dates = (value) => {
  const parts = value.split(/\s*(?:-|–|—|até|to)\s*/i).filter(Boolean);
  const [startMonth, startYear] = monthNumber(parts[0] || value);
  const end = parts[1] || "";
  const [endMonth, endYear] = monthNumber(end);
  const current = /atual|presente|current|present/i.test(value);
  return { startMonth, startYear, endMonth: current ? "" : endMonth, endYear: current ? "" : endYear, current };
};

const emptyItem = (group) => ({
  id: createId(),
  ...(group === "work" ? { position: "", company: "", stack: "", duties: "", wins: "", ...dates("") } : {}),
  ...(group === "education" ? { type: "superior", course: "", school: "", status: "done", notes: "", ...dates("") } : {}),
  ...(group === "languages" ? { name: "", level: "Intermediário" } : {}),
  ...(group === "certificates" ? { name: "", issuer: "", date: "", hours: "", proof: "", notes: "" } : {}),
});

export async function importDocx(file) {
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const lines = linesOf(value);
  if (!lines.length) throw new Error("Não foi possível encontrar texto no DOCX.");

  const sections = { top: [] };
  let current = "top";
  lines.forEach((line) => {
    const found = findSection(line);
    if (found) current = found;
    else (sections[current] ||= []).push(line);
  });

  const email = value.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "";
  const urls = [...value.matchAll(/(?:https?:\/\/|www\.)[^\s<>]+/gi)].map((match) => match[0].replace(/[),.;]+$/, ""));
  const phone = value.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,3}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}/)?.[0] || "";
  const top = sections.top.filter((line) => line !== email && !urls.includes(line) && line !== phone);
  const contactLine = top.find((line) => line.includes("@") || /\d{2,}/.test(line)) || "";
  const role = top.find((line) => line !== contactLine && line !== top[0]) || "";
  const result = {
    name: top[0] || "", role, email, country: "+55", area: "", phone: phone.replace(/\D/g, ""), city: contactLine.split("|")[0]?.trim() || "",
    links: urls.map((url) => ({ id: createId(), type: /linkedin/i.test(url) ? "linkedin" : /github/i.test(url) ? "github" : "other", title: "", url })),
    summary: (sections.summary || []).join(" "), skills: (sections.skills || []).join(", ").split(/[,;|•]/).map(normalize).filter((skill) => skill && !skill.includes(":")),
    skillGroups: [], work: [], education: [], languages: [], certificates: [],
  };

  (sections.languages || []).forEach((line) => { const [name, level = "Intermediário"] = line.split(/\s*[-–|:]\s*/, 2); if (name) result.languages.push({ id: createId(), name: normalize(name), level: normalize(level) }); });
  let currentWork;
  (sections.work || []).forEach((line) => {
    if (/\d{4}/.test(line)) {
      const item = emptyItem("work");
      const datePart = line.match(/(?:[A-Za-zÀ-ÿ]{3,9}\/)?\d{4}\s*(?:-|–|—|até|to)\s*(?:[A-Za-zÀ-ÿ]{3,9}\/)?(?:\d{4}|atual|presente|current|present)/i)?.[0] || line.match(/\d{4}/)?.[0] || "";
      const title = line.replace(datePart, "").replace(/\s*[–—-]\s*$/, "").trim();
      const parts = title.split(/\s+[–—-]\s+|\t/).map(normalize);
      item.position = parts[0] || title; item.company = parts[1] || ""; Object.assign(item, dates(datePart));
      result.work.push(item); currentWork = item;
    } else if (currentWork) currentWork.duties = `${currentWork.duties}${currentWork.duties ? "\n" : ""}${line}`;
  });
  (sections.education || []).forEach((line) => { const item = emptyItem("education"); const parts = line.split(/\s+[|—–-]\s+/); item.course = parts[0] || line; item.school = parts[1] || ""; Object.assign(item, dates(parts.find((part) => /\d{4}/.test(part)) || "")); result.education.push(item); });
  (sections.certificates || []).forEach((line) => { const item = emptyItem("certificates"); const parts = line.split(/\s+[|—–-]\s+/); [item.name, item.issuer, item.date] = parts; result.certificates.push(item); });
  return result;
}
