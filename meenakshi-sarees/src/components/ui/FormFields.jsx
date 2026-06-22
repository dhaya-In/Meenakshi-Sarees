// components/ui/FormFields.jsx

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-charcoal-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? "border-red-400 focus:border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options = [], className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-charcoal-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`input-field ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-charcoal-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`input-field resize-none ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
