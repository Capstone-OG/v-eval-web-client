import { getFormFieldError } from '../../utils/formValidation';
import { toast } from '../../context/ToastContext';

export default function FormValidationBoundary({ children }) {
  return <div className="contents" onSubmitCapture={event => {
    const form = event.target;
    if (form.tagName !== 'FORM') return;
    for (const field of Array.from(form.elements)) {
      const message = getFormFieldError(field);
      if (!message) continue;
      event.preventDefault();
      event.stopPropagation();
      field.setCustomValidity(message);
      field.reportValidity();
      field.focus();
      toast.error(message);
      // Do not leave custom validity behind: subsequent native submits must reach this guard.
      field.setCustomValidity('');
      return;
    }
  }}>{children}</div>;
}
