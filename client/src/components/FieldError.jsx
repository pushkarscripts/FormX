export default function FieldError({ children }) {
  return children ? <p className="mt-1 text-sm text-red-600">{children}</p> : null;
}
