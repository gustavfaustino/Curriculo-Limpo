export const createId = () => crypto.randomUUID();

export const clean = (value) => {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();
};

export const isFilled = (value) => {
  if (typeof value === "string") return clean(value).length > 0;
  return !!value;
};

export const joinDate = (item, currentLabel) => {
  const start = item.startMonth && item.startYear ? `${item.startMonth}/${item.startYear}` : "";
  const end = item.current || item.status === "doing"
    ? currentLabel
    : item.endMonth && item.endYear
      ? `${item.endMonth}/${item.endYear}`
      : "";
  return [start, end].filter(Boolean).join(" - ");
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