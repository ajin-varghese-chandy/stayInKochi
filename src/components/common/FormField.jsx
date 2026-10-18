// Labelled input used by the auth forms and other simple forms.
// Styling comes from the .field / .field-label classes in index.css so every
// input, select, and textarea in the product matches.
export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  autoComplete,
  placeholder,
  hint,
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="field"
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}
