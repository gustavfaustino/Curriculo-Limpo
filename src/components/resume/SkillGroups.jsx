import React, { useEffect, useState } from "react";
import { Field } from "../ui/Field";
import { Area } from "../ui/Area";
import { IconButton } from "../ui/Buttons";
import { createId, reorder } from "../../utils/helpers";

export function SkillGroups({ groups, onChange, t }) {
  const [drafts, setDrafts] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Mantém o rascunho de texto de cada separador sincronizado com o
  // currículo salvo, exceto o grupo em edição no momento.
  useEffect(() => {
    setDrafts((current) => {
      const next = { ...current };
      groups.forEach((group) => {
        if (editingId !== group.id) {
          next[group.id] = (group.skills || []).join(", ");
        }
      });
      return next;
    });
  }, [groups, editingId]);

  const updateGroup = (id, patch) => {
    onChange(groups.map((group) => (group.id === id ? { ...group, ...patch } : group)));
  };

  const updateGroupSkills = (id, value) => {
    setDrafts((current) => ({ ...current, [id]: value }));
    const skills = value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    updateGroup(id, { skills });
  };

  const removeGroup = (id) => {
    onChange(groups.filter((group) => group.id !== id));
  };

  const addGroup = () => {
    onChange([...groups, { id: createId(), title: "", skills: [] }]);
  };

  const moveGroup = (index, direction) => {
    onChange(reorder(groups, index, direction));
  };

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t.skillsGroupsHelp}
      </p>

      {groups.map((group, index) => (
        <div
          key={group.id}
          className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black/60"
        >
          <div className="mb-3 flex items-start gap-3">
            <Field
              className="flex-1"
              label={t.groupTitleLabel}
              value={group.title}
              onChange={(value) => updateGroup(group.id, { title: value })}
              placeholder={t.groupTitlePlaceholder}
              maxLength={40}
            />
            <div className="mt-7 flex items-center gap-1" role="group" aria-label={t.moveUp}>
              <IconButton
                onClick={() => moveGroup(index, -1)}
                disabled={index === 0}
                ariaLabel={t.moveUp}
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M10 5.5a1 1 0 01.7.3l4.5 4.5a1 1 0 11-1.4 1.4L10 7.9l-3.8 3.8a1 1 0 11-1.4-1.4l4.5-4.5a1 1 0 01.7-.3z" />
                </svg>
              </IconButton>
              <IconButton
                onClick={() => moveGroup(index, 1)}
                disabled={index === groups.length - 1}
                ariaLabel={t.moveDown}
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M10 14.5a1 1 0 01-.7-.3l-4.5-4.5a1 1 0 111.4-1.4L10 12.1l3.8-3.8a1 1 0 111.4 1.4l-4.5 4.5a1 1 0 01-.7.3z" />
                </svg>
              </IconButton>
            </div>
            <IconButton
              onClick={() => removeGroup(group.id)}
              ariaLabel={t.removeGroup}
              title={t.removeGroup}
              variant="danger"
              className="mt-7"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
          <Area
            label={t.fields.skills}
            value={drafts[group.id] ?? ""}
            onChange={(value) => updateGroupSkills(group.id, value)}
            onFocus={() => setEditingId(group.id)}
            onBlur={() => setEditingId(null)}
            placeholder={t.placeholders.skills}
            rows={3}
          />
          {group.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-sm text-purple-800 dark:border-purple-500/40 dark:bg-purple-950/50 dark:text-purple-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="min-h-[42px] rounded-md border border-dashed border-purple-400 px-4 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-500/60 dark:text-purple-200 dark:hover:bg-purple-950/40"
      >
        + {t.addGroup}
      </button>
    </div>
  );
}
