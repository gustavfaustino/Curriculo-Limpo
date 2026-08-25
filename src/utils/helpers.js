import { LINK_TYPES } from "../constants/data";

export const createId = () => crypto.randomUUID();

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
  "trk",
  "trkcampaign",
]);

export const clean = (value) => {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();
};

export const isFilled = (value) => {
  if (typeof value === "string") return clean(value).length > 0;
  return !!value;
};

export const sanitizeUrlForExport = (value) => {
  const url = clean(value);

  if (!url) return "";

  let normalizedUrl = url;

  if (!/^https?:\/\//i.test(url) && /^www\./i.test(url)) {
    normalizedUrl = `https://${url}`;
  }

  try {
    const parsed = new URL(normalizedUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return url;
    }

    [...parsed.searchParams.keys()].forEach((key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    });

    parsed.hash = "";

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
};

export const sanitizeUrlDisplay = (value, maxLength = 52) => {
  const sanitized = sanitizeUrlForExport(value);

  if (!sanitized) return "";

  const display = sanitized
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");

  if (display.length <= maxLength) {
    return display;
  }

  return `${display.slice(0, maxLength - 3)}...`;
};

export const isEmailValid = (email) => {
  const value = clean(email);
  if (!value || value.includes(" ") || !value.includes("@")) return false;

  const [localPart, domainPart, ...extraParts] = value.split("@");
  if (extraParts.length > 0 || !localPart || !domainPart) return false;

  const lastDotIndex = domainPart.lastIndexOf(".");
  return lastDotIndex > 0 && lastDotIndex < domainPart.length - 1;
};

export const isUrlValid = (value) => {
  const url = clean(value);

  if (!url) return false;
  if (!/^https?:\/\//i.test(url) && !/^www\./i.test(url)) return false;

  try {
    const parsed = new URL(/^www\./i.test(url) ? `https://${url}` : url);

    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !!parsed.hostname &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
};

// Formata o período no padrão simples "MM/AAAA - MM/AAAA", usado tanto na
// interface quanto nos arquivos exportados (PDF/DOCX).
export const joinDate = (item, currentLabel) => {
  const start =
    item.startMonth && item.startYear
      ? `${item.startMonth}/${item.startYear}`
      : "";

  let end = "";

  if (item.current || item.status === "doing") {
    end = currentLabel;
  } else if (item.endMonth && item.endYear) {
    end = `${item.endMonth}/${item.endYear}`;
  }

  return [start, end].filter(Boolean).join(" - ");
};

// Resolve o rótulo de exibição de um link de contato: usa o nome do tipo
// (LinkedIn, GitHub, Portfólio) ou, quando o tipo é personalizado, o título
// digitado pelo usuário — com um texto de reserva caso esteja vazio.
export const resolveLinkLabel = (link, lang, fallbackLabel) => {
  if (link.type && link.type !== "other") {
    const found = LINK_TYPES.find((entry) => entry.value === link.type);
    if (found) return found[lang] || found.label || link.type;
  }
  return clean(link.title) || fallbackLabel;
};

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

// Reordena um array de itens de forma imutável, movendo o elemento no
// índice informado uma posição para cima (-1) ou para baixo (+1).
export const reorder = (list, index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
};
