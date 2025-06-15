
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Field types and their labels
const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown (Select)" },
  { value: "file", label: "File upload" },
];

type Option = { id?: string; value: string; label: string; order_index: number };

type Props = {
  field?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
};

const blankOption: Option = { value: "", label: "", order_index: 0 };

export default function FormFieldEditor({ field, onSave, onCancel }: Props) {
  const [type, setType] = useState(field?.field_type ?? "text");
  const [label, setLabel] = useState(field?.label ?? "");
  const [fieldKey, setFieldKey] = useState(field?.field_key ?? "");
  const [required, setRequired] = useState(!!field?.required);
  const [options, setOptions] = useState<Option[]>(field?.options ?? []);
  const [error, setError] = useState<string | null>(null);

  // Handle type change: clear options if no longer select
  useEffect(() => {
    if (type !== "select") setOptions([]);
  }, [type]);

  const canSave =
    label.trim().length > 0 &&
    fieldKey.trim().length > 0 &&
    (type !== "select" || options.length > 0);

  function handleSave() {
    if (!canSave) {
      setError("Lengkapi semua kolom");
      return;
    }
    setError(null);
    onSave({
      ...field,
      label: label.trim(),
      field_type: type,
      field_key: fieldKey.trim(),
      required,
      options: type === "select" ? options : [],
    });
  }

  function addOption() {
    setOptions((opts) => [
      ...opts,
      { ...blankOption, order_index: opts.length },
    ]);
  }
  function updateOption(idx: number, key: "label" | "value", val: string) {
    setOptions(opts =>
      opts.map((o, i) =>
        i === idx ? { ...o, [key]: val } : o
      )
    );
  }
  function removeOption(idx: number) {
    setOptions(opts => opts.filter((_, i) => i !== idx));
  }
  function moveOption(idx: number, up: boolean) {
    setOptions(opts => {
      const arr = [...opts];
      if (up && idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      if (!up && idx < arr.length - 1)
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      // re-index
      return arr.map((a, i) => ({ ...a, order_index: i }));
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3 w-full max-w-lg">
      <div>
        <label className="text-sm font-semibold">Label Pertanyaan</label>
        <Input value={label} onChange={e => setLabel(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-semibold">Tipe Field</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map(ft => (
              <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-semibold">Key Unik</label>
        <Input
          value={fieldKey}
          disabled={!!field} // do not allow change on edit
          onChange={e => setFieldKey(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          placeholder="Contoh: total_completed_credits"
        />
        <div className="text-xs text-gray-500">Gunakan huruf, angka, dan underscore saja. Dipakai untuk mapping jawaban.</div>
      </div>
      <div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
          Wajib diisi
        </label>
      </div>
      {type === "select" && (
        <div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">Pilihan Dropdown</span>
            <Button size="sm" type="button" onClick={addOption}>Tambah Pilihan</Button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {options.map((opt, i) => (
              <div className="flex gap-2 items-center" key={i}>
                <Input
                  placeholder="Label"
                  className="w-1/2"
                  value={opt.label}
                  onChange={e => updateOption(i, "label", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  className="w-1/3"
                  value={opt.value}
                  onChange={e => updateOption(i, "value", e.target.value)}
                />
                <Button size="icon" variant="ghost" type="button" onClick={() => moveOption(i, true)} disabled={i === 0}>↑</Button>
                <Button size="icon" variant="ghost" type="button" onClick={() => moveOption(i, false)} disabled={i === options.length - 1}>↓</Button>
                <Button size="icon" variant="destructive" type="button" onClick={() => removeOption(i)}>✕</Button>
              </div>
            ))}
            {options.length === 0 && <div className="text-xs text-gray-400">Belum ada pilihan.</div>}
          </div>
          <div className="text-xs text-gray-500 mt-1">Isikan label dan value untuk setiap pilihan.</div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex justify-end items-center gap-2 mt-3">
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={handleSave} disabled={!canSave}>Simpan</Button>
      </div>
    </div>
  );
}
