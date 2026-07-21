export const STORAGE_KEY = "ats_resume_workspace_v1";

export const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

export const COUNTRIES = [
    { value: "+55", label: "Brasil (+55)" },
    { value: "+1", label: "EUA/Canadá (+1)" },
    { value: "+34", label: "Espanha (+34)" },
    { value: "+44", label: "Reino Unido (+44)" },
    { value: "+351", label: "Portugal (+351)" },
    { value: "+54", label: "Argentina (+54)" },
    { value: "+52", label: "México (+52)" },
    { value: "+57", label: "Colômbia (+57)" },
    { value: "+56", label: "Chile (+56)" },
    { value: "+51", label: "Peru (+51)" },
    { value: "+33", label: "França (+33)" },
    { value: "+49", label: "Alemanha (+49)" },
];

export const LINK_TYPES = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "github", label: "GitHub" },
    { value: "portfolio", label: "Portfólio" },
    { value: "other", label: "Outro" },
];

export const EDUCATION_TYPES = [
    { value: "superior", pt: "Ensino Superior", en: "Bachelor Degree", es: "Grado Universitario" },
    { value: "tecnologo", pt: "Tecnólogo", en: "Associate Degree", es: "Tecnólogo" },
    { value: "tecnico", pt: "Curso Técnico", en: "Technical Course", es: "Curso Técnico" },
    { value: "medio", pt: "Ensino Médio", en: "High School", es: "Bachillerato" },
    { value: "pos", pt: "Pós-graduação", en: "Postgraduate", es: "Posgrado" },
    { value: "mestrado", pt: "Mestrado", en: "Master Degree", es: "Master" },
    { value: "doutorado", pt: "Doutorado", en: "Doctorate", es: "Doctorado" },
];

export const EDUCATION_STATUS = [
    { value: "done", pt: "Completo", en: "Completed", es: "Completo" },
    { value: "doing", pt: "Em andamento", en: "In progress", es: "En curso" },
    { value: "paused", pt: "Interrompido", en: "Interrupted", es: "Interrumpido" },
];

export const LEVELS = {
    pt: ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"],
    en: ["Basic", "Intermediate", "Advanced", "Fluent", "Native"],
    es: ["Básico", "Intermedio", "Avanzado", "Fluido", "Nativo"],
};

export const TABS = ["profile", "story", "work", "education", "skills", "languages", "certificates"];