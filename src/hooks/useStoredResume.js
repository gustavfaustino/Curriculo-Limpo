import { useState, useEffect } from "react";
import { STORAGE_KEY } from "../constants/data";

const BLANK = {
    name: "",
    role: "",
    email: "",
    country: "+55",
    area: "",
    phone: "",
    city: "",
    links: [],
    summary: "",
    work: [],
    education: [],
    skills: [],
    languages: [],
    certificates: [],
};

export function useStoredResume() {
    const [resume, setResume] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return BLANK;
            const parsed = JSON.parse(raw);
            return { ...BLANK, ...parsed };
        } catch {
            return BLANK;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    }, [resume]);

    return [resume, setResume];
}