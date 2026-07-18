// src/lib/pdf.js
import { PDFDocument, PageSizes, rgb, StandardFonts } from "pdf-lib";
import { clean, joinDate } from "../utils/helpers";
import { EDUCATION_TYPES, EDUCATION_STATUS } from "../constants/data";

export async function buildPdf(resume, t, lang) {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    let page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const margin = 48;
    const maxWidth = width - margin * 2;
    const colors = {
        text: rgb(0.12, 0.12, 0.12),
        faint: rgb(0.36, 0.36, 0.36),
        title: rgb(0.05, 0.05, 0.05),
    };
    let y = height - margin;

    const newPageIfNeeded = (space = 48) => {
        if (y - space > margin) return;
        page = doc.addPage(PageSizes.A4);
        y = height - margin;
    };

    const draw = (text, x, yPosition, size = 10, font = regular, color = colors.text) => {
        const output = clean(text);
        if (!output) return 0;
        page.drawText(output, { x, y: yPosition, size, font, color });
        return size * 1.25;
    };

    const wrap = (text, x, size = 10, font = regular, color = colors.text, localWidth = maxWidth) => {
        const source = clean(text);
        if (!source) return;
        const lineHeight = size * 1.42;
        source.split("\n").forEach((paragraph) => {
            const words = paragraph.trim().split(/\s+/).filter(Boolean);
            let line = "";
            words.forEach((word) => {
                const next = line ? `${line} ${word}` : word;
                if (font.widthOfTextAtSize(next, size) > localWidth && line) {
                    newPageIfNeeded(lineHeight);
                    page.drawText(line, { x, y, size, font, color });
                    y -= lineHeight;
                    line = word;
                } else {
                    line = next;
                }
            });
            if (line) {
                newPageIfNeeded(lineHeight);
                page.drawText(line, { x, y, size, font, color });
                y -= lineHeight;
            }
            y -= 3;
        });
    };

    const heading = (label) => {
        newPageIfNeeded(42);
        y -= 12;
        draw(label.toUpperCase(), margin, y, 11, bold, colors.title);
        y -= 18;
    };

    draw(resume.name, margin, y, 18, bold, colors.title);
    y -= 24;
    if (resume.role) {
        draw(resume.role, margin, y, 12, regular, colors.faint);
        y -= 18;
    }

    const phone = [resume.country, resume.area, resume.phone].filter(Boolean).join(" ");
    const contact = [resume.email, phone, resume.city].filter(Boolean).join(" | ");
    wrap(contact, margin, 9, regular, colors.text);
    if (resume.links.length) {
        wrap(resume.links.map((link) => link.url).filter(Boolean).join(" | "), margin, 9, regular, colors.faint);
    }

    if (resume.summary) {
        heading(t.sections.story);
        wrap(resume.summary, margin, 10.5);
    }

    if (resume.work.length) {
        heading(t.sections.work);
        resume.work.forEach((item) => {
            newPageIfNeeded(84);
            const period = joinDate(item, lang === "en" ? "Current" : lang === "es" ? "Actual" : "Atual");
            draw(item.position, margin, y, 11, bold);
            if (period) draw(period, margin + maxWidth - regular.widthOfTextAtSize(period, 9), y, 9, regular, colors.faint);
            y -= 15;
            draw(item.company, margin, y, 10, regular, colors.faint);
            y -= 14;
            if (item.stack) {
                wrap(`Tecnologias: ${item.stack}`, margin, 9, regular, colors.faint);
            }
            wrap(item.duties, margin + 8, 10);
            wrap(item.wins, margin + 8, 10);
            y -= 8;
        });
    }

    if (resume.education.length) {
        heading(t.sections.education);
        resume.education.forEach((item) => {
            newPageIfNeeded(64);
            const type = EDUCATION_TYPES.find((entry) => entry.value === item.type)?.[lang] || "";
            draw([type, item.course].filter(Boolean).join(" - "), margin, y, 11, bold);
            y -= 15;
            draw(item.school, margin, y, 10, regular, colors.faint);
            y -= 14;
            const status = EDUCATION_STATUS.find((entry) => entry.value === item.status)?.[lang] || "";
            wrap([status, joinDate(item, lang === "en" ? "Current" : lang === "es" ? "Actual" : "Atual")].filter(Boolean).join(" | "), margin, 9, regular, colors.faint);
            wrap(item.notes, margin + 8, 9.5);
            y -= 8;
        });
    }

    if (resume.skills.length) {
        heading(t.sections.skills);
        wrap(resume.skills.join(", "), margin, 10);
    }

    if (resume.languages.length) {
        heading(t.sections.languages);
        resume.languages.forEach((item) => {
            wrap([item.name, item.level].filter(Boolean).join(" - "), margin, 10);
        });
    }

    if (resume.certificates.length) {
        heading(t.sections.certificates);
        resume.certificates.forEach((item) => {
            newPageIfNeeded(54);
            draw(item.name, margin, y, 10.5, bold);
            y -= 15;
            wrap([item.issuer, item.date, item.hours].filter(Boolean).join(" | "), margin, 9, regular, colors.faint);
            wrap(item.notes, margin + 8, 9.5);
            wrap(item.proof, margin + 8, 8.5, regular, colors.faint);
            y -= 6;
        });
    }

    return doc.save();
}