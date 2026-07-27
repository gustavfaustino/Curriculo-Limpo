// src/App.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Packer } from "docx";
import { useStoredResume, BLANK } from "./hooks/useStoredResume";
import { buildPdf } from "./lib/pdf";
import { buildDocx } from "./lib/docx";
import {
  createId,
  isEmailValid,
  isFilled,
  joinDate,
  downloadFile,
} from "./utils/helpers";
import {
  MONTHS,
  COUNTRIES,
  LINK_TYPES,
  EDUCATION_TYPES,
  EDUCATION_STATUS,
  LEVELS,
  TABS,
} from "./constants/data";
import { PHONE_HINTS, TEXT } from "./constants/i18n";

import { Field } from "./components/ui/Field";
import { Area } from "./components/ui/Area";
import { Choice } from "./components/ui/Choice";
import { Toggle } from "./components/ui/Toggle";
import { AddButton } from "./components/ui/Buttons";

import { Section } from "./components/resume/Section";
import { ItemBlock } from "./components/resume/ItemBlock";
import { Empty } from "./components/resume/Empty";
import { Metric } from "./components/resume/Metric";

function App() {
  // Estado principal do currículo.
  const [resume, setResume] = useStoredResume();
  // Idioma ativo da interface.
  const [lang, setLang] = useState("pt");
  // Aba visível no formulário.
  const [active, setActive] = useState("profile");
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  // Rascunho do campo de habilidades.
  const [skillsDraft, setSkillsDraft] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  // Tipo de exportação selecionado.
  const [exportType, setExportType] = useState("pdf");
  // Mensagem global de status ou erro.
  const [notice, setNotice] = useState(null);
  // Erros visuais dos campos principais.
  const [errors, setErrors] = useState({ name: false, email: false });
  const [isBusy, setIsBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Área central usada para rolar até o formulário.
  const contentRef = useRef(null);
  // Textos localizados da UI.
  const t = TEXT[lang];

  const exportLabels = {
    word: t.generateWord,
    pdf: t.generatePdf,
  };

  const buttonText = isBusy ? t.generating : exportLabels[exportType];

  // Atualiza idioma do documento e título da página.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${t.appName} | ${t.sections[active]}`;
  }, [lang, active, t]);

  // Indicador visual de salvamento.
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [resume]);

  // Ajuda contextual do telefone conforme o país.
  const phoneHint = useMemo(() => {
    const hint = PHONE_HINTS[resume.country] || PHONE_HINTS.default;
    return {
      areaLabel: hint.areaLabel?.[lang] || t.fields.area,
      areaPlaceholder: hint.areaPlaceholder?.[lang] || t.placeholders.area,
      phonePlaceholder: hint.phonePlaceholder?.[lang] || t.placeholders.phone,
    };
  }, [
    resume.country,
    lang,
    t.fields.area,
    t.placeholders.area,
    t.placeholders.phone,
  ]);

  // Sincroniza o rascunho de habilidades com o currículo salvo.
  useEffect(() => {
    if (!isEditingSkills) {
      setSkillsDraft((resume.skills || []).join(", "));
    }
  }, [resume.skills, isEditingSkills]);

  // Atualiza campos simples do topo do currículo.
  const setRoot = useCallback(
    (field, value) => {
      setResume((current) => ({ ...current, [field]: value }));
      if (field === "name") {
        setErrors((current) => ({ ...current, [field]: false }));
      }
      if (field === "email") {
        setErrors((current) => ({
          ...current,
          email: isFilled(value) && !isEmailValid(value),
        }));
      }
    },
    [setResume],
  );

  const validateEmailField = useCallback(
    (value) => isFilled(value) && !isEmailValid(value),
    [],
  );

  const scrollToForm = useCallback(() => {
    if (window.innerWidth < 1024 && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const goToStep = useCallback(
    (tab, forceUnlock = false) => {
      const stepIndex = TABS.indexOf(tab);
      if (stepIndex < 0) return;
      if (!forceUnlock && stepIndex > maxUnlockedStep) return;

      if (forceUnlock) {
        setMaxUnlockedStep((current) => Math.max(current, stepIndex));
      }
      setActive(tab);
      scrollToForm();
    },
    [maxUnlockedStep, scrollToForm],
  );

  // Troca de seção pelo menu lateral respeitando o desbloqueio do wizard.
  const handleTabChange = (tab) => {
    goToStep(tab);
  };

  const addItem = useCallback(
    (group) => {
      const presets = {
        links: { id: createId(), type: "linkedin", url: "" },
        work: {
          id: createId(),
          position: "",
          company: "",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          current: false,
          stack: "",
          duties: "",
          wins: "",
        },
        education: {
          id: createId(),
          type: "superior",
          course: "",
          school: "",
          status: "done",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          notes: "",
        },
        languages: { id: createId(), name: "", level: LEVELS[lang][0] },
        certificates: {
          id: createId(),
          name: "",
          issuer: "",
          date: "",
          hours: "",
          proof: "",
          notes: "",
        },
      };
      setResume((current) => ({
        ...current,
        [group]: [...current[group], presets[group]],
      }));
    },
    [lang, setResume],
  );

  const patchItem = useCallback(
    (group, id, field, value) => {
      setResume((current) => ({
        ...current,
        [group]: current[group].map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [setResume],
  );

  const removeItem = useCallback(
    (group, id) => {
      if (window.confirm(t.confirmRemove)) {
        setResume((current) => ({
          ...current,
          [group]: current[group].filter((item) => item.id !== id),
        }));
      }
    },
    [t.confirmRemove, setResume],
  );

  const updateSkills = (value) => {
    setSkillsDraft(value);
    const skills = value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    setRoot("skills", skills);
  };

  // Validação da seção de experiência.
  const workMissing = useCallback((item) => {
    const required = [item.position, item.company];
    return required.some((field) => !isFilled(field));
  }, []);

  const educationMissing = useCallback((item) => {
    const required = [
      item.type,
      item.course,
      item.school,
      item.status,
      item.startMonth,
      item.startYear,
    ];
    if (item.status !== "doing") {
      required.push(item.endMonth, item.endYear);
    }
    return required.some((field) => !isFilled(field));
  }, []);

  const certificateMissing = useCallback((item) => {
    const required = [item.name, item.issuer, item.date, item.hours];
    return required.some((field) => !isFilled(field));
  }, []);

  const languageMissing = useCallback(
    (item) => [item.name, item.level].some((field) => !isFilled(field)),
    [],
  );

  const sectionCompletion = useMemo(
    () => ({
      profile:
        isFilled(resume.name) &&
        isFilled(resume.email) &&
        isEmailValid(resume.email),
      story: isFilled(resume.summary),
      work: resume.work.length > 0 && !resume.work.some(workMissing),
      education:
        resume.education.length > 0 && !resume.education.some(educationMissing),
      skills: resume.skills.length > 0,
      languages:
        resume.languages.length > 0 && !resume.languages.some(languageMissing),
      certificates:
        resume.certificates.length > 0 &&
        !resume.certificates.some(certificateMissing),
    }),
    [
      resume,
      workMissing,
      educationMissing,
      certificateMissing,
      languageMissing,
    ],
  );

  useEffect(() => {
    const nextUnlockedStep = TABS.reduce((highest, tab, index) => {
      if (index > highest) return highest;
      return sectionCompletion[tab]
        ? Math.min(index + 1, TABS.length - 1)
        : highest;
    }, 0);

    setMaxUnlockedStep((current) => Math.max(current, nextUnlockedStep));
  }, [sectionCompletion]);

  const wizardStatuses = useMemo(
    () =>
      TABS.reduce((statusMap, tab, index) => {
        if (index > maxUnlockedStep) {
          statusMap[tab] = "pending";
        } else if (sectionCompletion[tab]) {
          statusMap[tab] = "complete";
        } else {
          statusMap[tab] = "incomplete";
        }

        return statusMap;
      }, {}),
    [maxUnlockedStep, sectionCompletion],
  );

  // Pontuação resumida do currículo.
  const score = useMemo(() => {
    const checks = [
      resume.name,
      resume.email,
      resume.role,
      resume.summary,
      resume.work.length,
      resume.education.length,
      resume.skills.length,
    ];
    return checks.filter(Boolean).length;
  }, [resume]);

  // Limpa todos os dados do currículo.
  const handleClear = () => {
    if (window.confirm(t.confirmClear)) {
      setResume(BLANK);
      setSkillsDraft("");
      setErrors({ name: false, email: false });
      setActive("profile");
      setMaxUnlockedStep(0);
      setNotice({ type: "success", message: t.cleared });

      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Valida os campos e executa a exportação.
  const handleExport = async () => {
    const missing = [];
    const nextErrors = { name: false, email: false };
    if (!isFilled(resume.name)) {
      missing.push(t.fields.name);
      nextErrors.name = true;
    }
    if (!isFilled(resume.email)) {
      missing.push(t.fields.email);
      nextErrors.email = true;
    } else if (!isEmailValid(resume.email)) {
      nextErrors.email = true;
    }

    setErrors(nextErrors);

    if (missing.length) {
      setNotice({
        type: "error",
        message: `${t.validationMissing} ${missing.join(", ")}.`,
      });
      goToStep("profile", true);
      return;
    }

    if (nextErrors.email) {
      setNotice({
        type: "error",
        message: `${t.validationInvalidEmail} ${t.fields.email}.`,
      });
      goToStep("profile", true);
      return;
    }

    const missingSections = [];
    if (resume.work.some(workMissing))
      missingSections.push({ id: "work", label: t.sections.work });
    if (resume.education.some(educationMissing))
      missingSections.push({ id: "education", label: t.sections.education });
    if (resume.languages.some(languageMissing))
      missingSections.push({ id: "languages", label: t.sections.languages });
    if (resume.certificates.some(certificateMissing))
      missingSections.push({
        id: "certificates",
        label: t.sections.certificates,
      });

    if (missingSections.length) {
      setNotice({
        type: "error",
        message: `${t.validationSections} ${missingSections.map((item) => item.label).join(", ")}.`,
      });
      goToStep(missingSections[0].id, true);
      return;
    }

    setIsBusy(true);
    setNotice(null);
    try {
      const fileName =
        resume.name.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "curriculo";

      if (exportType === "word") {
        const docx = buildDocx(resume, t, lang);
        const blob = await Packer.toBlob(docx);
        downloadFile(blob, `${fileName}_ats.docx`);
      } else {
        const bytes = await buildPdf(resume, t, lang);
        const blob = new Blob([bytes], { type: "application/pdf" });
        downloadFile(blob, `${fileName}_ats.pdf`);
      }

      setNotice({ type: "success", message: t.success });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Erro ao gerar arquivo.",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const monthOptions = [
    { value: "", label: "--" },
    ...MONTHS.map((month) => ({ value: month, label: month })),
  ];
  const levelOptions = LEVELS[lang].map((level) => ({
    value: level,
    label: level,
  }));
  const typeOptions = EDUCATION_TYPES.map((entry) => ({
    value: entry.value,
    label: entry[lang],
  }));
  const statusOptions = EDUCATION_STATUS.map((entry) => ({
    value: entry.value,
    label: entry[lang],
  }));

  const activeStepIndex = TABS.indexOf(active);
  const isFirstStep = activeStepIndex <= 0;
  const isLastStep = activeStepIndex === TABS.length - 1;
  const canShowExport = maxUnlockedStep >= TABS.length - 1;

  const handleWizardBack = () => {
    if (isFirstStep) return;
    goToStep(TABS[activeStepIndex - 1], true);
  };

  const handleWizardNext = () => {
    if (isLastStep) return;

    const nextStep = TABS[activeStepIndex + 1];
    goToStep(nextStep, true);
  };

  return (
    <div className="app-shell min-h-screen bg-black text-zinc-100">
      {/* Cabeçalho com título, idioma e exportação. */}
      <header className="border-b border-purple-950/70 bg-black/90 backdrop-blur">
        <div className="header-container mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {t.appName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              {t.headline}
            </p>
          </div>
          <div className="header-actions flex flex-wrap items-end gap-3">
            <Choice
              label={t.language}
              value={lang}
              onChange={setLang}
              options={[
                { value: "pt", label: "PT" },
                { value: "en", label: "EN" },
                { value: "es", label: "ES" },
              ]}
              className="w-28"
            />
          </div>
        </div>
      </header>

      {/* Layout principal: navegação, formulário e painel lateral. */}
      <main className="main-layout mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:px-8">
        {/* Menu das seções do currículo. */}
        <aside className="nav-aside sticky top-0 z-20 bg-black/90 px-4 py-3 backdrop-blur-xl lg:static lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div
            role="tablist"
            aria-label="Seções do currículo"
            className="nav-tablist no-scrollbar flex snap-x snap-mandatory scroll-smooth overflow-x-auto gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 md:grid lg:pb-2"
          >
            {TABS.map((tab, index) => {
              const stepStatus = wizardStatuses[tab];
              const isLocked = index > maxUnlockedStep;
              const isActive = active === tab;

              // Lógica do indicador numérico (extraída do ternário aninhado)
              let dotClass = "border-zinc-700 bg-zinc-950 text-zinc-500";
              if (isActive) {
                dotClass =
                  "border-purple-300 bg-purple-500 text-white shadow-lg shadow-purple-700/50";
              } else if (stepStatus === "complete") {
                dotClass = "border-purple-300 bg-purple-300 text-black";
              } else if (stepStatus === "incomplete") {
                dotClass = "border-purple-500 bg-purple-950 text-purple-100";
              }

              // Lógica do estilo do botão (extraída do ternário aninhado)
              let buttonStatusClass =
                "border-transparent text-zinc-400 hover:border-purple-900/70 hover:bg-zinc-900 hover:text-zinc-100";
              if (isActive) {
                buttonStatusClass =
                  "border-purple-500 bg-purple-950/70 text-white";
              } else if (isLocked) {
                buttonStatusClass = "border-transparent text-zinc-600";
              }

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`tab-${tab}`}
                  aria-selected={isActive}
                  aria-controls={`section-${tab}`}
                  onClick={() => handleTabChange(tab)}
                  disabled={isLocked}
                  aria-disabled={isLocked}
                  className={`nav-tab-item flex min-h-[48px] snap-start shrink-0 items-center gap-3 rounded-md border px-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 md:w-full ${buttonStatusClass}`}
                >
                  <span
                    className={`wizard-dot flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${dotClass}`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="wizard-label min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {t.sections[tab]}
                    </span>
                    <span className="block text-xs text-purple-300/80">
                      {t.wizard[stepStatus]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0" ref={contentRef}>
          {/* Avisos de validação e status. */}
          {notice && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-4 rounded-md border px-4 py-3 text-sm ${
                notice.type === "error"
                  ? "border-red-500 bg-red-950/40 text-red-100"
                  : "border-emerald-600 bg-emerald-950/40 text-emerald-100"
              }`}
            >
              {notice.message}
            </div>
          )}

          {/* Contato e dados principais. */}
          <Section
            id="profile"
            active={active}
            title={t.sections.profile}
            description={t.sectionHelp?.profile}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {/* Nome completo. */}
              <Field
                label={t.fields.name}
                value={resume.name}
                onChange={(value) => setRoot("name", value)}
                placeholder={t.placeholders.name}
                required
                error={errors.name}
              />
              {/* Cargo alvo. */}
              <Field
                label={t.fields.role}
                value={resume.role}
                onChange={(value) => setRoot("role", value)}
                placeholder={t.placeholders.role}
              />
              {/* Email principal de contato. */}
              <Field
                label={t.fields.email}
                value={resume.email}
                onChange={(value) => setRoot("email", value)}
                onBlur={() =>
                  setErrors((current) => ({
                    ...current,
                    email: validateEmailField(resume.email),
                  }))
                }
                placeholder={t.placeholders.email}
                type="email"
                required
                error={errors.email}
                errorMessage={errors.email ? t.validationInvalidEmail : ""}
                tooltip={t.help?.email}
              />
              {/* Cidade e localização. */}
              <Field
                label={t.fields.city}
                value={resume.city}
                onChange={(value) => setRoot("city", value)}
                placeholder={t.placeholders.city}
              />

              <fieldset className="phone-fieldset grid gap-3 md:col-span-2 md:grid-cols-[180px_120px_1fr] md:items-end">
                <legend className="sr-only">
                  {t.sections.profile} - {t.fields.phone}
                </legend>
                <Choice
                  label={t.fields.country}
                  value={resume.country}
                  onChange={(value) => setRoot("country", value)}
                  options={COUNTRIES}
                />
                <Field
                  label={phoneHint.areaLabel}
                  value={resume.area}
                  onChange={(value) => setRoot("area", value)}
                  placeholder={phoneHint.areaPlaceholder}
                  type="tel"
                  tooltip={t.help?.area}
                />
                <Field
                  label={t.fields.phone}
                  value={resume.phone}
                  onChange={(value) => setRoot("phone", value)}
                  placeholder={phoneHint.phonePlaceholder}
                  type="tel"
                  tooltip={t.help?.phone}
                />
              </fieldset>
            </div>

            {/* Links profissionais. */}
            <div className="mt-6 space-y-3">
              <p className="text-sm leading-6 text-zinc-400">
                {t.sectionHelp?.links}
              </p>
              {resume.links.length === 0 && <Empty text={t.empty} />}
              {resume.links.map((item) => (
                <ItemBlock
                  key={item.id}
                  title={
                    LINK_TYPES.find((entry) => entry.value === item.type)
                      ?.label || "Link"
                  }
                  subtitle={item.url}
                  removeLabel={t.remove}
                  onRemove={() => removeItem("links", item.id)}
                >
                  <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                    <Choice
                      label={t.fields.linkType}
                      value={item.type}
                      onChange={(value) =>
                        patchItem("links", item.id, "type", value)
                      }
                      options={LINK_TYPES}
                    />
                    <Field
                      label={t.fields.linkUrl}
                      value={item.url}
                      onChange={(value) =>
                        patchItem("links", item.id, "url", value)
                      }
                      placeholder={t.placeholders.linkUrl}
                    />
                  </div>
                </ItemBlock>
              ))}
              <AddButton
                onClick={() => addItem("links")}
                ariaLabel={`${t.add} Link`}
              >
                {t.add}
              </AddButton>
            </div>
          </Section>

          {/* Resumo profissional. */}
          <Section id="story" active={active} title={t.sections.story}>
            <Area
              label={t.fields.summary}
              value={resume.summary}
              onChange={(value) => setRoot("summary", value)}
              placeholder={t.placeholders.summary}
              rows={9}
            />
          </Section>

          {/* Experiência profissional. */}
          <Section id="work" active={active} title={t.sections.work}>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-zinc-400">
                {t.sectionHelp?.work}
              </p>
              {resume.work.length === 0 && <Empty text={t.empty} />}
              {resume.work.map((item) => {
                const workRequired = true;
                return (
                  <ItemBlock
                    key={item.id}
                    title={item.position || t.fields.position}
                    subtitle={[item.company, joinDate(item, t.fields.current)]
                      .filter(Boolean)
                      .join(" | ")}
                    removeLabel={t.remove}
                    onRemove={() => removeItem("work", item.id)}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label={t.fields.position}
                        value={item.position}
                        onChange={(value) =>
                          patchItem("work", item.id, "position", value)
                        }
                        placeholder={t.placeholders.position}
                        required={workRequired}
                      />
                      <Field
                        label={t.fields.company}
                        value={item.company}
                        onChange={(value) =>
                          patchItem("work", item.id, "company", value)
                        }
                        placeholder={t.placeholders.company}
                        required={workRequired}
                      />
                      <Choice
                        label={t.fields.startMonth}
                        value={item.startMonth}
                        onChange={(value) =>
                          patchItem("work", item.id, "startMonth", value)
                        }
                        options={monthOptions}
                      />
                      <Field
                        label={t.fields.startYear}
                        value={item.startYear}
                        onChange={(value) =>
                          patchItem("work", item.id, "startYear", value)
                        }
                        placeholder={t.placeholders.startYear}
                        type="number"
                      />
                      {!item.current && (
                        <>
                          <Choice
                            label={t.fields.endMonth}
                            value={item.endMonth}
                            onChange={(value) =>
                              patchItem("work", item.id, "endMonth", value)
                            }
                            options={monthOptions}
                          />
                          <Field
                            label={t.fields.endYear}
                            value={item.endYear}
                            onChange={(value) =>
                              patchItem("work", item.id, "endYear", value)
                            }
                            placeholder={t.placeholders.endYear}
                            type="number"
                          />
                        </>
                      )}
                      <Toggle
                        label={t.fields.current}
                        checked={item.current}
                        onChange={(value) =>
                          patchItem("work", item.id, "current", value)
                        }
                      />
                      <Field
                        label={t.fields.stack}
                        value={item.stack}
                        onChange={(value) =>
                          patchItem("work", item.id, "stack", value)
                        }
                        placeholder={t.placeholders.stack}
                        tooltip={t.help?.stack}
                      />
                    </div>
                    <Area
                      className="mt-4"
                      label={t.fields.duties}
                      value={item.duties}
                      onChange={(value) =>
                        patchItem("work", item.id, "duties", value)
                      }
                      placeholder={t.placeholders.duties}
                      tooltip={t.help?.duties}
                    />
                    <Area
                      className="mt-4"
                      label={t.fields.wins}
                      value={item.wins}
                      onChange={(value) =>
                        patchItem("work", item.id, "wins", value)
                      }
                      placeholder={t.placeholders.wins}
                      tooltip={t.help?.wins}
                    />
                  </ItemBlock>
                );
              })}
              <AddButton
                onClick={() => addItem("work")}
                ariaLabel={`${t.add} ${t.sections.work}`}
              >
                {t.add}
              </AddButton>
            </div>
          </Section>

          {/* Formação acadêmica. */}
          <Section id="education" active={active} title={t.sections.education}>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-zinc-400">
                {t.sectionHelp?.education}
              </p>
              {resume.education.length === 0 && <Empty text={t.empty} />}
              {resume.education.map((item) => {
                const educationRequired = true;
                const endDateRequired = item.status !== "doing";
                return (
                  <ItemBlock
                    key={item.id}
                    title={item.course || t.fields.course}
                    subtitle={item.school}
                    removeLabel={t.remove}
                    onRemove={() => removeItem("education", item.id)}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Choice
                        label={t.fields.degreeType}
                        value={item.type}
                        onChange={(value) =>
                          patchItem("education", item.id, "type", value)
                        }
                        options={typeOptions}
                        required={educationRequired}
                      />
                      <Field
                        label={t.fields.course}
                        value={item.course}
                        onChange={(value) =>
                          patchItem("education", item.id, "course", value)
                        }
                        placeholder={t.placeholders.course}
                        required={educationRequired}
                      />
                      <Field
                        label={t.fields.school}
                        value={item.school}
                        onChange={(value) =>
                          patchItem("education", item.id, "school", value)
                        }
                        placeholder={t.placeholders.school}
                        required={educationRequired}
                      />
                      <Choice
                        label={t.fields.status}
                        value={item.status}
                        onChange={(value) =>
                          patchItem("education", item.id, "status", value)
                        }
                        options={statusOptions}
                        required={educationRequired}
                      />
                      <Choice
                        label={t.fields.startMonth}
                        value={item.startMonth}
                        onChange={(value) =>
                          patchItem("education", item.id, "startMonth", value)
                        }
                        options={monthOptions}
                        required={educationRequired}
                      />
                      <Field
                        label={t.fields.startYear}
                        value={item.startYear}
                        onChange={(value) =>
                          patchItem("education", item.id, "startYear", value)
                        }
                        placeholder={t.placeholders.startYear}
                        type="number"
                        required={educationRequired}
                      />
                      {item.status !== "doing" && (
                        <>
                          <Choice
                            label={t.fields.endMonth}
                            value={item.endMonth}
                            onChange={(value) =>
                              patchItem("education", item.id, "endMonth", value)
                            }
                            options={monthOptions}
                            required={endDateRequired}
                          />
                          <Field
                            label={t.fields.endYear}
                            value={item.endYear}
                            onChange={(value) =>
                              patchItem("education", item.id, "endYear", value)
                            }
                            placeholder={t.placeholders.endYear}
                            type="number"
                            required={endDateRequired}
                          />
                        </>
                      )}
                    </div>
                    <Area
                      className="mt-4"
                      label={t.fields.notes}
                      value={item.notes}
                      onChange={(value) =>
                        patchItem("education", item.id, "notes", value)
                      }
                      placeholder={t.placeholders.notes}
                      tooltip={t.help?.notes}
                    />
                  </ItemBlock>
                );
              })}
              <AddButton
                onClick={() => addItem("education")}
                ariaLabel={`${t.add} ${t.sections.education}`}
              >
                {t.add}
              </AddButton>
            </div>
          </Section>

          {/* Habilidades. */}
          <Section id="skills" active={active} title={t.sections.skills}>
            <p className="mb-2 text-xs text-zinc-500">{t.skillsInstruction}</p>
            <Area
              label={t.fields.skills}
              value={skillsDraft}
              onChange={updateSkills}
              onFocus={() => setIsEditingSkills(true)}
              onBlur={() => setIsEditingSkills(false)}
              placeholder={t.placeholders.skills}
              rows={5}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {resume.skills.length === 0 && (
                <span className="text-sm text-zinc-500">{t.empty}</span>
              )}
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-purple-500/40 bg-purple-950/50 px-3 py-1 text-sm text-purple-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          {/* Idiomas. */}
          <Section id="languages" active={active} title={t.sections.languages}>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-zinc-400">
                {t.sectionHelp?.languages}
              </p>
              {resume.languages.length === 0 && <Empty text={t.empty} />}
              {resume.languages.map((item) => (
                <ItemBlock
                  key={item.id}
                  title={item.name || t.fields.languageName}
                  subtitle={item.level}
                  removeLabel={t.remove}
                  onRemove={() => removeItem("languages", item.id)}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label={t.fields.languageName}
                      value={item.name}
                      onChange={(value) =>
                        patchItem("languages", item.id, "name", value)
                      }
                      placeholder={t.placeholders.languageName}
                      required
                    />
                    <Choice
                      label={t.fields.level}
                      value={item.level}
                      onChange={(value) =>
                        patchItem("languages", item.id, "level", value)
                      }
                      options={levelOptions}
                      required
                    />
                  </div>
                </ItemBlock>
              ))}
              <AddButton
                onClick={() => addItem("languages")}
                ariaLabel={`${t.add} ${t.sections.languages}`}
              >
                {t.add}
              </AddButton>
            </div>
          </Section>

          {/* Certificados e cursos. */}
          <Section
            id="certificates"
            active={active}
            title={t.sections.certificates}
          >
            <div className="space-y-4">
              <p className="text-sm leading-6 text-zinc-400">
                {t.sectionHelp?.certificates}
              </p>
              {resume.certificates.length === 0 && <Empty text={t.empty} />}
              {resume.certificates.map((item) => {
                const certificateRequired = true;
                return (
                  <ItemBlock
                    key={item.id}
                    title={item.name || t.fields.certificate}
                    subtitle={[item.issuer, item.date]
                      .filter(Boolean)
                      .join(" | ")}
                    removeLabel={t.remove}
                    onRemove={() => removeItem("certificates", item.id)}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label={t.fields.certificate}
                        value={item.name}
                        onChange={(value) =>
                          patchItem("certificates", item.id, "name", value)
                        }
                        placeholder={t.placeholders.certificate}
                        required={certificateRequired}
                      />
                      <Field
                        label={t.fields.issuer}
                        value={item.issuer}
                        onChange={(value) =>
                          patchItem("certificates", item.id, "issuer", value)
                        }
                        placeholder={t.placeholders.issuer}
                        required={certificateRequired}
                      />
                      <Field
                        label={t.fields.date}
                        value={item.date}
                        onChange={(value) =>
                          patchItem("certificates", item.id, "date", value)
                        }
                        placeholder={t.placeholders.date}
                        required={certificateRequired}
                      />
                      <Field
                        label={t.fields.hours}
                        value={item.hours}
                        onChange={(value) =>
                          patchItem("certificates", item.id, "hours", value)
                        }
                        placeholder={t.placeholders.hours}
                        required={certificateRequired}
                      />
                      <Field
                        className="md:col-span-2"
                        label={t.fields.proof}
                        value={item.proof}
                        onChange={(value) =>
                          patchItem("certificates", item.id, "proof", value)
                        }
                        placeholder={t.placeholders.proof}
                      />
                    </div>
                    <Area
                      className="mt-4"
                      label={t.fields.notes}
                      value={item.notes}
                      onChange={(value) =>
                        patchItem("certificates", item.id, "notes", value)
                      }
                      placeholder={t.placeholders.notes}
                      tooltip={t.help?.notes}
                    />
                  </ItemBlock>
                );
              })}
              <AddButton
                onClick={() => addItem("certificates")}
                ariaLabel={`${t.add} ${t.sections.certificates}`}
              >
                {t.add}
              </AddButton>
            </div>
          </Section>

          <div className="desktop-wizard-actions mt-5 hidden flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              onClick={handleWizardBack}
              disabled={isFirstStep}
              className="min-h-[42px] rounded-md border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t.wizard.back}
            </button>
            <span className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {t.wizard.step} {activeStepIndex + 1}/{TABS.length}
            </span>
            <button
              type="button"
              onClick={handleWizardNext}
              disabled={isLastStep}
              className="min-h-[42px] rounded-md bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t.wizard.next}
            </button>
          </div>
        </div>

        {/* Painel lateral com score e dicas. */}
        <aside className="sidebar-aside space-y-4 lg:sticky lg:top-6 lg:self-start">
          {canShowExport && (
            <div className="rounded-lg border border-purple-500/80 bg-purple-950/50 p-4 shadow-2xl shadow-purple-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-200">
                {t.generate}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">
                {t.wizard.exportReady}
              </p>
              <div className="mt-4 grid gap-3">
                <Choice
                  label={t.exportType}
                  value={exportType}
                  onChange={setExportType}
                  options={[
                    { value: "pdf", label: t.exportPdf },
                    { value: "word", label: t.exportWord },
                  ]}
                />
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isBusy}
                  className="min-h-[46px] rounded-md bg-purple-500 px-5 text-sm font-bold text-white shadow-lg shadow-purple-900/60 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {buttonText}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-300 transition-opacity">
              {isSaving ? t.savingState : t.saveState}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric
                value={`${score}/7`}
                label="Score"
                tooltip={t.scoreTooltip}
              />
              <Metric value={resume.work.length} label={t.sections.work} />
              <Metric value={resume.skills.length} label={t.sections.skills} />
              <Metric
                value={resume.certificates.length}
                label={t.sections.certificates}
              />
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="mt-5 flex min-h-[40px] w-full items-center justify-center rounded-md border border-red-900/40 bg-red-950/20 text-sm font-semibold text-red-400 transition hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              {t.clear}
            </button>
          </div>

          <div className="rounded-lg border border-purple-900/70 bg-purple-950/30 p-4">
            <p className="text-sm font-semibold text-purple-100">ATS</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-300">
              {t.tips.map((tip) => (
                <li key={tip} className="border-l border-purple-500 pl-3">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      <div className="mobile-wizard-bar fixed inset-x-0 bottom-0 z-50 border-t border-purple-900/70 bg-black/95 px-4 py-3 shadow-2xl shadow-purple-950/60 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={handleWizardBack}
            disabled={isFirstStep}
            className="min-h-[44px] rounded-md border border-purple-800/70 px-4 text-sm font-semibold text-purple-100 transition hover:border-purple-500 hover:bg-purple-950/50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t.wizard.back}
          </button>
          <span className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
            {activeStepIndex + 1}/{TABS.length}
          </span>
          <button
            type="button"
            onClick={handleWizardNext}
            disabled={isLastStep}
            className="min-h-[44px] rounded-md bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t.wizard.next}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
