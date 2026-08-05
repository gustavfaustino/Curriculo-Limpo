import { Document, HeadingLevel, Paragraph, TextRun } from "docx";
import { clean, joinDate, sanitizeUrlForExport } from "../utils/helpers";
import { EDUCATION_TYPES, EDUCATION_STATUS } from "../constants/data";

const bulletLines = (value) => (
  clean(value)
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s?/, "").trim())
    .filter(Boolean)
    .map((text) => new Paragraph({ text, bullet: { level: 0 } }))
);

export function buildDocx(resume, t, lang) {
  const children = [];
  let currentLabel = "Atual";

  if (lang === "en") {
    currentLabel = "Current";
  } else if (lang === "es") {
    currentLabel = "Actual";
  }

  const addLine = (text, options = {}) => {
    const output = clean(text);
    if (!output) return;
    children.push(new Paragraph({ children: [new TextRun({ text: output, ...options })] }));
  };

  const addHeading = (text) => {
    const output = clean(text);
    if (!output) return;
    children.push(new Paragraph({ text: output, heading: HeadingLevel.HEADING_2 }));
  };

  addLine(resume.name, { bold: true, size: 32 });
  addLine(resume.role, { italics: true });

  const phone = resume.phone
    ? [resume.country, resume.area, resume.phone].filter(Boolean).join(" ")
    : "";

  const contact = [resume.email, phone, resume.city]
    .filter(Boolean)
    .join(" | ");
  addLine(contact);

  const links = resume.links
    .map((link) => sanitizeUrlForExport(link.url))
    .filter(Boolean)
    .join(" | ");
  addLine(links);

  if (resume.summary) {
    addHeading(t.sections.story);
    addLine(resume.summary);
  }

  if (resume.work.length) {
    addHeading(t.sections.work);
    resume.work.forEach((item) => {
      const title = [item.position, item.company].filter(Boolean).join(" - ");
      const period = joinDate(item, currentLabel);
      addLine(title, { bold: true });
      addLine(period, { italics: true });
      if (item.stack) addLine(`${t.fields.stack}: ${item.stack}`);
      children.push(...bulletLines(item.duties), ...bulletLines(item.wins));
    });
  }

  if (resume.education.length) {
    addHeading(t.sections.education);
    resume.education.forEach((item) => {
      const type = EDUCATION_TYPES.find((entry) => entry.value === item.type)?.[lang] || "";
      const status = EDUCATION_STATUS.find((entry) => entry.value === item.status)?.[lang] || "";
      const period = joinDate(item, currentLabel);
      addLine([type, item.course].filter(Boolean).join(" - "), { bold: true });
      addLine(item.school);
      addLine([status, period].filter(Boolean).join(" | "), { italics: true });
      addLine(item.notes);
    });
  }

  if (resume.skills.length) {
    addHeading(t.sections.skills);
    addLine(resume.skills.join(", "));
  }

  if (resume.languages.length) {
    addHeading(t.sections.languages);
    resume.languages.forEach((item) => {
      addLine([item.name, item.level].filter(Boolean).join(" - "));
    });
  }

  if (resume.certificates.length) {
    addHeading(t.sections.certificates);
    resume.certificates.forEach((item) => {
      addLine(item.name, { bold: true });
      addLine([item.issuer, item.date, item.hours].filter(Boolean).join(" | "));
      addLine(item.notes);
      addLine(item.proof);
    });
  }

  return new Document({ sections: [{ children }] });
}