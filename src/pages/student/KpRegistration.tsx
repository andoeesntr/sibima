
import React from "react";
import { KpRegistrationForm } from "@/components/student/kp-registration/KpRegistrationForm";

const KpRegistrationPage = () => {
  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6">Formulir Pendaftaran KP</h2>
      <KpRegistrationForm />
    </div>
  );
};

export default KpRegistrationPage;
