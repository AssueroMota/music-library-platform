import { useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export function LibrarySelect({
  label,
  className = '',
  children,
  id: providedId,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  return (
    <div className={`library-select ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className="library-select-control">
        <select id={id} {...props}>
          {children}
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
    </div>
  )
}
