// Labelled text input used by the auth forms (and reusable elsewhere).
export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  autoComplete,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
      />
    </label>
  )
}
