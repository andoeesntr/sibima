
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import FormFieldEditor from "./FormFieldEditor";

type Field = {
  id: string;
  label: string;
  field_type: string;
  field_key: string;
  required: boolean;
  order_index: number;
  options?: Option[];
};
type Option = { id?: string; value: string; label: string; order_index: number };

export default function FormBuilder() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<null | Field>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch fields and options
  async function fetchAll() {
    setLoading(true);
    // Fetch fields
    const { data, error } = await supabase
      .from("kp_form_fields")
      .select("*, id")
      .order("order_index", { ascending: true });
    if (error) { setLoading(false); return; }
    const fieldsData = data as Field[];
    // For each, fetch options if type === select
    for (const field of fieldsData) {
      if (field.field_type === "select") {
        const { data: optData } = await supabase
          .from("kp_form_options")
          .select("*")
          .eq("field_id", field.id)
          .order("order_index", { ascending: true });
        field.options = optData || [];
      }
    }
    setFields(fieldsData);
    setLoading(false);
  }
  useEffect(() => { fetchAll(); }, []);

  // CRUD
  async function handleSaveField(form: any) {
    setShowEditor(false);
    setEditing(null);
    setLoading(true);
    let res;
    if (form.id) {
      res = await supabase.from("kp_form_fields").update({
        label: form.label,
        field_type: form.field_type,
        required: form.required,
        updated_at: new Date().toISOString(),
      }).eq("id", form.id).select("id").single();
    } else {
      // order_index = fields.length (append at end)
      res = await supabase.from("kp_form_fields").insert({
        label: form.label,
        field_type: form.field_type,
        field_key: form.field_key,
        required: form.required,
        order_index: fields.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select("id").single();
    }
    if (res?.data?.id && form.field_type === "select" && Array.isArray(form.options)) {
      // Upsert all options: delete old, insert new
      await supabase.from("kp_form_options").delete().eq("field_id", res.data.id);
      for (const opt of form.options) {
        await supabase.from("kp_form_options").insert({
          label: opt.label,
          value: opt.value,
          order_index: opt.order_index,
          field_id: res.data.id,
        });
      }
    }
    fetchAll();
  }

  async function handleDeleteField(id: string) {
    if (!window.confirm("Hapus pertanyaan ini?")) return;
    await supabase.from("kp_form_fields").delete().eq("id", id);
    fetchAll();
  }

  async function handleReorder(idx: number, up: boolean) {
    if (idx < 0 || idx >= fields.length) return;
    // Swap order_index between fields[idx] and its neighbor
    const otherIdx = up ? idx - 1 : idx + 1;
    if (otherIdx < 0 || otherIdx >= fields.length) return;
    const f1 = fields[idx], f2 = fields[otherIdx];
    await supabase.from("kp_form_fields").update({ order_index: otherIdx }).eq("id", f1.id);
    await supabase.from("kp_form_fields").update({ order_index: idx }).eq("id", f2.id);
    fetchAll();
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-xl">Form Builder Pendaftaran KP</h3>
        <Button onClick={() => { setEditing(null); setShowEditor(true); }}>
          + Tambah Pertanyaan
        </Button>
      </div>
      {showEditor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <FormFieldEditor
            field={editing || undefined}
            onSave={handleSaveField}
            onCancel={() => { setEditing(null); setShowEditor(false); }}
          />
        </div>
      )}
      {loading ? (
        <div>Memuat...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => (
            <div className="p-3 border rounded-lg flex items-center gap-2 bg-white" key={field.id}>
              <span className="flex-1">
                <b>{field.label}</b> (<span className="italic">{field.field_type}</span>)
                {field.required && <span className="ml-2 text-green-600 font-medium">* wajib</span>}
                <span className="block text-xs text-gray-500">Key: {field.field_key}</span>
                {field.field_type === "select" && field.options?.length > 0 && (
                  <span className="block text-xs text-gray-600">
                    Pilihan: {field.options.map(opt => opt.label).join(", ")}
                  </span>
                )}
              </span>
              <Button size="icon" variant="outline" onClick={() => { setEditing(field); setShowEditor(true); }}>✎</Button>
              <Button size="icon" variant="destructive" onClick={() => handleDeleteField(field.id)}>✕</Button>
              <Button size="icon" variant="ghost" onClick={() => handleReorder(idx, true)} disabled={idx === 0}>↑</Button>
              <Button size="icon" variant="ghost" onClick={() => handleReorder(idx, false)} disabled={idx === fields.length - 1}>↓</Button>
            </div>
          ))}
          {fields.length === 0 && <div className="text-gray-400 italic">Belum ada pertanyaan.</div>}
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold mb-2">Preview Form Mahasiswa</h4>
        <div className="space-y-3">
          {fields.map(field => (
            <FieldPreview key={field.id} field={field} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Renders a mock preview of the field (just UI, not inputting for now)
function FieldPreview({ field }: { field: any }) {
  return (
    <div>
      <label className="font-medium">
        {field.label}
        {field.required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {field.field_type === "select" && Array.isArray(field.options) ? (
        <select className="block w-full border rounded px-2 py-1 mt-1 bg-gray-100">
          <option>Pilih...</option>
          {field.options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : field.field_type === "textarea" ? (
        <textarea className="block w-full border rounded px-2 py-1 mt-1 bg-gray-100" disabled placeholder="Isi jawaban..." />
      ) : field.field_type === "number" ? (
        <input type="number" className="block w-full border rounded px-2 py-1 mt-1 bg-gray-100" disabled placeholder="Input angka" />
      ) : field.field_type === "file" ? (
        <input type="file" className="block w-full" disabled />
      ) : (
        <input type="text" className="block w-full border rounded px-2 py-1 mt-1 bg-gray-100" disabled placeholder="Isi jawaban..." />
      )}
    </div>
  );
}
