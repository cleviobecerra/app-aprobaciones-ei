"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  id?: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
};

export function PasswordInput({
  id = "password",
  name = "password",
  required,
  defaultValue,
  placeholder,
  autoComplete,
  className = "ui-input pr-11",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete ?? (name === "password" ? "current-password" : "new-password")}
        className={className}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="ui-iconbtn absolute top-1/2 right-1 h-8 w-8 min-h-8 min-w-8 -translate-y-1/2"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
