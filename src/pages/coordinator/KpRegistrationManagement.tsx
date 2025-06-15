
import React from "react";
import FormBuilder from "@/components/coordinator/kp-registration/FormBuilder";
import KpRegistrationList from "@/components/coordinator/kp-registration/KpRegistrationList";

export default function KpRegistrationManagement() {
  return (
    <div className="p-8">
      <FormBuilder />
      <KpRegistrationList />
    </div>
  );
}
