import { PDFDocument, PageSizes, PDFName, PDFString, rgb, StandardFonts } from "pdf-lib";
import { clean, joinDate, resolveLinkLabel, sanitizeUrlForExport } from "../utils/helpers";
import { EDUCATION_TYPES, EDUCATION_STATUS } from "../constants/data";

// Adiciona uma anotação de link clicável (URI) sobre uma área retangular da página.
const addLinkAnnotation = (doc, page, { x, y, width, height }, url) => {
    const annotation = doc.context.register(
        doc.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [x, y, x + width, y + height],
            Border: [0, 0, 0],
            A: {
                Type: "Action",
                S: "URI",
                URI: PDFString.of(url),
            },
        }),
    );

    const existingAnnots = page.node.Annots();
    const annots = existingAnnots ? existingAnnots.asArray() : [];
    page.node.set(PDFName.of("Annots"), doc.context.obj([...annots, annotation]));
};

export async function buildPdf(resume, t, lang) {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    let currentLabel = "Atual";

    if (lang === "en") {
        currentLabel = "Current";
    } else if (lang === "es") {
        currentLabel = "Actual";
    }

    let page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const margin = 48;
    const maxWidth = width - margin * 2;
    const colors = {
        text: rgb(0.12, 0.12, 0.12),
        faint: rgb(0.36, 0.36, 0.36),
        title: rgb(0.05, 0.05, 0.05),
        link: rgb(0.42, 0.15, 0.65),
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

    // Desenha um texto clicável (link) e devolve a largura ocupada.
    const drawLink = (text, x, yPosition, url, size = 10, font = bold) => {
        const output = clean(text);
        const sanitizedUrl = sanitizeUrlForExport(url);
        if (!output || !sanitizedUrl) return 0;
        const textWidth = font.widthOfTextAtSize(output, size);
        page.drawText(output, { x, y: yPosition, size, font, color: colors.link });
        page.drawLine({
            start: { x, y: yPosition - 1.5 },
            end: { x: x + textWidth, y: yPosition - 1.5 },
            thickness: 0.6,
            color: colors.link,
        });
        addLinkAnnotation(
            doc,
            page,
            { x, y: yPosition - 2, width: textWidth, height: size + 2 },
            sanitizedUrl,
        );
        return textWidth;
    };

    // Desenha uma linha com múltiplos links clicáveis lado a lado (ex: os
    // links de contato do topo do currículo), separados por " | ", quebrando
    // para a próxima linha automaticamente quando necessário.
    const drawLinksLine = (items, x, size = 9) => {
        if (!items.length) return;
        newPageIfNeeded(size * 1.6);
        const lineHeight = size * 1.42;
        const sepWidth = regular.widthOfTextAtSize("   ", size);
        let cursorX = x;

        items.forEach((item, index) => {
            const label = `[${item.label}]`;
            const labelWidth = bold.widthOfTextAtSize(label, size);

            if (cursorX + labelWidth > x + maxWidth && cursorX > x) {
                y -= lineHeight;
                newPageIfNeeded(lineHeight);
                cursorX = x;
            }

            drawLink(label, cursorX, y, item.url, size);
            cursorX += labelWidth;

            if (index < items.length - 1) {
                cursorX += sepWidth;
            }
        });

        y -= lineHeight;
    };

    const wrap = (text, x, size = 10, font = regular, color = colors.text, localWidth = maxWidth) => {
        const source = clean(text);

        if (!source) return;

        const lineHeight = size * 1.42;

        const splitLongToken = (token) => {
            if (font.widthOfTextAtSize(token, size) <= localWidth) {
                return [token];
            }

            const chunks = [];
            let chunk = "";

            for (const character of token) {
                const candidate = `${chunk}${character}`;

                if (font.widthOfTextAtSize(candidate, size) > localWidth && chunk) {
                    chunks.push(chunk);
                    chunk = character;
                } else {
                    chunk = candidate;
                }
            }

            if (chunk) {
                chunks.push(chunk);
            }

            return chunks;
        };

        source.split("\n").forEach((paragraph) => {
            const tokens = paragraph
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .flatMap(splitLongToken);

            let line = "";

            tokens.forEach((word) => {
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

    const phone = resume.phone
        ? [resume.country, resume.area, resume.phone].filter(Boolean).join(" ")
        : "";

    const contact = [resume.email, phone, resume.city]
        .filter(Boolean)
        .join(" | ");
    wrap(contact, margin, 9, regular, colors.text);
    if (resume.links.length) {
        const linkItems = resume.links
            .map((link) => ({
                url: sanitizeUrlForExport(link.url),
                label: resolveLinkLabel(link, lang, t.genericLink),
            }))
            .filter((item) => item.url);

        drawLinksLine(linkItems, margin, 9);
    }

    if (resume.summary) {
        heading(t.sections.story);
        wrap(resume.summary, margin, 10.5);
    }

    if (resume.work.length) {
        heading(t.sections.work);
        resume.work.forEach((item) => {
            newPageIfNeeded(84);
            const period = joinDate(item, currentLabel);
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
            wrap([status, joinDate(item, currentLabel)].filter(Boolean).join(" | "), margin, 9, regular, colors.faint);
            wrap(item.notes, margin + 8, 9.5);
            y -= 8;
        });
    }

    const hasSkills = resume.skills.length || (resume.skillGroups || []).some((group) => group.skills?.length);
    if (hasSkills) {
        heading(t.sections.skills);
        if (resume.skills.length) {
            wrap(resume.skills.join(", "), margin, 10);
        }
        (resume.skillGroups || []).forEach((group) => {
            if (!group.skills?.length) return;
            const label = clean(group.title) || t.generalSkills;
            newPageIfNeeded(28);
            draw(`${label}:`, margin, y, 9.5, bold, colors.faint);
            y -= 13;
            wrap(group.skills.join(", "), margin, 10);
        });
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
            const sanitizedProof = sanitizeUrlForExport(item.proof);
            if (sanitizedProof) {
                newPageIfNeeded(16);
                drawLink(`[${t.certificateLink}]`, margin + 8, y, sanitizedProof, 9);
                y -= 14;
            }
            y -= 6;
        });
    }

    return doc.save();
}
