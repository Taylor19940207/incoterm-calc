import React, { memo } from 'react';

interface InputFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  unit?: string;
  step?: number;
  min?: number;
  disabled?: boolean;
  note?: string;
  type?: string;
  className?: string;
}

const InputField = memo<InputFieldProps>(({
  name,
  label,
  value,
  onChange,
  unit = "",
  step = 0.01,
  min = 0,
  disabled = false,
  note,
  type = "number",
  className = ""
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm text-gray-600">{label}</label>
      <div className="relative">
        <input
          type={type}
          step={step}
          min={min}
          disabled={disabled}
          className={`w-full rounded-2xl border px-3 py-2 pr-12 ${
            disabled ? "bg-gray-100 text-gray-400" : ""
          }`}
          value={value}
          onChange={handleChange}
          placeholder="0"
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
        )}
      </div>
      {note && <div className="text-xs text-gray-400">{note}</div>}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
