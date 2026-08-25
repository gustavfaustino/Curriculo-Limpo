import mammoth from "mammoth/mammoth.browser";
import { createId } from "../utils/helpers";

const sectionNames = {
  summary: ["resumo", "resumo profissional", "perfil", "objetivo", "summary", "profile", "objective"],
  recognition: ["reconhecimento", "reconhecimentos", "premio", "premios", "conquista", "conquistas", "awards", "recognition", "recognitions"],
  work: ["experiencia", "experiencia profissional", "experiencias profissionais", "experience", "employment", "work history"],
  education: ["formacao", "formacao academica", "educacao", "education", "academic background"],
  skills: ["habilidades", "competencias", "competencias tecnicas", "competencias comportamentais", "skills", "technical skills"],
  languages: ["idiomas", "linguas", "languages"],
  certificates: ["certificado", "certificados", "cursos", "certifications", "courses"],
};

const normalize = (value = "") => value.replace(/\s+/g, " ").trim();
const plain = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const linesOf = (text) => text.split(/\r?\n/).map(normalize).filter(Boolean);
const findSection = (line) => Object.entries(sectionNames).find(([, names]) => names.includes(plain(line.replace(/[:：]$/, ""))))?.[0];
const isDateLine = (line) => /(?:\b\d{1,2}[/-])?\d{4}\s*(?:-|–|—|até|to)\s*(?:(?:\d{1,2}[/-])?\d{4}|atual|presente|current|present)\b/i.test(line);
const isEducationTitle = (line) => /^(ensino |tecn[oó]logo|t[eé]cnico|gradua[cç][aã]o|p[oó]s|mestrado|doutorado|bachelor|master|associate|high school)/i.test(line);

const monthNumber = (value) => {
  const months = { jan: "01", feb: "02", mar: "03", abr: "04", apr: "04", mai: "05", may: "05", jun: "06", jul: "07", ago: "08", aug: "08", set: "09", sep: "09", out: "10", oct: "10", nov: "11", dez: "12", dec: "12" };
  const match = value.toLowerCase().match(/(\d{1,2})[/-](\d{4})|(jan|feb|mar|abr|apr|mai|may|jun|jul|ago|aug|set|sep|out|oct|nov|dez|dec)[a-z]*[ ./-]+(\d{4})|(\d{4})\//);
  if (!match) return ["", ""];
  if (match[3]) return [months[match[3].slice(0, 3)], match[4]];
  if (match[5]) return ["", match[5]];
  return [match[1]?.padStart(2, "0") || "", match[2] || ""];
};

const dates = (value = "") => {
  const parts = value.split(/\s*(?:-|–|—|até|to)\s*/i).filter(Boolean);
  const [startMonth, startYear] = monthNumber(parts[0] || value);
  const [endMonth, endYear] = monthNumber(parts[1] || "");
  const current = /atual|presente|current|present/i.test(value);
  return { startMonth, startYear, endMonth: current ? "" : endMonth, endYear: current ? "" : endYear, current };
};

const emptyItem = (group) => ({
  id: createId(),
  ...(group === "work" ? { position: "", company: "", stack: "", duties: "", wins: "", ...dates() } : {}),
  ...(group === "education" ? { type: "superior", course: "", school: "", status: "done", notes: "", ...dates() } : {}),
  ...(group === "certificates" ? { name: "", issuer: "", date: "", hours: "", proof: "", notes: "" } : {}),
});

const splitRoleCompany = (line) => {
  const parts = line.split(/\s+(?:-|–|—)\s+/).map(normalize).filter(Boolean);
  return { position: parts[0] || line, company: parts.slice(1).join(" - ") };
};

function importWork(lines) {
  const result = [];
  let pendingTitle = "";
  lines.forEach((line) => {
    if (isDateLine(line)) {
      const item = emptyItem("work");
      Object.assign(item, splitRoleCompany(pendingTitle), dates(line));
      result.push(item);
      pendingTitle = "";
    } else if (/^.+\s+(?:-|–|—)\s+.+$/.test(line)) {
      // In linear ATS documents a new "Role - Company" line follows the
      // previous role's duties and precedes its own date line.
      pendingTitle = line;
    } else if (result.length) {
      const item = result[result.length - 1];
      item.duties = `${item.duties}${item.duties ? "\n" : ""}${line}`;
    } else {
      pendingTitle = line;
    }
  });
  return result;
}

function importEducation(lines) {
  const blocks = [];
  lines.forEach((line) => {
    if (!blocks.length || isEducationTitle(line)) blocks.push([line]);
    else blocks[blocks.length - 1].push(line);
  });
  return blocks.map((block) => {
    const item = emptyItem("education");
    const [typeAndCourse, school = "", ...details] = block;
    const split = typeAndCourse.split(/\s+(?:-|–|—)\s+/);
    item.course = normalize(split.slice(1).join(" - ") || split[0]);
    item.school = school;
    const detail = details.join(" ");
    item.status = /andamento|cursando|in progress/i.test(detail) ? "doing" : /interrompido|trancado|paused/i.test(detail) ? "paused" : "done";
    Object.assign(item, dates(detail));
    return item;
  });
}

function importCertificates(lines) {
  const result = [];
  for (let index = 0; index < lines.length;) {
    const item = emptyItem("certificates");
    item.name = lines[index++];
    const issuerAndDate = lines[index] || "";
    if (issuerAndDate && !/^\[.*\]$/.test(issuerAndDate)) {
      index += 1;
      const [issuer, date] = issuerAndDate.split(/\s*[|–—]\s*/, 2);
      item.issuer = normalize(issuer);
      item.date = normalize(date || "");
    }
    const notes = [];
    while (index < lines.length && !/^\[.*\]$/.test(lines[index]) && !(index + 1 < lines.length && /[|–—].*\d{4}/.test(lines[index + 1]))) notes.push(lines[index++]);
    if (index < lines.length && /^\[.*\]$/.test(lines[index])) index += 1;
    item.notes = notes.join(" ");
    result.push(item);
  }
  return result.filter((item) => item.name);
}

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
  const urls = [...value.matchAll(/(?:https?:\/\/|www\.)[^\s<>|]+/gi)].map((match) => match[0].replace(/[),.;]+$/, ""));
  const phone = value.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,3}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}/)?.[0] || "";
  const top = sections.top;
  const name = top.find((line) => !line.includes("@") && !/(?:https?:\/\/|www\.)/i.test(line) && line !== phone) || "";
  const contactLine = top.find((line) => line.includes("@") || /(?:https?:\/\/|www\.)/i.test(line) || line.includes(phone)) || "";
  const city = normalize(contactLine.replace(email, "").replace(phone, "").replace(/(?:https?:\/\/|www\.)[^\s<>|]+/gi, "").replace(/^[|\s]+|[|\s]+$/g, ""));
  const role = top.find((line) => line !== name && !line.includes("@") && !/(?:https?:\/\/|www\.)/i.test(line) && line !== phone) || "";

  return {
    name, role, email, country: "+55", area: "", phone: phone.replace(/\D/g, ""), city,
    links: urls.map((url) => ({ id: createId(), type: /linkedin/i.test(url) ? "linkedin" : /github/i.test(url) ? "github" : "other", title: "", url })),
    summary: (sections.summary || []).join(" "), recognition: (sections.recognition || []).join("\n"),
    skills: (sections.skills || []).flatMap((line) => line.split(/[,;|•]/)).map(normalize).filter(Boolean), skillGroups: [],
    work: importWork(sections.work || []), education: importEducation(sections.education || []),
    languages: (sections.languages || []).map((line) => { const [name, level = "Intermediário"] = line.split(/\s*[-–|:]\s*/, 2); return { id: createId(), name: normalize(name), level: normalize(level) }; }).filter((item) => item.name),
    certificates: importCertificates(sections.certificates || []),
  };
}
