import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getPasswordChecks, getPasswordStrength } from "../../utils/passwordUtils";

const PasswordField = ({
  autoComplete,
  label = "Password",
  name = "password",
  onChange,
  placeholder,
  value,
}) => {
  const [visible, setVisible] = useState(false);
  const inputId = `${name}-field`;
  const buttonLabel = visible ? `Hide ${label}` : `Show ${label}`;
  const type = visible ? "text" : "password";

  return (
    <label htmlFor={inputId}>
      {label}
      <span className="password-input">
        <input
          autoComplete={autoComplete}
          id={inputId}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required
          type={type}
          value={value}
        />
        <button
          aria-label={buttonLabel}
          className="icon-button"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
        </button>
      </span>
    </label>
  );
};

export const PasswordStrength = ({ password, confirmPassword = "" }) => {
  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const hasConfirm = confirmPassword.length > 0;
  const matches = password && confirmPassword && password === confirmPassword;

  return (
    <div className="password-helper" aria-live="polite">
      <div className="strength-row">
        <span>Password Strength: {strength.label}</span>
        <div className="meter" aria-label={`Password strength ${strength.label}`}>
          <span style={{ width: `${strength.score}%` }} />
        </div>
      </div>
      <ul className="check-list">
        <li className={checks.length ? "pass" : ""}>8+ characters</li>
        <li className={checks.uppercase ? "pass" : ""}>Uppercase letter</li>
        <li className={checks.lowercase ? "pass" : ""}>Lowercase letter</li>
        <li className={checks.number ? "pass" : ""}>Number</li>
        <li className={checks.special ? "pass" : ""}>Special character</li>
        {hasConfirm ? (
          <li className={matches ? "pass" : "fail"}>
            {matches ? "Passwords match" : "Passwords do not match"}
          </li>
        ) : null}
      </ul>
    </div>
  );
};

export default PasswordField;
